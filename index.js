const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

let qrCodeData = null;
let isClientReady = false;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox'],
  },
});

client.on('qr', (qr) => {
  qrCodeData = qr;
  console.log('📷 QR recibido. Escanéalo para iniciar sesión.');
});

client.on('ready', () => {
  isClientReady = true;
  console.log('✅ Cliente de WhatsApp listo');
});

client.on('auth_failure', msg => {
  console.error('❌ Fallo de autenticación:', msg);
});

client.initialize();

app.get('/', (req, res) => {
  res.send('✅ Servidor funcionando. Visita /qr para escanear el código QR.');
});

app.get('/qr', async (req, res) => {
  if (!qrCodeData) {
    return res.send('⚠️ Aún no se ha generado el QR. Espera unos segundos y recarga.');
  }
  try {
    const qrImage = await qrcode.toDataURL(qrCodeData);
    res.send(`
      <html>
        <body style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;">
          <h2>Escanea este código QR con WhatsApp</h2>
          <img src="${qrImage}" />
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('❌ Error generando imagen del QR.');
  }
});

app.get('/consulta', async (req, res) => {
  const dni = req.query.dni;
  const xdataNumber = '51999999999@c.us'; // ← Cambia este número al de XDATA con código de país

  if (!dni || dni.length !== 8) {
    return res.status(400).send('❌ DNI inválido.');
  }

  if (!isClientReady) {
    return res.status(503).send('❌ WhatsApp no está listo. Escanea el QR primero.');
  }

  const comando = `/dni${dni}`;

  try {
    await client.sendMessage(xdataNumber, comando);
    console.log(`📤 Enviado a XDATA: ${comando}`);

    // Esperar la respuesta
    client.once('message', async (message) => {
      if (message.from === xdataNumber) {
        console.log('📥 Respuesta de XDATA:', message.body);
        return res.send(message.body);
      }
    });

    // Tiempo máximo de espera
    setTimeout(() => {
      return res.status(504).send('⏰ No se recibió respuesta de XDATA.');
    }, 10000);
  } catch (err) {
    console.error('❌ Error enviando mensaje:', err);
    return res.status(500).send('❌ Error interno.');
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
