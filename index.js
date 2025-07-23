import express from "express";
import { createCanvas } from "canvas";
import qrcode from "qrcode";
import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;

const app = express();
const port = process.env.PORT || 8080;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
});

let qrCodeDataURL = null;

client.on("qr", async (qr) => {
  qrCodeDataURL = await qrcode.toDataURL(qr);
  console.log("🔗 Escanea el código QR con WhatsApp.");
});

client.on("ready", () => {
  console.log("✅ Cliente conectado correctamente.");
});

client.on("authenticated", () => {
  console.log("🔐 Cliente autenticado.");
});

client.initialize();

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>WhatsApp Web</title>
      </head>
      <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh;">
        <h1>Escanea el QR para iniciar sesión</h1>
        ${qrCodeDataURL ? `<img src="${qrCodeDataURL}" alt="Código QR">` : '<p>Esperando código QR...</p>'}
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
