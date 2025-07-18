// index.js
const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const app = express();
const port = process.env.PORT || 3000;

let respuestas = {}; // Almacena respuestas por número

// Inicializa cliente de WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ["--no-sandbox"] },
});

client.on("qr", (qr) => {
  console.log("📲 Escanea este QR para iniciar sesión en WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp conectado");
});

client.on("message", (msg) => {
  const numero = msg.from;
  if (numero.includes("@c.us")) {
    respuestas[numero] = msg.body;
  }
});

client.initialize();

function esperarRespuesta(numero, timeout = 10000) {
  return new Promise((resolve) => {
    const inicio = Date.now();
    const interval = setInterval(() => {
      if (respuestas[numero]) {
        clearInterval(interval);
        const texto = respuestas[numero];
        delete respuestas[numero];
        resolve(texto);
      } else if (Date.now() - inicio > timeout) {
        clearInterval(interval);
        resolve(null);
      }
    }, 500);
  });
}

app.get("/consulta", async (req, res) => {
  const dni = req.query.dni;
  if (!dni) return res.send("❌ DNI no válido");

  const mensaje = `/dni${dni}`;
  const numeroXDATA = "51999999999@c.us"; // Reemplaza con el número correcto

  try {
    await client.sendMessage(numeroXDATA, mensaje);
    const respuesta = await esperarRespuesta(numeroXDATA, 15000);
    res.send(respuesta || "⏳ Sin respuesta del bot XDATA");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al enviar mensaje: " + error.message);
  }
});

app.get("/", (req, res) => {
  res.send("✅ Servidor activo - WhatsApp XDATA Consulta");
});

app.listen(port, () => {
  console.log("🚀 Servidor ejecutándose en puerto " + port);
});
