const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const axios = require("axios");
const { Boom } = require("@hapi/boom");
const qrcode = require("qrcode-terminal");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom) && lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === "open") {
      console.log("✅ Bot conectado");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || !msg.key.remoteJid || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const args = text.trim().split(" ");
    const command = args[0].toLowerCase();
    const dni = args[1];

    const reply = (text) =>
      sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });

    if (!dni && command !== "/nm") return;

    const endpoints = {
      "/nm": () => `https://xdata-api.vercel.app/nombres/${args.slice(1).join(" ")}`,
      "/actan": () => `https://xdata-api.vercel.app/actan/${dni}`,
      "/actam": () => `https://xdata-api.vercel.app/actam/${dni}`,
      "/actad": () => `https://xdata-api.vercel.app/actad/${dni}`,
      "/c4": () => `https://xdata-api.vercel.app/c4/${dni}`,
      "/dnif": () => `https://xdata-api.vercel.app/dnif/${dni}`,
      "/agv": () => `https://xdata-api.vercel.app/arbol/${dni}`,
      "/c4b": () => `https://xdata-api.vercel.app/c4b/${dni}`,
      "/dnivel": () => `https://xdata-api.vercel.app/dnivel/${dni}`,
      "/dnivam": () => `https://xdata-api.vercel.app/dnivam/${dni}`,
      "/dnivaz": () => `https://xdata-api.vercel.app/dnivaz/${dni}`,
      "/dnig": () => `https://xdata-api.vercel.app/dnig/${dni}`,
      "/antpen": () => `https://xdata-api.vercel.app/antpen/${dni}`,
      "/antpol": () => `https://xdata-api.vercel.app/antpol/${dni}`,
      "/antjud": () => `https://xdata-api.vercel.app/antjud/${dni}`,
      "/denuncias": () => `https://xdata-api.vercel.app/denuncias/${dni}`,
    };

    if (command in endpoints) {
      try {
        const url = endpoints[command]();
        const { data } = await axios.get(url);
        const message = typeof data === "object" ? JSON.stringify(data, null, 2) : data;
        reply(`✅ Resultado para ${command}:\n\n${message}`);
      } catch (error) {
        reply("❌ Error al obtener la información. Verifica el DNI o nombre.");
      }
    }
  });
}

startBot();
