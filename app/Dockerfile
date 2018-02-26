FROM node:9.6.1-alpine

RUN npm install -g nodemon

EXPOSE 8080

EXPOSE 7946/tcp

EXPOSE 4789/udp

ENTRYPOINT ["nodemon", "start"]