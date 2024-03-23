import torch
from PIL import Image
import attack
import clip
from torchvision import transforms
import torchvision
import numpy as np
from multiprocessing import Process, Queue, shared_memory
from io import BytesIO
import base64
from celery.contrib.abortable import AbortableTask
from celery import Celery
import redis
import os

REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

app = Celery('tasks', broker=REDIS_URL)
app.conf.result_backend = REDIS_URL
app.conf.task_serializer = 'json'

# For the Redis client, parse the REDIS_URL or use default values
r = redis.Redis.from_url(REDIS_URL)


def encode_text(model, negative_text_list, positive_text_list, device):
    negative_text_inputs = torch.cat([clip.tokenize(text) for text in negative_text_list])
    positive_text_inputs = torch.cat([clip.tokenize(text) for text in positive_text_list])

    # optimize the image away from negative
    negative_text_features = model.encode_text(negative_text_inputs.to(device))
    negative_text_features = negative_text_features / negative_text_features.norm(dim=-1, keepdim=True)


    # optimize the image towards positive
    positive_text_features = model.encode_text(positive_text_inputs.to(device))
    positive_text_features = positive_text_features / positive_text_features.norm(dim=-1, keepdim=True)

     # Clone and detach tensors to use as base of graph so the model operations aren't tracked
    return negative_text_features.clone().detach(), positive_text_features.clone().detach()

def convertToImage(tensor):
    image = tensor[0, :, :, :].detach().numpy()
    image = np.transpose(image, (1, 2, 0))
    return Image.fromarray((image * 255).astype(np.uint8))


@app.task(name='parallelized_generate', bind=True)
def parallelized_generate(self, image_data, negative_text_list, positive_text_list):
    decoded_image = base64.b64decode(image_data)

    image = Image.open(BytesIO(decoded_image))
    image = image.convert('RGB')
    if torch.backends.mps.is_available():
        device = "mps"
    elif torch.cuda.is_available():
        device = "cuda"
    else:
        device = "cpu"
    to_tensor = transforms.Compose([transforms.ToTensor()])
    all_models = {}
    #ViT
    model_name = 'ViT-B/32'
    model, _ = clip.load('ViT-B/32')
    model.eval().to(device)
    ViT_B32 = transforms.Compose([
            torchvision.transforms.Resize(224,  interpolation=torchvision.transforms.InterpolationMode.BICUBIC, antialias = True),
            transforms.CenterCrop(224),
            transforms.Normalize(mean=(0.48145466, 0.4578275, 0.40821073), std=(0.26862954, 0.26130258, 0.27577711))])
    negative, positive = encode_text(model, negative_text_list, positive_text_list, device)
    model_stats = {"model_name" : model_name, "model" : model,
                "transform" : ViT_B32, "positive" : positive, "negative" : negative}
    all_models[model_name] = model_stats

    #Resnet 50
    '''
    model_name = 'RN50'
    model = tasks[model_name]
    model.eval().to(device)
    RN50 = transforms.Compose([
            torchvision.transforms.Resize(224,  interpolation=torchvision.transforms.InterpolationMode.BICUBIC, antialias = True),
            transforms.CenterCrop(224),
            transforms.Normalize(mean=(0.48145466, 0.4578275, 0.40821073), std=(0.26862954, 0.26130258, 0.27577711))])
    negative, positive = encode_text(model, negative_text_list, positive_text_list, device)

    model_stats = {"model_name" : model_name, "model" : model,
                "transform" : RN50, "positive" : positive, "negative" : negative}
    all_models[model_name] = model_stats
'''


    image = to_tensor(image).unsqueeze(0)
    image_input = image.clone().detach().to(device)


    task_id = self.request.id
    image_output = attack.parallel_attack(self, r, all_models, image, negative, positive, device, task_id)
    if image_output == 'canceled':
        return "canceled"
    total_probs = {}
    transformed = ViT_B32(image_output).to(device)
    model.to(device)
    image_features = model.encode_image(transformed)
    image_features = image_features / image_features.norm(dim=-1, keepdim=True)
    for i, text in enumerate(negative_text_list + positive_text_list):
        with torch.no_grad():
            encoding = torch.cat([clip.tokenize(text)]).to(device)
            features = model.encode_text(encoding)
            text_features = features / features.norm(dim = -1)
            similarity = image_features @ text_features.T
        print(f"{text}: {round(float(similarity), 3)}")

    converted_image = convertToImage(image_output)
    buffer = BytesIO()

    buffer.seek(0)

    converted_image.save("temp2.png")
    converted_image.save(buffer, format='PNG')
    encoded_string = base64.b64encode(buffer.getvalue()).decode()

    return encoded_string
