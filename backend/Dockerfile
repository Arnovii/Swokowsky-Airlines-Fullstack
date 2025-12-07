# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package.json y package-lock.json primero (cache layer)
COPY package*.json ./

# Copiar prisma antes de instalar (si usas prisma)
COPY prisma ./prisma

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar la app (Nest)
RUN npm run build

# Exponer puerto (solo informativo; Render usa PORT env)
EXPOSE 3000

# Ejecutar el main compilado (ruta: dist/src/main.js)
CMD ["node", "dist/src/main.js"]
