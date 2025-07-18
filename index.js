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

// Función para esperar respuesta del bot
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

// Endpoint principal de consulta
app.get("/consulta", async (req, res) => {
  const dni = req.query.dni;
  const numeroXDATA = process.env.XDATA_NUMERO;

  if (!dni || !numeroXDATA) {
    return res.send("❌ Parámetros no válidos (DNI o número XDATA faltante)");
  }

  const mensaje = `/dni${dni}`;

  try {
    await client.sendMessage(numeroXDATA, mensaje);
    const respuesta = await esperarRespuesta(numeroXDATA, 15000);
    res.send(respuesta || "⏳ Sin respuesta del bot XDATA");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al enviar mensaje: " + error.message);
  }
});

// Endpoint base
app.get("/", (req, res) => {
  res.send("✅ Servidor activo - WhatsApp XDATA Consulta");
});

// Iniciar servidor
app.listen(port, () => {
  console.log("🚀 Servidor ejecutándose en puerto " + port);
});
