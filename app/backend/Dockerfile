FROM python:3.12-slim

# Create the app directory
RUN mkdir /denguedash-api

# Set the working directory
WORKDIR /denguedash-api

# Set environment variables
# Prevents Python from writing .pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1
# Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1

# Upgrade pip
RUN pip install --upgrade pip

# Copy the django project and install dependencies
COPY requirements.txt /denguedash-api/
RUN pip install --no-cache-dir --resume-retries 10 -r requirements.txt

# Copy the rest of the project code into the container
COPY . /denguedash-api/

# Expose the port the app runs on
EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]

