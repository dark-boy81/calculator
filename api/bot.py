import os
from flask import Flask, request, jsonify
import telegram
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, CallbackQueryHandler, ContextTypes

# Configuration
BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
VERCEL_URL = os.getenv('VERCEL_URL')  # Your Vercel deployment URL
WEBHOOK_PATH = f"/webhook/{BOT_TOKEN}"
WEBHOOK_URL = f"{VERCEL_URL}{WEBHOOK_PATH}"

app = Flask(__name__)
bot = telegram.Bot(token=BOT_TOKEN)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("Open Calculator", web_app=WebAppInfo(url=VERCEL_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "Welcome to the Smart Calculator Bot! 🧮\n\n"
        "Click the button below to open the calculator:",
        reply_markup=reply_markup
    )

async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    data = json.loads(update.message.web_app_data.data)
    # You can process data from your web app here if needed
    await update.message.reply_text(f"Received data from web app: {data}")

async def setup_bot():
    application = ApplicationBuilder().token(BOT_TOKEN).build()
    
    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    
    # Set webhook
    await bot.set_webhook(WEBHOOK_URL)
    
    return application

@app.route(WEBHOOK_PATH, methods=["POST"])
async def webhook():
    application = await setup_bot()
    update = Update.de_json(await request.get_json(), bot)
    await application.process_update(update)
    return jsonify({"status": "ok"})

@app.route("/")
def index():
    return "Telegram Calculator Bot is running!"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
