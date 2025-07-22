const qrcode = require('qrcode');
const { Client } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

let qrCodeData = null;

const client = new Client();

client.on('qr', (qr) => {
    // Guarda el QR para mostrarlo en la web
    qrCodeData = qr;
    console.log('QR recibido, escanéalo en http://localhost:' + port);
});

client.on('ready', () => {
    console.log('Cliente listo!');
});

client.initialize();

app.get('/', async (req, res) => {
    if (!qrCodeData) {
        return res.send('Esperando QR...');
    }
    try {
        const qrImage = await qrcode.toDataURL(qrCodeData);
        res.send(`<h2>Escanea este QR con WhatsApp Web:</h2><img src="${qrImage}" />`);
    } catch (err) {
        res.send('Error generando el código QR');
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
