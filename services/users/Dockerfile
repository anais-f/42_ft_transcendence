#-------------------------------------------------------------#
# Build packages
FROM node:22-alpine AS build-packages

WORKDIR /build

COPY package.json package-lock.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/security/package.json ./packages/security/

RUN npm install

COPY tsconfig.json ./
COPY packages/ ./packages/

# Build required workspace packages
RUN npm run build --workspace=packages/common \
    && npm run build --workspace=packages/security
#-------------------------------------------------------------#
# Build app
FROM node:22-alpine AS build-app

WORKDIR /build

RUN apk add --no-cache python3

COPY package.json package-lock.json ./
COPY services/users/app/package.json ./services/users/app/
COPY packages/common/package.json ./packages/common/
COPY packages/security/package.json ./packages/security/
RUN npm install

COPY tsconfig.json ./
COPY packages/ ./packages/
COPY services/ ./services/

COPY --from=build-packages /build/packages/common/dist ./packages/common/dist
COPY --from=build-packages /build/packages/common/openapiDTO.json ./packages/common/openapiDTO.json
COPY --from=build-packages /build/packages/security/dist ./packages/security/dist

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
COPY --from=build-app /build/packages/security/ ./packages/security/
COPY --from=build-app /build/packages/common/openapiDTO.json ./dist/openapiDTO.json

EXPOSE 3000

CMD ["node", "dist/index.js"]
