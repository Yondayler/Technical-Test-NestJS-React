FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto del frontend
EXPOSE 5173

# En Vite es obligatorio el flag --host para que se pueda acceder desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host"]
