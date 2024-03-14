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

def parallel_attack(task, r, all_models, image, negative_text_list, positive_text_list, device, task_id, max_epochs = 100, similarity = 0.08):
    noise = torch.zeros(image.shape, dtype = torch.float32)
    noise.requires_grad = True
    optimizer = torch.optim.Adam(list([noise, ]), lr = 0.001, betas = (0.9, 0.999), maximize = False)


    # If not cloned, loss must retain graph to
    samples_per_batch = negative_text_list.shape[0] + positive_text_list.shape[0]
    total_samples = len(all_models) * samples_per_batch
    original = image.clone().detach()
    c_origin = 1e+3
    c = c_origin
    penal_constant = 1
    k = penal_constant
    for i in range(1, max_epochs + 1):
        k -= (penal_constant / max_epochs) / 1.3
        c -= c_origin / max_epochs
        optimizer.zero_grad()
        image_input = image + similarity * tanh(noise)
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

    ex = torch.exp(noise)
    ex_inv = torch.exp(-noise)
    image_input = image + similarity * ((ex - ex_inv) / (ex + ex_inv))
    return image_input
