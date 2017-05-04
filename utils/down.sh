#!/bin/bash
# Down all docker containers and images.

echo 'stopping all containers'
sudo docker stop $(sudo docker ps -a -q)

echo 'deleting all containers'
sudo docker rm $(sudo docker ps -a -q)

echo 'deleting all images'
sudo docker rmi $(sudo docker images -q)
