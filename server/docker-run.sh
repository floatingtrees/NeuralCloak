#!/bin/sh

# Start Celery in the background
#
python3 main.py &
celery -A generate worker --loglevel=info --pool gevent

# Start your Python application
