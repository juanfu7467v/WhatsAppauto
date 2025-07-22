FROM node:18-slim

# Instalar dependencias necesarias para Chromium y Puppeteer/Venom
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libgtk-3-0 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libxss1 \
  libxext6 \
  libxfixes3 \
  libdrm2 \
  libatspi2.0-0 \
  libglib2.0-0 \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias Node.js
RUN npm install

# Exponer el puerto de Express u otro
EXPOSE 3000

# Iniciar la aplicación
CMD ["node", "main.js"]
