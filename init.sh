#!/bin/bash

docker build -t carrievrtis:app ./app
docker stack deploy --compose-file docker-compose.yml carrievrtis