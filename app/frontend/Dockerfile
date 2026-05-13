# ---- Build Stage ----
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# Copiar configuración de dependencias primero
COPY package*.json ./

# Usar npm ci para una instalación limpia y determinista
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar la aplicación React/Vite para producción
RUN npm run build

# ---- Production Stage ----
FROM nginx:latest AS production

# Remover la configuración por defecto de Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copiar nuestra propia configuración de Nginx (manejo de SPA, gzip, caché)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los estáticos construidos desde la etapa anterior
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Exponer el puerto de Nginx
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
