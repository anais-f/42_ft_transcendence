#-------------------------------------------------------------#
# Build packages
FROM node:22-alpine AS build-packages

WORKDIR /build

COPY package.json package-lock.json ./
COPY packages ./packages

RUN apk add --no-cache python3 make g++ && npm ci

COPY tsconfig.json ./

RUN npm run build --workspace=packages/common \
	&& npm run build --workspace=packages/monitoring \
	&& npm run build --workspace=packages/security
#-------------------------------------------------------------#
# Build 2fa app
FROM node:22-alpine AS build-app

WORKDIR /build

COPY package.json package-lock.json ./
COPY services/2fa/app/package.json ./services/2fa/app/
COPY packages/common/package.json ./packages/common/

RUN apk add --no-cache python3 make g++
RUN npm ci

COPY tsconfig.json ./
COPY packages/ ./packages/
COPY services/ ./services/

COPY --from=build-packages /build/packages/common/openapiDTO.json ./packages/common/openapiDTO.json
COPY --from=build-packages /build/packages/common/dist ./packages/common/dist
COPY --from=build-packages /build/packages/monitoring/dist ./packages/monitoring/dist
COPY --from=build-packages /build/packages/security/dist ./packages/security/dist

RUN npm run build --workspace=2fa-server-app

#-------------------------------------------------------------#
# prod
FROM node:22-alpine

WORKDIR /app

COPY --from=build-app /build/services/2fa/app/dist ./dist
COPY --from=build-app /build/services/2fa/app/package.json ./
COPY --from=build-app /build/node_modules ./node_modules
COPY --from=build-app /build/packages/common/ ./packages/common/
COPY --from=build-app /build/packages/common/openapiDTO.json ./dist/openapiDTO.json
COPY --from=build-app /build/packages/monitoring/ ./packages/monitoring/
COPY --from=build-app /build/packages/security/ ./packages/security/

EXPOSE 3000

CMD ["node", "dist/index.js"]
