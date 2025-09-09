# lpla/tarefas-back:0.0.1

FROM node:latest

WORKDIR /usr/src/tarefas

COPY . .

RUN npm install
RUN npm run build

EXPOSE 8080

ENTRYPOINT npm run start

