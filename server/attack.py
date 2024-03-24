import os
import clip
from torchvision.datasets import CIFAR100
import torch
from PIL import Image
from torchvision import transforms
import torchvision
import numpy as np
from multiprocessing import Process, Queue
import clip
import timm

def tanh(noise):
    ex = torch.exp(noise)
    ex_inv = torch.exp(-noise)
    return ((ex - ex_inv) / (ex + ex_inv))

def parallel_attack(task, r, all_models, image, negative_text_list, positive_text_list, device, task_id, max_epochs = 100, similarity = 0.1, epsilon = 0.001, shift = 1):
    noise = torch.zeros(image.shape, dtype = torch.float32)
    noise.requires_grad = True
    optimizer = torch.optim.Adam(list([noise, ]), lr = 0.006, betas = (0.9, 0.999), maximize = False)
    if shift == 0:
        raise ValueError("Shift cannot equal zero")
    with torch.no_grad():
        batch = image.shape[0]
        x = image.shape[2]
        y = image.shape[3]
        color_map = torch.zeros((batch, 3, x + 2 * shift,y + 2 * shift)).to(device)
        color_map_base = color_map.clone().detach()
        color_map_base[:, :, shift:x + shift, shift:y+shift] = image
        for i in range(2 * shift):
            for j in range(2 * shift):
                temp = torch.zeros((color_map.shape)).to(device)
                temp[:, :, i:x + i, j:y+j] = image
                diff = torch.abs(color_map_base - temp)
                color_map += diff
        color_map = color_map[:, :, shift:-shift, shift:-shift] / torch.square(torch.tensor(2 * shift)) * 255

    image2 = np.array(color_map.clone().detach().to("cpu"))
    image2 = image2[0, :, :, :]
    image2 = np.transpose(image2, (1, 2, 0))
    image2 = Image.fromarray((image2 * 255).astype(np.uint8))
    image2.save(f"map.jpg")
    binary_map = torch.heaviside(torch.sum(color_map - epsilon, axis = 1).to("cpu"), torch.tensor(0.0)) # linear max
    if (torch.quantile(binary_map, 0.05) > 0.5 or torch.quantile(binary_map, 0.99) > 0.5):
        diff_sparse = False
        similarity = similarity / torch.sum(binary_map) * torch.numel(binary_map)
    else:
        diff_sparse = True
    # If not cloned, loss must retain graph to
    samples_per_batch = negative_text_list.shape[0] + positive_text_list.shape[0]
    total_samples = len(all_models) * samples_per_batch
    original = image.clone().detach()
    c_origin = 1e+3
    c = c_origin
    penal_constant = 1
    k = penal_constant
    # deal with issues for problems like all same color or 95%+ came color
    for i in range(1, max_epochs + 1):
        if i % 10 == 0:
            print(i)
        k -= (penal_constant / max_epochs) / 1.3
        c -= c_origin / max_epochs
        optimizer.zero_grad()
        if diff_sparse: # if everything 95%+ of the map is nonzero ignore it
            image_input = image + similarity * tanh(noise)
        else:
            image_input = image + similarity * torch.multiply(tanh(noise), binary_map)
        #image_input = torch.clip(image_input, 0, 1)
        output_array = torch.zeros((total_samples, 1))
        for j, key in enumerate(all_models.keys()):
            model_stats = all_models[key]
            model = model_stats["model"]
            transformed = model_stats["transform"](image_input).to(device)
            negative_text_features = model_stats["negative"]
            positive_text_features = model_stats["positive"]


            image_features = model.encode_image(transformed)
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            # Compute similarity
            x1 = negative_text_features @ image_features.T
            x2 = positive_text_features @ image_features.T


            x2 = 1 - torch.square(x2) * torch.sign(x2) # use trig identities to compute inverse similarity
            model_output = torch.concatenate([x1, x2], dim = 0)
            output_array[samples_per_batch * j : samples_per_batch * (j + 1), :] = model_output

        to_probs = torch.abs(tanh(noise))
        clipped = torch.maximum(to_probs - k, torch.tensor(0.0))
        y = torch.mean(output_array, dim = None, keepdim = True) + c * torch.mean(torch.square(noise)) + torch.sum(clipped)
        if y < 0.2:
            break
        y.backward() #
        optimizer.step()
        task.update_state(state='PROGRESS', meta={'current': i, 'total': 100})
        status = r.get(f'task:{task_id}')
        if status == b'canceled':
            return "canceled"

    if diff_sparse: # if everything 95%+ of the map is nonzero ignore it
        image_input = image + similarity * tanh(noise)
    else:
        image_input = image + similarity * torch.multiply(tanh(noise), binary_map)
    image_input = torch.clip(image_input, 0, 1)
    return image_input
