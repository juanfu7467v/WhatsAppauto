// main.js
const { create, Client } = require('venom');

create({
  session: 'whatsapp-session',
  multidevice: true, // Usa true para WhatsApp Business o cuentas nuevas
  headless: false,    // Abre el navegador visible (NO oculto)
  useChrome: true,
  devtools: false,
  debug: false,
  logQR: true,       // Muestra QR en consola también
  browserArgs: ['--no-sandbox'],
})
  .then((client) => start(client))
  .catch((erro) => {
    console.log('[ERROR]', erro);
  });

function start(client) {
  console.log('✅ Bot iniciado correctamente');

  // Ejemplo de respuesta automática
  client.onMessage(async (message) => {
    if (message.body === 'hola' && message.isGroupMsg === false) {
      await client.sendText(message.from, '👋 Hola, ¿en qué puedo ayudarte?');
    }

    if (message.body === 'info') {
      await client.sendText(
        message.from,
        '📄 Este es un bot automático. Pronto agregaremos más funciones.'
      );
    }
  });
}
