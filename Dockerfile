FROM node:9.6.1-alpine

ARG serverListenPort=8080

ENV SERVER_LISTEN_PORT $serverListenPort

RUN mkdir -p /app

RUN npm install -g nodemon

WORKDIR /app
ADD app/package.json /app/package.json
RUN yarn install

ADD app/nodemon.json /app/nodemon.json

ADD app /app

EXPOSE $serverListenPort

WORKDIR /app
ENTRYPOINT ["yarn", "start"]
CMD ["-m"]


