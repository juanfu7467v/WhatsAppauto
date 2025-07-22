const express = require('express');
const fs = require('fs');
const path = require('path');
const { create } = require('venom');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let qrBase64 = '';

create({
  session: 'whatsapp-session',
  multidevice: true,
  headless: true,
  useChrome: true,
  logQR: false,
  browserArgs: ['--no-sandbox'],
  qrTimeout: 0,
  waitForLogin: true,
  catchQR: (base64Qr) => {
    qrBase64 = base64Qr;
    fs.writeFileSync('./public/qr.html', `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Escanea el QR</title>
        <style>
          body { font-family: sans-serif; text-align: center; margin-top: 50px; }
          img { max-width: 90vw; height: auto; }
        </style>
      </head>
      <body>
        <h2>📲 Escanea este código QR con tu WhatsApp</h2>
        <img src="${base64Qr}" alt="Código QR">
        <p>Si no se actualiza, refresca la página.</p>
      </body>
      </html>
    `);
    console.log('✅ QR actualizado en /qr.html');
  }
}).then((client) => {
  console.log('✅ Bot conectado');
  client.onMessage(async (message) => {
    if (message.body === 'hola' && !message.isGroupMsg) {
      await client.sendText(message.from, '👋 Hola, ¿cómo estás?');
    }
  });
}).catch((e) => {
  console.error('❌ Error al iniciar Venom:', e);
});

app.get('/', (req, res) => {
  res.redirect('/qr.html');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});
