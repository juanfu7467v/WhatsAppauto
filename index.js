import express from 'express';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const app = express();
const PORT = process.env.PORT || 8080;

let xdataResponse = null;
let waitingForDNI = null;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('Escanea el siguiente código QR con tu WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Web listo.');
});

client.on('message', (msg) => {
  if (waitingForDNI && msg.from === '521XXXXXXXXXX@c.us') { // Reemplaza con el número de XDATA
    xdataResponse = msg.body;
    waitingForDNI = null;
  }
});

client.initialize();

app.get('/consulta', async (req, res) => {
  const dni = req.query.dni;
  if (!dni) return res.status(400).send('Falta el DNI');

  const numeroXdata = '521XXXXXXXXXX@c.us'; // Reemplaza con el número correcto
  const mensaje = `/dni${dni}`;

  xdataResponse = null;
  waitingForDNI = dni;

  await client.sendMessage(numeroXdata, mensaje);

  // Espera máximo 10 segundos por respuesta
  const maxTime = 10000;
  const interval = 500;
  let waited = 0;

  while (!xdataResponse && waited < maxTime) {
    await new Promise(r => setTimeout(r, interval));
    waited += interval;
  }

  if (xdataResponse) {
    res.send(xdataResponse);
  } else {
    res.status(504).send('No se recibió respuesta de XDATA a tiempo.');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
