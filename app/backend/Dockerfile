# ---- Build Stage ----
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# Copiar configuración de dependencias primero
COPY package*.json ./

# Usar npm ci para una instalación limpia y determinista
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar la aplicación NestJS
RUN npm run build

# ---- Production Stage ----
FROM node:20-slim AS production

# Establecer la variable de entorno para producción
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copiar los archivos de configuración de dependencias
COPY package*.json ./

# Instalar solo las dependencias de producción para mantener la imagen ligera
RUN npm ci --only=production

# Copiar el build y otros archivos estáticos necesarios
COPY --from=builder /usr/src/app/dist ./dist
# Asegurarnos de que el archivo mock exista si el código lo carga directamente desde la raíz
COPY --from=builder /usr/src/app/mock-youtube-api.json ./

# Usar el usuario no-root por motivos de seguridad
USER node

# Exponer el puerto del backend
EXPOSE 3001

# Iniciar la aplicación compilada
CMD ["node", "dist/main"]
