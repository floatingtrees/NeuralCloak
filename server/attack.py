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

def parallel_attack(all_models, image, negative_text_list, positive_text_list, shm_name, tasks, device, max_epochs = 100):
    image_input = image
    image_input.requires_grad = True
    optimizer = torch.optim.Adam(list([image_input, ]), lr = 0.0005, betas = (0.9, 0.999), maximize = False)
    
    # If not cloned, loss must retain graph to 
    samples_per_batch = len(negative_text_list) + len(positive_text_list)
    total_samples = len(all_models) * samples_per_batch
    for i in range(1, max_epochs + 1):
        optimizer.zero_grad()
        print(f"EPOCH{i}")
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


            x2 = 1 - x2 # use trig identities to compute inverse similarity
            model_output = torch.concatenate([x1, x2], dim = 0)
            output_array[samples_per_batch * j : samples_per_batch * (j + 1), :] = model_output
        x = torch.mean(output_array, dim = None, keepdim = True)
        if x < 0.2:
            break
        x.backward() # 
        optimizer.step()
        if tasks[shm_name] == "canceled":
            return ("canceled", None)
        tasks[shm_name] = i
        print(f"EPOCH{i}b")
    
    gap = len(all_models)
    total_negatives = len(negative_text_list)
    total_probs = {}
    for i, text in enumerate(negative_text_list + positive_text_list):
        probs = 0
        for j in range(i, output_array.shape[0], len(negative_text_list) + len(positive_text_list)):
            if i >=total_negatives:
                probs += (1- output_array[j])
            else:
                probs +=  output_array[j]
            
        total_probs[text] = probs/gap


    return image_input, total_probs

