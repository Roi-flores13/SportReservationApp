# Etapa 1: compilación
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Copiar solo package.json para resolver dependencias frescas
COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

# Etapa 2: producción
FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

USER node

COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

EXPOSE 3000

CMD ["npm", "start"]