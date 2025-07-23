const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 3000;

// Cliente de WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox'],
  },
});

// Mostrar el QR en consola de Railway
client.on('qr', (qr) => {
  console.log('QR generado. Escanéalo desde WhatsApp Web:');
  qrcode.generate(qr, { small: true });
});

// Confirmación de inicio de sesión
client.on('ready', () => {
  console.log('✅ WhatsApp conectado exitosamente.');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Falló la autenticación:', msg);
});

client.initialize();

// Endpoint de ejemplo para reenviar comandos al bot
app.get('/consulta', async (req, res) => {
  const dni = req.query.dni;
  const receptor = '51987654321@c.us'; // Reemplaza con tu número o el del bot
  const mensaje = `/c4 ${dni}`;

  try {
    await client.sendMessage(receptor, mensaje);
    res.send('Comando enviado correctamente.');
  } catch (err) {
    console.error('Error enviando mensaje:', err);
    res.status(500).send('Error al enviar mensaje.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
