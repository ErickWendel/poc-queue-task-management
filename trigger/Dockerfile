FROM node:7.6.0

# Set the application directory
WORKDIR /app/src

# Install our requirements.txt
ADD ./app/src/package.json /app/src/package.json

RUN npm install -g pm2 --silent

RUN npm install --silent

# Copy our code from the current folder to /app inside the container
ADD ./app/src/ /app/src

CMD ["pm2-docker", "pm2.json"]