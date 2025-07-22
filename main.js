const venom = require('venom');

venom
  .create({
    session: 'whatsapp-session',
    multidevice: true,
    headless: false, // Importante: desactivamos headless para ver la ventana
    devtools: false,
    useChrome: true,
    debug: false,
    logQR: true,
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--window-size=800,800' // Tamaño adecuado de la ventana para ver el QR
    ],
  })
  .then((client) => start(client))
  .catch((error) => {
    console.error('Error al iniciar Venom:', error);
  });

function start(client) {
  client.onMessage(async (message) => {
    if (message.body === 'hola' && message.isGroupMsg === false) {
      await client.sendText(message.from, 'Hola, ¿cómo estás?');
    }
  });
}
