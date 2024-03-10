#!/bin/sh

# Start Redis in the background
redis-server &

# Start your Python application
python3 main.py