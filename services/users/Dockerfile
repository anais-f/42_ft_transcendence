#-------------------------------------------------------------#
# Build app
FROM node:22-alpine AS build-app

WORKDIR /build

COPY package.json package-lock.json ./
COPY services/users/app/package.json ./services/users/app/
RUN npm install

COPY tsconfig.json ./
COPY services/users ./services/users

EXPOSE 3000

RUN npm run build --workspace=users

#-------------------------------------------------------------#
# prod
FROM node:22-alpine

WORKDIR /app

RUN mkdir -p /app/avatars

COPY --from=build-app /build/services/users/app/dist ./dist
COPY --from=build-app /build/services/users/app/package.json ./
COPY --from=build-app /build/node_modules ./node_modules

RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]
