FROM node:18

# Establece el directorio de trabajo
WORKDIR /app

# Habilita el módulo `crypto` en entorno ESM explícitamente
ENV NODE_OPTIONS="--experimental-global-webcrypto"

# Copia los archivos necesarios
COPY package*.json ./
RUN npm install

# Copia el resto del código
COPY . .

# Expone el puerto
EXPOSE 3000

# Inicia la aplicación
CMD ["node", "index.js"]
