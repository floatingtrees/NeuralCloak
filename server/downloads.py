import os
import clip
from torchvision.datasets import CIFAR100
import torch
from PIL import Image
from torchvision import transforms
import torchvision
import numpy as np
import clip
import timm

model_name = 'ViT-B/32'
model, _ = clip.load(model_name)
model.eval()


#model_name = 'RN50'
#model, _ = clip.load(model_name)
#model.eval()
