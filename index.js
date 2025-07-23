import express from "express";
import { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";

const app = express();
const PORT = process.env.PORT || 8080;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "Conexion cerrada, ¿reconectar?",
        shouldReconnect,
        lastDisconnect?.error
      );
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("✅ Conectado correctamente a WhatsApp");
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

connectToWhatsApp();

app.get("/", (req, res) => {
  res.send("✅ Servidor corriendo y WhatsApp activo");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
