FROM node:latest

WORKDIR /usr/src/app

COPY ./ ./

CMD [ "npm","install" ]

CMD [ "npm","run" , "start" ]