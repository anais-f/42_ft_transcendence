# ============================================
# Stage 1: Build - Asset Compilation
# ============================================
FROM node:22-alpine AS build-app

WORKDIR /build

COPY package.json package-lock.json ./
COPY services/frontend/app/package.json ./services/frontend/app/package.json

RUN npm install
# Install dependencies (including devDependencies)
RUN npm ci

COPY tsconfig.json ./
COPY services/frontend/app ./services/frontend/app


# Compile TypeScript + Build Vite + Tailwind
RUN npm run build --workspace=frontend

# ============================================
# Stage 2: Production - Lightweight Server
# ============================================
FROM node:22-alpine AS production

WORKDIR /app

RUN npm install -g http-server

COPY --from=build-app /build/services/frontend/app/dist ./dist

EXPOSE 3000

CMD ["http-server", "dist", "-p", "3000", "-c-1", "--cors"]