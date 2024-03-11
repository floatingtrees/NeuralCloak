#!/bin/sh

# Start Redis in the background
celery -A djangoproject worker -l info --detach

# Start your Python application
python3 main.py
