#-------------------------------------------------------------#
# Build packages
FROM node:22-alpine AS build-packages

WORKDIR /build

COPY package.json package-lock.json ./
COPY packages/common/package.json ./packages/common/

RUN npm install

COPY tsconfig.json ./
COPY packages/ ./packages/

RUN npm run build --workspace=packages/common
#-------------------------------------------------------------#
# Build app
FROM node:22-alpine AS build-app

WORKDIR /build

COPY package.json package-lock.json ./
COPY services/users/app/package.json ./services/users/app/
COPY packages/common/package.json ./packages/common/
RUN npm install

COPY tsconfig.json ./
COPY packages/ ./packages/
COPY services/ ./services/

COPY --from=build-packages /build/packages/common/dist ./packages/common/dist

EXPOSE 3000

RUN npm run build --workspace=users

#-------------------------------------------------------------#
# prod
FROM node:22-alpine

WORKDIR /app

RUN mkdir -p /app/avatars

COPY --from=build-app /build/services/users/app/dist ./dist
COPY --from=build-app /build/services/users/app/package.json ./
COPY --from=build-app /build/node_modules ./node_modules
COPY --from=build-app /build/packages/common/ ./packages/common/
COPY --from=build-app /build/packages/common/openapiDTO.json ./dist/openapiDTO.json

RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]