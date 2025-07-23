const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const express = require("express");
const axios = require("axios");
const { Boom } = require("@hapi/boom");
const qrcode = require("qrcode-terminal");

const app = express();
const PORT = process.env.PORT || 3000;

// Bot de WhatsApp
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot conectado");
    }
  });

  // Escucha comandos desde AppCreator24
  app.get("/consulta", async (req, res) => {
    const { comando, dni } = req.query;
    if (!comando || !dni) return res.status(400).send("Faltan parámetros");

    const numeroXDATA = "51987654321@c.us"; // Cambia a tu número destino (bot XDATA)
    const mensaje = `/${comando} ${dni}`;

    try {
      await sock.sendMessage(numeroXDATA, { text: mensaje });
      res.send(`✅ Comando enviado: ${mensaje}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("❌ Error al enviar el mensaje");
    }
  });

  // Escucha respuestas del bot XDATA
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    if (texto) console.log("📩 Respuesta recibida:", texto);
    // Aquí podrías guardar esa respuesta y devolverla a AppCreator24 si quieres.
  });

  app.listen(PORT, () => console.log(`🚀 API activa en http://localhost:${PORT}`));
}

startBot();
