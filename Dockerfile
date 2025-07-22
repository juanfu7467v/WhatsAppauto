FROM node:20

# Instala dependencias necesarias para Puppeteer y QR en navegador
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
  --no-install-recommends

# Crea directorio de la app
WORKDIR /app

# Copia los archivos del proyecto
COPY . .

# Instala las dependencias del proyecto
RUN npm install

# Expone el puerto
EXPOSE 3000

# Comando para iniciar la app
CMD ["node", "index.js"]
