FROM ubuntu:latest

RUN apt-get update -y

RUN apt-get install -y python3-pip python3-dev build-essential

# Set the application directory
WORKDIR /app

# Install our requirements.txt
ADD ./app/requirements.txt /app/requirements.txt
RUN pip3 install -r requirements.txt

# Copy our code from the current folder to /app inside the container
ADD ./app/ /app

# Make port 8000 available for links and/or publish
#EXPOSE 5000

# Define our command to be run when launching the container
#CMD ["python", "app.py"]

ENTRYPOINT ["python3"]
CMD ["app.py"]