import express from "express";
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

const app = express();
const PORT = 8080;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error instanceof Boom &&
          lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut);

      console.log("Conexión cerrada. Reconectando:", shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("✅ Conectado correctamente a WhatsApp");
    }
  });
}

connectToWhatsApp();

app.get("/", (req, res) => {
  res.send("Servidor funcionando con Baileys");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
