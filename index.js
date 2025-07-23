import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeInMemoryStore,
} from "@whiskeysockets/baileys";
import express from "express";
import { Boom } from "@hapi/boom";
import P from "pino";
import fs from "fs";

const app = express();
const port = process.env.PORT || 8080;

const store = makeInMemoryStore({ logger: P().child({ level: "silent", stream: "store" }) });

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
    logger: P({ level: "silent" }),
  });

  store.bind(sock.ev);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ Desconectado. Escanea el QR nuevamente.");
        connectToWhatsApp();
      } else {
        console.log("🔁 Reconectando...");
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("✅ Conectado a WhatsApp Web");
    }
  });

  return sock;
}

let sockInstance;

connectToWhatsApp().then((sock) => {
  sockInstance = sock;
});

app.get("/consulta", async (req, res) => {
  const dni = req.query.dni;
  if (!dni || !sockInstance) {
    return res.send("Error: DNI no válido o WhatsApp no conectado.");
  }

  try {
    const mensaje = `/dni${dni}`;
    const xdataBot = "51999999999@s.whatsapp.net"; // <-- Reemplaza por el número real del bot

    await sockInstance.sendMessage(xdataBot, { text: mensaje });

    // Aquí puedes esperar la respuesta o devolver algo temporal
    return res.send(`Mensaje enviado a XDATA con DNI: ${dni}`);
  } catch (err) {
    console.error("Error al enviar mensaje:", err);
    return res.send("Error al enviar mensaje.");
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
