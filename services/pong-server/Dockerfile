#-------------------------------------------------------------#
# Build packages 
FROM node:20-alpine AS build-packages

WORKDIR /build

COPY package.json package-lock.json ./
COPY packages/pong-shared/package.json ./packages/pong-shared/

RUN npm install

COPY tsconfig.json ./
COPY packages/ ./packages/

RUN npm run build --workspace=packages/pong-shared
#-------------------------------------------------------------#
# Build app
FROM node:20-alpine AS build-app

WORKDIR /build

COPY package.json package-lock.json ./
COPY services/pong-server/app/package.json ./services/pong-server/app/
COPY packages/pong-shared/package.json ./packages/pong-shared/
RUN npm install

COPY tsconfig.json ./
COPY packages/ ./packages/
COPY services/ ./services/

COPY --from=build-packages /build/packages/pong-shared/dist ./packages/pong-shared/dist

#RUN npm run build --workspace=services/app/pong-server dont work
RUN npm run build --workspace=pong-server-app

#-------------------------------------------------------------#
# prod
FROM node:20-alpine

WORKDIR /app


#COPY --from=build-app /build ./build
#CMD ["tail", "-f"]
COPY --from=build-app /build/services/pong-server/app/dist ./dist
COPY --from=build-app /build/services/pong-server/app/package.json ./
COPY --from=build-app /build/node_modules ./node_modules

CMD ["node", "dist/index.js"]
