FROM node:20-alpine

WORKDIR /app

RUN npm install -g typescript http-server

COPY app/ ./

RUN tsc urlRouter.ts

EXPOSE 3000

CMD ["http-server", ".", "-p", "3000", "-c-1"]