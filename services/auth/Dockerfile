#-------------------------------------------------------------#
# Build app
FROM node:20-alpine AS build-app

WORKDIR /build

COPY package.json package-lock.json ./
COPY services/auth/app/package.json ./services/auth/app/
RUN npm install

COPY tsconfig.json ./
COPY services ./services/

RUN npm run build --workspace=auth-server-app

#-------------------------------------------------------------#
# prod
FROM node:20-alpine

WORKDIR /app

COPY --from=build-app /build/services/users-account/app/dist ./dist
COPY --from=build-app /build/services/users-account/app/package.json ./
COPY --from=build-app /build/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/index.js"]

