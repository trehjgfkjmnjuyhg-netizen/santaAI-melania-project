import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import logging

# Настройка логирования для Render
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Разрешаем запросы с вашего сайта на GitHub Pages
CORS(app, resources={r"/chat": {"origins": "*"}})

# Получаем API ключ из переменных окружения Render
API_KEY = os.environ.get('GEMINI_API_KEY')

# Инициализация клиента Google AI с принудительной версией v1
try:
    if API_KEY:
        client = genai.Client(
            api_key=API_KEY,
            http_options={'api_version': 'v1'}
        )
        logger.info("✅ Сервер Санты успешно подключен к ИИ (v1)!")
    else:
        logger.error("❌ ОШИБКА: GEMINI_API_KEY не найден в настройках Render!")
except Exception as e:
    logger.error(f"❌ Ошибка при запуске клиента: {str(e)}")

@app.route('/')
def home():
    return "Santa's API Server is Running!"

@app.route('/chat', def post_chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        user_lang = data.get('lang', 'ru')

        if not user_message:
            return jsonify({"error": "Пустое сообщение"}), 400

        logger.info(f"📩 Получено сообщение для Санты: {user_message[:50]}...")

        # Промпт для Санты (его характер)
        system_instruction = (
            "Ты — добрый Дедушка Мороз (Санта-Клаус). Отвечай очень тепло, сказочно и дружелюбно. "
            "Используй новогодние эмодзи 🎅🎄🎁. Если ребенок просит подарок, пообещай рассмотреть "
            "его просьбу, если он будет вести себя хорошо. Отвечай на языке пользователя."
        )

        # Запрос к модели Gemini 1.5 Flash
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=user_message,
            config={
                'system_instruction': system_instruction,
                'temperature': 0.8,
            }
        )

        santa_reply = response.text
        logger.info("✨ Санта успешно придумал ответ!")
        
        return jsonify({"reply": santa_reply})

    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ Критическая ошибка в работе Санты: {error_msg}")
        return jsonify({
            "error": "Олени запутались в проводах",
            "details": error_msg
        }), 500

if __name__ == '__main__':
    # Render использует порт из переменной окружения PORT
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
