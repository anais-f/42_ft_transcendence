#-------------------------------------------------------------#
# Build packages (common libs)
FROM node:22-alpine AS build-packages

WORKDIR /build

# copy root manifests used to install monorepo deps
COPY package.json package-lock.json ./
COPY packages/common/package.json ./packages/common/

RUN npm ci --omit=optional --no-audit --no-fund

COPY tsconfig.json ./
COPY packages/ ./packages/

RUN npm run build --workspace=packages/common || true

#-------------------------------------------------------------#
# Build app
FROM node:22-alpine AS build-app

WORKDIR /build

# copy root manifests and frontend package manifest
COPY package.json package-lock.json ./
COPY services/frontend/app/package.json ./services/frontend/app/
COPY packages/common/package.json ./packages/common/

# add native build tools just in case (for native addons)
RUN apk add --no-cache python3 make g++

# install deps using lockfile for reproducibility
RUN npm ci --omit=optional --no-audit --no-fund

COPY tsconfig.json ./
COPY packages/ ./packages/
COPY services/ ./services/

# copy built common artifacts from build-packages (if any)
COPY --from=build-packages /build/packages/common/openapiDTO.json ./packages/common/openapiDTO.json
COPY --from=build-packages /build/packages/common/dist ./packages/common/dist

# build only the frontend workspace
RUN npm run build --workspace=transcendence-frontend

# Ensure index.html is present in the frontend dist (tsc doesn't copy static files)
RUN mkdir -p ./services/frontend/app/dist && cp ./services/frontend/app/index.html ./services/frontend/app/dist/index.html || true

#-------------------------------------------------------------#
# prod image
FROM node:22-alpine

WORKDIR /app

# copy built dist and package.json from build-app
COPY --from=build-app /build/services/frontend/app/dist ./dist
COPY --from=build-app /build/services/frontend/app/package.json ./
COPY --from=build-app /build/node_modules ./node_modules
COPY --from=build-app /build/packages/common/ ./packages/common/

EXPOSE 3000

CMD ["node", "-e", "require('http-server').createServer({root:'dist', cache: -1}).listen(3000)"]

