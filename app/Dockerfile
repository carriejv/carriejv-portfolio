FROM node:9.6.1-alpine

RUN npm install -g nodemon

EXPOSE 8080

RUN yarn install
ENTRYPOINT ["nodemon", "start"]


