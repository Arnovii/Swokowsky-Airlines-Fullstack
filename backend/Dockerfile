FROM node:20-alpine

# Instalar Nest CLI globalmente y nodemon para hot reload
RUN npm install -g @nestjs/cli nodemon

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias, incluyendo devDependencies
RUN npm install

# Copiar todo el código
COPY . .

# Exponer el puerto del backend
EXPOSE 3000

# Comando para desarrollo: hot reload con nodemon
CMD ["npm", "run", "start:dev"]
