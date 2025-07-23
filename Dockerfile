# Imagen base recomendada por Puppeteer con todas las dependencias
FROM ghcr.io/puppeteer/puppeteer:latest

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos del proyecto
COPY package*.json ./
COPY index.js ./

# Instalar dependencias
RUN npm install

# Exponer el puerto
EXPOSE 8080

# Comando para iniciar la app
CMD ["npm", "start"]
