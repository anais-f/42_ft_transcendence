#-------------------------------------------------------------#
# Build packages
FROM node:22-alpine AS build-packages

WORKDIR /build

COPY package.json package-lock.json ./
COPY packages ./packages

RUN npm install

COPY tsconfig.json ./

RUN npm run build --workspace=packages/common \
	&& npm run build --workspace=packages/monitoring \
	&& npm run build --workspace=packages/security
#-------------------------------------------------------------#
# Build app
FROM node:22-alpine AS build-app

WORKDIR /build

COPY package.json package-lock.json ./
COPY services/matchmaking/app/package.json ./services/matchmaking/app/
COPY packages/common/package.json ./packages/common/
RUN apk add --no-cache python3 make g++
RUN npm install

COPY tsconfig.json ./
COPY packages/ ./packages/
COPY services/ ./services/

COPY --from=build-packages /build/packages/common/openapiDTO.json ./packages/common/openapiDTO.json
COPY --from=build-packages /build/packages/common/dist ./packages/common/dist
COPY --from=build-packages /build/packages/security/dist ./packages/security/dist
COPY --from=build-packages /build/packages/monitoring/dist ./packages/monitoring/dist

RUN npm run build --workspace=matchmaking-server-app

#-------------------------------------------------------------#
# prod
FROM node:22-alpine

WORKDIR /app

COPY --from=build-app /build/services/matchmaking/app/dist ./dist
COPY --from=build-app /build/services/matchmaking/app/package.json ./
COPY --from=build-app /build/node_modules ./node_modules
COPY --from=build-app /build/packages/common/ ./packages/common/
COPY --from=build-app /build/packages/monitoring/ ./packages/monitoring/
COPY --from=build-app /build/packages/security/ ./packages/security/
COPY --from=build-app /build/packages/common/openapiDTO.json ./dist/openapiDTO.json

EXPOSE 3000

CMD ["node", "dist/index.js"]
