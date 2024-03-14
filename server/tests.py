from tests2 import long_running_task, app
import tests2
import time
from celery.result import AsyncResult
from celery.contrib.abortable import AbortableAsyncResult


# Start the long-running task
task_id = 'your-task-id-here'
task = long_running_task.apply_async(args=[10])  # Example with n=10


count = 0
while not task.ready():
    task_result = AbortableAsyncResult(id=task.id, app=app)
    task_result.abort()
    if task.state == 'PROGRESS':
        progress = task.info  # task.info contains the dict passed to update_state

    if count == 5:
        app.control.revoke(task.id, terminate = True)
    time.sleep(1)  # Sleep for a bit before checking the status again
    count += 1
