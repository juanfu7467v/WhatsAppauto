from pyrogram import Client
import qrcode
import os

api_id = int(os.environ.get("API_ID"))
api_hash = os.environ.get("API_HASH"))

app = Client("my_account", api_id=api_id, api_hash=api_hash)

async def main():
    print("Iniciando sesión...")
    qr = await app.export_login_qr_code()
    img = qrcode.make(qr.token)
    img.save("static/qr.png")
    print("✅ QR generado. Escanea desde WhatsApp web.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
