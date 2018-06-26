#!/bin/bash

docker service logs carrievrtis_web
docker service rm carrievrtis_web
docker secret rm carrievrtis_email
docker secret rm carrievrtis_recaptcha
docker network rm carrievrtis_backend