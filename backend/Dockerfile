FROM node:20-alpine

# Instalar Nest CLI y nodemon globalmente (solo necesario para dev)
RUN npm install -g @nestjs/cli nodemon

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Copiar la carpeta prisma ANTES de instalar dependencias
COPY prisma ./prisma

# Instalar dependencias (incluye prisma generate si tienes postinstall)
RUN npm install

# Copiar todo el resto del código
COPY . .

# Exponer puerto
EXPOSE 3000

# Iniciar la app
CMD ["npm", "run", "start:dev"]
