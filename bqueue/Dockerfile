FROM node:7.6.0

# Install our requirements.txt
ADD package.json package.json

RUN npm install -g pm2 --silent

RUN npm install --silent

# Copy our code from the current folder to /app inside the container
ADD index.js index.js
ADD pm2.json pm2.json

CMD ["pm2-docker", "pm2.json"]