#!/bin/bash

docker service logs carrievrtis_web
docker service logs carrievrtis_nginx
docker swarm leave --force
docker network rm carrievrtis_backend