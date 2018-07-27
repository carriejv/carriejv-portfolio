FROM node:9.6.1-alpine
EXPOSE 8080 7946/tcp 4789/udp
COPY . ./app
WORKDIR /app
RUN yarn install
CMD ["yarn", "start"]