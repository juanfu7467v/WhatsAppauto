const venom = require('venom-bot');

venom
  .create({
    headless: true,
    useChrome: false,
    args: ['--no-sandbox']
  })
  .then((client) => start(client))
  .catch((err) => {
    console.error('Error al iniciar el bot:', err);
  });

function start(client) {
  client.onMessage(async (message) => {
    if (message.body === 'hola' && message.isGroupMsg === false) {
      await client.sendText(message.from, '¡Hola! Soy un bot en Railway 🚀');
    }
  });
}
