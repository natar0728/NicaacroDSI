# Etapa 1: compilar el frontend
FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# Etapa 2: preparar la aplicación final
FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Instalar dependencias del backend.
COPY BACKEND/package*.json ./
RUN npm ci --omit=dev

# Copiar el backend.
COPY BACKEND/src ./src

# Copiar el frontend compilado.
COPY --from=frontend-build /app/frontend/dist ./public

USER node

EXPOSE 3000

CMD ["node", "src/server.js"]