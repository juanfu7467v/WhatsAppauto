import makeWASocket, { useSingleFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import express from 'express';
import { Boom } from '@hapi/boom';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { state, saveState } = useSingleFileAuthState('./auth.json');
const app = express();
const PORT = process.env.PORT || 3000;

let sock;

async function startBot() {
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('✅ Bot conectado a WhatsApp');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (!messages || !messages[0]?.message) return;
    const msg = messages[0];
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    console.log('📩 Mensaje recibido:', text);
  });
}

await startBot();

app.get('/', (_, res) => {
  res.send('✅ Bot corriendo en Railway');
});

app.get('/consulta', async (req, res) => {
  const dni = req.query.dni;
  if (!dni || !sock) return res.status(400).send('Falta el DNI o el bot no está conectado');

  const comando = `/dni${dni}`;
  const botXData = '51999999999@s.whatsapp.net'; // <-- Reemplaza con número real del bot XDATA

  try {
    await sock.sendMessage(botXData, { text: comando });

    const listener = (msg) => {
      const mensaje = msg.messages?.[0];
      if (
        mensaje?.key?.remoteJid === botXData &&
        mensaje?.message?.conversation
      ) {
        res.send(mensaje.message.conversation);
        sock.ev.off('messages.upsert', listener);
      }
    };

    sock.ev.on('messages.upsert', listener);

    setTimeout(() => {
      sock.ev.off('messages.upsert', listener);
      res.status(504).send('⏱️ Tiempo de espera agotado');
    }, 10000); // 10 segundos máximo
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error);
    res.status(500).send('Error al procesar el mensaje');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});
