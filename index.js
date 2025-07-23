import express from 'express';
import { Boom } from '@hapi/boom';
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { default as pino } from 'pino';

const app = express();
const PORT = process.env.PORT || 8080;

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger: pino({ level: 'silent' }),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;

      console.log('connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect);

      if (shouldReconnect) startSock();
    } else if (connection === 'open') {
      console.log('✅ Conectado a WhatsApp con éxito');
    }
  });
};

startSock();

app.get('/', (req, res) => {
  res.send('✅ El servidor de WhatsApp está corriendo correctamente.');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
