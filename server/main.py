#from flask import Flask, jsonify, request
#from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from PIL import Image
import generate
from generate import parallelized_generate
import base64
import uuid
import torch
import clip
import numpy as np
from io import BytesIO
import threading
import inspect
from pydantic import BaseModel
import os
from contextlib import asynccontextmanager
from celery.result import AsyncResult

import uvicorn
from celery.contrib.abortable import AbortableAsyncResult

import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

class UploadRequest(BaseModel):
    image: str
    negative: list[str]
    positive: list[str]

@asynccontextmanager
async def lifespan(app: FastAPI):
    #model1, _ = clip.load('ViT-B/32')
    #tasks['ViT-B/32'] = model1
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

@app.post('/cancel_task/{task_id}')
def cancel_task(task_id):
    generate.r.set(f'task:{task_id}', "canceled")
    
    return {'message' : "Request successfully canceled"}

 
@app.get('/task_status/{task_id}')
def get_task_status(task_id):

    try:
        task_result = AsyncResult(id=task_id, app=generate.app)
    except celery.exceptions.TaskRevokedError:
        return {"message" : "Task revoked"}
    if task_result.state == 'PENDING':
        return {"message" : "pending", 'iteration' : 0}
    elif task_result.state == 'PROGRESS':
        return {"message" : "progress", "iteration" : task_result.info["current"]}
    else:
        converted_image = task_result.get()
        torch.cuda.empty_cache()
        return {"message" : "Finished", "iteration" : -1, "image" : converted_image}


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
    
    task = parallelized_generate.apply_async(args = [image_data, negative_text_list, positive_text_list])
    task_id = task.id
    generate.r.set(f'task:{task_id}', "starting")
    primary = {'message': 'File uploaded successfully', 'task_id': task_id}

    return primary

if __name__ == '__main__':
    
    #manager = Manager()

    #tasks = manager.dict()
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8080)), reload = True)