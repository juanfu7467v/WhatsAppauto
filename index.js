const express = require("express");
const { create } = require("venom-bot");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const numeroDestino = process.env.NUMERO_DESTINO; // ejemplo: "51999999999@c.us"

create({
  session: "xdata-sesion",
  headless: true,
  browserArgs: ['--no-sandbox', '--disable-setuid-sandbox']
})
  .then((client) => start(client))
  .catch((error) => console.log("Error al iniciar venom:", error));

function start(client) {
  app.get("/mensaje", async (req, res) => {
    const dni = req.query.dni;
    if (!dni) return res.status(400).json({ error: "Falta el parámetro DNI" });

    const mensaje = `/dni${dni}`;
    try {
      await client.sendText(numeroDestino, mensaje);
      res.json({ status: "enviado", mensaje });
    } catch (err) {
      res.status(500).json({ status: "error", error: err.message });
    }
  });

  app.get("/", (req, res) => {
    res.send("✅ API de envío de DNI vía WhatsApp está activa.");
  });

  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  });
}
