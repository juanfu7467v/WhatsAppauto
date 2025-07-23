const express = require("express");
const { createCanvas } = require("canvas");

const app = express();
const PORT = 8080;

app.get("/imagen", (req, res) => {
  const texto = req.query.texto || "Hola Mundo";

  const canvas = createCanvas(400, 200);
  const ctx = canvas.getContext("2d");

  // Fondo blanco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Texto negro
  ctx.fillStyle = "#000000";
  ctx.font = "bold 30px Arial";
  ctx.fillText(texto, 50, 100);

  res.setHeader("Content-Type", "image/png");
  canvas.pngStream().pipe(res);
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
