#-------------------------------------------------------------#
# Build packages
FROM node:22-alpine AS build-packages

WORKDIR /build

COPY package.json package-lock.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/security/package.json ./packages/security/

RUN apk add --no-cache python3 make g++ && npm ci

COPY tsconfig.json ./
COPY packages/ ./packages/

# Build required workspace packages
RUN npm run build --workspace=packages/common \
    && npm run build --workspace=packages/security
#-------------------------------------------------------------#
# Build app
FROM node:22-alpine AS build-app

WORKDIR /build

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
COPY services/social/app/package.json ./services/social/app/
COPY packages/common/package.json ./packages/common/
COPY packages/security/package.json ./packages/security/
RUN npm ci

COPY tsconfig.json ./
COPY packages/ ./packages/
COPY services/ ./services/

COPY --from=build-packages /build/packages/common/dist ./packages/common/dist
COPY --from=build-packages /build/packages/common/openapiDTO.json ./packages/common/openapiDTO.json
COPY --from=build-packages /build/packages/security/dist ./packages/security/dist

RUN npm run build --workspace=social

#-------------------------------------------------------------#
# prod
FROM node:22-alpine

WORKDIR /app

RUN mkdir -p /app/avatars

COPY --from=build-app /build/services/social/app/dist ./dist
COPY --from=build-app /build/services/social/app/package.json ./
COPY --from=build-app /build/node_modules ./node_modules
COPY --from=build-app /build/packages/common/ ./packages/common/
COPY --from=build-app /build/packages/security/ ./packages/security/
COPY --from=build-app /build/packages/common/openapiDTO.json ./dist/openapiDTO.json

EXPOSE 3000

CMD ["node", "dist/index.js"]
