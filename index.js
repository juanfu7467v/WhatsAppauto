const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const { delay } = require("@whiskeysockets/baileys");

const fs = require("fs");
const { fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    printQRInTerminal: true, // ⬅⬅⬅ MUY IMPORTANTE: Esto es lo que muestra el QR
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log("\n🔷 ESCANEA ESTE QR EN WHATSAPP WEB:\n");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("❌ Conexión cerrada. Reintentando:", shouldReconnect);
      if (shouldReconnect) {
        startSock();
      }
    } else if (connection === "open") {
      console.log("✅ ¡Conectado a WhatsApp!");
    }
  });
}

startSock();
