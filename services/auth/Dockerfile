#-------------------------------------------------------------#
# Build packages
FROM node:22-alpine AS build-packages

WORKDIR /build

COPY package.json package-lock.json ./
COPY packages/common/package.json ./packages/common/

RUN npm ci

COPY tsconfig.json ./
COPY packages/ ./packages/

RUN npm run build --workspace=packages/common
#-------------------------------------------------------------#
# Build app
FROM node:22-alpine AS build-app

WORKDIR /build

COPY package.json package-lock.json ./
COPY services/auth/app/package.json ./services/auth/app/
COPY packages/common/package.json ./packages/common/
RUN apk add --no-cache python3 make g++
RUN npm ci

COPY tsconfig.json ./
COPY packages/ ./packages/
COPY services/ ./services/

COPY --from=build-packages /build/packages/common/openapiDTO.json ./packages/common/openapiDTO.json
COPY --from=build-packages /build/packages/common/dist ./packages/common/dist

RUN npm run build --workspace=auth-server-app

#-------------------------------------------------------------#
# prod
FROM node:22-alpine

WORKDIR /app

COPY --from=build-app /build/services/auth/app/dist ./dist
COPY --from=build-app /build/services/auth/app/package.json ./
COPY --from=build-app /build/node_modules ./node_modules
COPY --from=build-app /build/packages/common/ ./packages/common/
COPY --from=build-app /build/packages/common/openapiDTO.json ./dist/openapiDTO.json

EXPOSE 3000

CMD ["node", "dist/index.js"]
