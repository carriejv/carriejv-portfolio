#!/bin/bash

docker service logs carrievrtis_web
docker swarm leave --force
docker network rm carrievrtis_backend