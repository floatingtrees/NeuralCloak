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



def parallelized_generate(image, negative_text_list, positive_text_list, shm_name, tasks):
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
    model = tasks[model_name]
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

    

    # write to shared memory

    image = to_tensor(image).unsqueeze(0)
    image_input = image.clone().detach().to(device)
    image_output, _ = attack.parallel_attack(all_models, image, negative_text_list, positive_text_list, shm_name, tasks, device)
    if image_output == "canceled":
        try: # we don't know for sure if this side will close the shm before the server code
            shm = shared_memory.SharedMemory(name=shm_name)
            shm.close()
            shm.unlink()
        except Exception as e:
            print("Generation", e) 
        exit()
    converted_image = convertToImage(image_output)


    shm = shared_memory.SharedMemory(name=shm_name)
    img_array = np.array(converted_image)
    shm_array = np.ndarray(img_array.shape, dtype=img_array.dtype, buffer=shm.buf)
    np.copyto(shm_array, img_array)
    tasks[shm_name] = img_array.shape
    shm.close()
    



if __name__ == '__main__':
    src_img = Image.open("sharkDemo2.png")
    tasks = dict()
    model1, _ = clip.load('ViT-B/32')
    tasks['ViT-B/32'] = model1
    model2 , _ = clip.load('RN50')
    tasks['RN50'] = model2


    negative_text_list = ["great white shark", "shark in the ocean", "marine life"]
    positive_text_list = ["potato"]
    queue = Queue()
    shm = shared_memory.SharedMemory(create = True, size = 100000000)
    p = Process(target = parallelized_generate, args = (src_img, negative_text_list, positive_text_list, shm.name, tasks))
    p.start()
    p.join()
    print("HI")
    print(tasks.keys())
    last_item = tasks[shm.name]
    if type(last_item) is int:
        pass
    else:
        #shm = shared_memory.SharedMemory(name=shm_name) 
        shape = last_item
        buffer = BytesIO()
            
            
        buffer.seek(0)

        shm_array = np.ndarray(shape, dtype=np.uint8, buffer=shm.buf)
        converted_image = Image.fromarray(shm_array)
        converted_image.save("temp.png")
        converted_image.save(buffer, format='PNG')
        encoded_string = base64.b64encode(buffer.getvalue()).decode()
    shm.close()
    shm.unlink()
