import { Boom } from '@hapi/boom';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';

import express from 'express';
import { createServer } from 'http';
import QRCode from 'qrcode';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8080;

const store = makeInMemoryStore({});
store.readFromFile('./session_store.json');
setInterval(() => {
  store.writeToFile('./session_store.json');
}, 10_000);

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    browser: ['Railway Bot', 'Chrome', '4.0'],
    defaultQueryTimeoutMs: undefined,
  });

  store.bind(sock.ev);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('🔷 Escanea este QR:');
      QRCode.toString(qr, { type: 'terminal' }, (err, url) => {
        if (err) return console.error('Error generando QR:', err);
        console.log(url);
      });
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error?.output?.statusCode || 0) !== DisconnectReason.loggedOut;

      console.log('⚠️ Conexión cerrada. Reintentando:', shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    }

    if (connection === 'open') {
      console.log('✅ Conectado a WhatsApp');
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

connectToWhatsApp();

app.get('/', (req, res) => {
  res.send('✅ Bot de WhatsApp corriendo en Railway.');
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
