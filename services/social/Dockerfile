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
COPY services/social/app/package.json ./social/social/app/
COPY packages/common/package.json ./packages/common/
RUN npm install

COPY tsconfig.json ./
COPY packages/ ./packages/
COPY services/ ./services/

COPY --from=build-packages /build/packages/common/dist ./packages/common/dist

EXPOSE 3000

RUN npm run build --workspace=social

#-------------------------------------------------------------#
# prod
FROM node:22-alpine

WORKDIR /app

COPY --from=build-app /build/services/social/app/dist ./dist
COPY --from=build-app /build/services/social/app/package.json ./
COPY --from=build-app /build/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/index.js"]