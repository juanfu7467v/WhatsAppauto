const { create } = require('venom');
const fs = require('fs');

create({
  session: 'whatsapp-session',
  multidevice: true,
  headless: true,
  useChrome: true,
  logQR: false, // No mostrar QR en consola
  browserArgs: ['--no-sandbox'],
})
  .then((client) => start(client))
  .catch((erro) => {
    console.log('[ERROR]', erro);
  });

function start(client) {
  console.log('✅ Bot iniciado correctamente');

  client.onMessage(async (message) => {
    if (message.body === 'hola' && !message.isGroupMsg) {
      await client.sendText(message.from, '👋 Hola, ¿en qué puedo ayudarte?');
    }

    if (message.body === 'info') {
      await client.sendText(message.from, '📄 Este es un bot automático.');
    }
  });
}
