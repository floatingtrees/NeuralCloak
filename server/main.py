#from flask import Flask, jsonify, request
#from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from PIL import Image
import generate
import base64
import uuid
import torch
import clip
import numpy as np
from multiprocessing import Process, Queue, shared_memory, Manager
from io import BytesIO
import threading
import inspect
from pydantic import BaseModel
import os
from contextlib import asynccontextmanager


import uvicorn

import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

class UploadRequest(BaseModel):
    image: str
    negative: list[str]
    positive: list[str]

@asynccontextmanager
async def lifespan(app: FastAPI):
    global manager, tasks
    manager = Manager()

    tasks = manager.dict()
    model1, _ = clip.load('ViT-B/32')
    tasks['ViT-B/32'] = model1
    #model2 , _ = clip.load('RN50')
    #tasks['RN50'] = model2
    yield

app = FastAPI(lifespan=lifespan)


origins = ["https://client-ey6altycha-wl.a.run.app", 
            "https://neuralcloak.com", 
            "http://localhost:3000"]
# Add CORSMiddleware to the application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)



ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}



def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def release_shared_memory(name):
    try:
        shm = shared_memory.SharedMemory(name=name)
        shm.close()
        shm.unlink()
        print(f"Released shared memory with name {name}")
    except FileNotFoundError:
        print(f"Shared memory with name {name} already released or not found.")

@app.post('/cancel_task/{task_id}')
def cancel_task(task_id):
    tasks[task_id] = "canceled"
    try:
        shm = shared_memory.SharedMemory(name=task_id) 
    except:
        return {'message' : "Task no longer exists"}
    try:
        shm.close()
        shm.unlink()
    except Exception as e:
        print(e)
    return {'message' : "Request successfully canceled"}

 
@app.get('/task_status/{task_id}')
def get_task_status(task_id):

    try:
        shm = shared_memory.SharedMemory(name=task_id) 
    except:
        return {'message' : "Request Timed Out"}
    last_item = tasks[task_id]
    if type(last_item) is int:
        return {"message" : "Finished", "iteration" : last_item}
    else:
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
        torch.cuda.empty_cache()
        return {"message" : "Finished", "iteration" : -1, "image" : encoded_string}


@app.post('/api/upload')
async def upload_file(data : UploadRequest):
    
    
    image_data = data.image

    negative_text_list = data.negative

    positive_text_list = data.positive

    image_data = image_data.split(",")[1]  # Remove the "data:image/png;base64," part

    task_id = str(uuid.uuid4())
    try:
        # Decode the Base64 string, making sure it is suitable for decoding

        decoded_image = base64.b64decode(image_data)

        img = Image.open(BytesIO(decoded_image))

        # Save the decoded image to a file or further processing
    except Exception as e:
        return {'error': 'Error decoding image', 'details': str(e)}
        # create a task and run the query function in a loop ######
        ######
    shm = shared_memory.SharedMemory(create = True, size = 100000000) # 10 MB of size
    p = Process(target = generate.parallelized_generate, args = (img, negative_text_list, positive_text_list, shm.name, tasks))
    p.start()
    tasks[shm.name] = 0
    delay = 3600
    timer = threading.Timer(delay, release_shared_memory, [shm.name])
    timer.start()
    primary = {'message': 'File uploaded successfully', 'task_id': shm.name}

    return primary

if __name__ == '__main__':
    
    #manager = Manager()

    #tasks = manager.dict()
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8080)), reload = True)