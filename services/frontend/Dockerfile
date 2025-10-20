FROM node:22-alpine

WORKDIR /app

RUN npm install -g typescript http-server

COPY app/ ./

RUN tsc -p .

RUN mkdir -p dist && cp index.html dist/index.html

EXPOSE 3000

CMD ["http-server", "dist", "-p", "3000", "-c-1"]
