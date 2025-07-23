const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 8080;

// Ruta de consulta
app.get("/consulta", async (req, res) => {
  const dni = req.query.dni;
  if (!dni || dni.length !== 8) {
    return res.status(400).send("DNI inválido");
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://web.whatsapp.com", { waitUntil: "networkidle2" });

    // Acá puedes usar un selector real si ya estás logueado con WhatsApp Web
    // o automatizar el envío del mensaje al bot XDATA

    await browser.close();
    res.send(`Mensaje /dni${dni} enviado a XDATA (simulado)`);
  } catch (error) {
    console.error("Error al abrir WhatsApp Web:", error);
    res.status(500).send("Error interno");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
