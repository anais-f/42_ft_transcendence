#-------------------------------------------------------------#
# Build app
FROM node:22-alpine AS build-app

WORKDIR /build

COPY package.json package-lock.json ./
COPY services/users-account/app/package.json ./services/users-account/app/
RUN npm install

COPY tsconfig.json ./
COPY services ./services/

EXPOSE 3000

RUN npm run build --workspace=users-account-app

#-------------------------------------------------------------#
# prod
FROM node:22-alpine

WORKDIR /app

COPY --from=build-app /build/services/users-account/app/dist ./dist
COPY --from=build-app /build/services/users-account/app/package.json ./
COPY --from=build-app /build/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/index.js"]
