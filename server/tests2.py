from celery import Celery
import time
from celery.contrib.abortable import AbortableTask


app = Celery('tasks', broker='redis://localhost:6379/0')

app.conf.result_backend = 'redis://localhost:6379/0'
app.conf.task_serializer = 'json'


@app.task(name='add')
def add(x, y):
    return x + y


@app.task(name='long_running_task', bind=True, base=AbortableTask)  # bind=True is necessary to access task instance (self)
def long_running_task(self, n):
    for i in range(n):
        # Simulating some work with a sleep
        time.sleep(1)
        self.update_state(state='PROGRESS', meta={'current': i, 'total': n})
    return 'Done'