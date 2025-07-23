const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/static", express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>QR Bot Pyrogram</title></head>
      <body style="text-align:center;padding-top:50px;">
        <h1>Escanea el QR desde tu app</h1>
        <img src="/static/qr.png" style="width:300px;height:auto;" />
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
