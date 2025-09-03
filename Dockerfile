# lpla/tarefas-back:0.0.1

FROM node:latest

WORKDIR /usr/src/nome-aplicacao

COPY . .

RUN npm install

EXPOSE 8080

ENTRYPOINT npm start

