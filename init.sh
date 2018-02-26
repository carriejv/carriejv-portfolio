#!/bin/bash

docker build -t carrievrtis:app ./app
docker swarm init
docker stack deploy --compose-file docker-compose.yml carrievrtis