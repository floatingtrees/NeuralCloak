# Use an official Python runtime as a parent image
FROM python:3.11-slim

RUN apt-get update && apt-get install -y git


# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install openai-clip
RUN pip install --no-cache-dir -r requirements.txt
RUN python3 downloads.py


# Make port 8000 available to the world outside this container
EXPOSE 8080

# Define environment variable
ENV REDIS_URL redis://redis:6379/0

#RUN echo ls /
#RUN addgroup --system appuser && adduser --system --group appuser
#
#

#RUN groupadd -r appuser && useradd --no-log-init -r -g appuser -u 1000 appuser
#RUN chown -R appuser:appuser /app
#RUN chmod -R o+r /
#RUN chmod -R o+x /

# Switch to the non-root user


# Run main.py when the container launches
CMD ["python3", "main.py"]
