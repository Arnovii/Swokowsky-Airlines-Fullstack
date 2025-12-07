FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Copiar la carpeta prisma antes de instalar dependencias
COPY prisma ./prisma

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Compilar NestJS
RUN npm run build

# Exponer el puerto (Render lo detecta desde aquí)
EXPOSE 3000

# Comando de producción: ejecutar JS compilado
CMD ["node", "dist/main.js"]
