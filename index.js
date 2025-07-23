const express = require("express");
const puppeteer = require("puppeteer"); // <- usamos puppeteer, no puppeteer-core
const app = express();

app.use(express.static("public"));

app.get("/", async (req, res) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.goto("https://web.whatsapp.com");
  await page.setViewport({ width: 1080, height: 1024 });

  const qrElement = await page.waitForSelector("canvas", { timeout: 15000 });
  const qrDataUrl = await qrElement.evaluate(canvas => canvas.toDataURL());

  await browser.close();

  const html = `
    <html>
      <body style="text-align: center;">
        <h2>Escanea el código QR</h2>
        <img src="${qrDataUrl}" />
      </body>
    </html>
  `;

  res.send(html);
});

app.listen(8080, () => {
  console.log("✅ Servidor corriendo en http://localhost:8080");
});
