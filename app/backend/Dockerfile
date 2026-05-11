FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos primero los archivos de dependencias para aprovechar la caché de Docker
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código y el archivo mock-youtube-api.json
COPY . .

# Exponemos el puerto del backend
EXPOSE 3001

# Iniciamos el servidor
CMD ["npm", "run", "start:dev"]
