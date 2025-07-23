import express from 'express'
import { default as makeWASocket, useMultiFileAuthState, DisconnectReason, makeInMemoryStore } from '@whiskeysockets/baileys'
import P from 'pino'
import { Boom } from '@hapi/boom'

const app = express()
const PORT = process.env.PORT || 8080
let sock

const store = makeInMemoryStore({ logger: P().child({ level: 'debug', stream: 'store' }) })

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' })
  })

  store.bind(sock.ev)

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('conexión cerrada. ¿Reconectar?', shouldReconnect)
      if (shouldReconnect) connectToWhatsApp()
    } else if (connection === 'open') {
      console.log('✅ Conectado a WhatsApp')
    }
  })

  return sock
}

connectToWhatsApp()

// API: recibir un DNI y reenviar /dni12345678 a XDATA
app.get('/consulta', async (req, res) => {
  const dni = req.query.dni
  if (!dni || dni.length !== 8) {
    return res.status(400).send('DNI inválido')
  }

  try {
    const jid = '51999999999@s.whatsapp.net' // ← cambia por el número de XDATA (con código país, sin +)
    const mensaje = `/dni${dni}`

    await sock.sendMessage(jid, { text: mensaje })
    console.log(`✅ Mensaje enviado: ${mensaje}`)

    res.send(`Mensaje enviado a XDATA: ${mensaje}`)
  } catch (err) {
    console.error('❌ Error al enviar mensaje:', err)
    res.status(500).send('Error al enviar mensaje')
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})
