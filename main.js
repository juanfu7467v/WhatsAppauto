const { create, Client } = require('venom');

create({
  session: 'whatsapp-session',
  multidevice: true, // Actívalo si usas WhatsApp Business
  headless: false,   // Abre navegador visible para escanear el QR fácilmente
  devtools: false,
  useChrome: true,
  logQR: false,      // Desactiva QR en consola (que se ve muy largo)
  browserArgs: ['--no-sandbox', '--window-size=800,800'], // tamaño ideal del navegador
})
  .then((client) => start(client))
  .catch((erro) => {
    console.log('[ERROR]', erro);
  });

function start(client) {
  console.log('✅ Bot iniciado correctamente');

  client.onMessage(async (message) => {
    if (message.body.toLowerCase() === 'hola' && !message.isGroupMsg) {
      await client.sendText(message.from, '👋 Hola, ¿en qué puedo ayudarte?');
    }

    if (message.body.toLowerCase() === 'info') {
      await client.sendText(message.from, '📄 Soy un bot automático en desarrollo.');
    }
  });
}
