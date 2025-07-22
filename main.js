const venom = require('venom-bot');
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

venom
  .create({
    session: 'whatsapp-session',
    headless: true,
    multidevice: true,
  })
  .then((client) => start(client))
  .catch((e) => console.error(e));

function start(client) {
  client.onMessage(async (message) => {
    if (message.body && !message.isGroupMsg) {
      const parts = message.body.trim().split(' ');
      const command = parts[0].toLowerCase().replace('/', '');
      const param = parts[1];

      if (!command || !param) return;

      const url = `https://poxy-production.up.railway.app/${command}?dni=${param}&source=database`;

      try {
        const response = await axios.get(url);
        await client.sendText(
          message.from,
          `✅ Resultado para /${command} ${param}:\n\n${JSON.stringify(response.data, null, 2)}`
        );
      } catch (err) {
        await client.sendText(message.from, `❌ Error al consultar /${command} ${param}`);
      }
    }
  });
}

app.get('/', (req, res) => res.send('✅ Bot corriendo correctamente en Railway'));
app.listen(PORT, () => console.log(`🚀 Servidor Express en http://localhost:${PORT}`));
