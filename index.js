const express = require("express");
const axios = require("axios");
const path = require("path");
const { createCanvas, registerFont } = require("canvas");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/imagen", async (req, res) => {
  const dni = req.query.dni;
  const url = `https://poxy-production.up.railway.app/reniec?dni=${dni}&source=database`;

  try {
    const response = await axios.get(url);
    const { nombre, apellidoPaterno, apellidoMaterno } = response.data;

    const canvas = createCanvas(600, 200);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 28px Arial";
    ctx.fillText(`DNI: ${dni}`, 50, 70);
    ctx.fillText(`Nombre: ${nombre}`, 50, 110);
    ctx.fillText(`Apellidos: ${apellidoPaterno} ${apellidoMaterno}`, 50, 150);

    res.setHeader("Content-Type", "image/png");
    canvas.pngStream().pipe(res);
  } catch (error) {
    res.status(500).send("Error generando imagen");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
