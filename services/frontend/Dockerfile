FROM node:22-alpine

WORKDIR /app

# outils simples pour build/serve
RUN npm install -g typescript http-server

# copie des sources (inclut tsconfig.json et index.html)
COPY app/ ./

# utilise le tsconfig (lib ES2020 + DOM) au lieu de "tsc urlRouter.ts"
RUN tsc -p .

# copie l'index dans le dossier de sortie
RUN mkdir -p dist && cp index.html dist/index.html

EXPOSE 3000

# sert le contenu compilé
CMD ["http-server", "dist", "-p", "3000", "-c-1"]
