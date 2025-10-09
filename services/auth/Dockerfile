#-------------------------------------------------------------#
# Build app
FROM node:22-alpine AS build-app

WORKDIR /build

COPY package.json package-lock.json ./
COPY services/auth/app/package.json ./services/auth/app/
RUN apk add --no-cache python3 make g++
RUN npm install

COPY tsconfig.json ./
COPY services/auth ./services/auth

EXPOSE 3000

RUN npm run build --workspace=auth-server-app

#-------------------------------------------------------------#
# prod
FROM node:22-alpine

WORKDIR /app

COPY --from=build-app /build/services/auth/app/dist ./dist
COPY --from=build-app /build/services/auth/app/package.json ./
COPY --from=build-app /build/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/index.js"]

