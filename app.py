import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import logging

# Настройка логирования для отслеживания работы в Render
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Разрешаем запросы со всех доменов (включая ваш GitHub Pages)
CORS(app)

# Получаем API ключ из переменных окружения Render
API_KEY = os.environ.get('GEMINI_API_KEY')

# Инициализация клиента Google AI с принудительной версией v1
client = None
try:
    if API_KEY:
        client = genai.Client(
            api_key=API_KEY,
            http_options={'api_version': 'v1'}
        )
        logger.info("✅ Сервер Санты успешно подключен к ИИ (v1)!")
    else:
        logger.error("❌ ОШИБКА: API ключ не найден в настройках Render!")
except Exception as e:
    logger.error(f"❌ Ошибка инициализации клиента: {str(e)}")

@app.route('/')
def home():
    return "Santa's API Server is Running!", 200

@app.route('/chat', methods=['POST'])
def post_chat():
    if not client:
        return jsonify({"error": "Сервер ИИ не инициализирован"}), 500
        
    try:
        data = request.json
        user_message = data.get('message', '')

        if not user_message:
            return jsonify({"error": "Пустое сообщение"}), 400

        logger.info(f"📩 Получено сообщение: {user_message[:50]}...")

        # Настройка личности Санты
        system_instruction = (
            "Ты — добрый Дедушка Мороз (Санта-Клаус). Отвечай тепло и сказочно. "
            "Используй новогодние эмодзи 🎅🎄🎁. Отвечай на языке пользователя."
        )

        # Запрос к модели Gemini 1.5 Flash (без лишних префиксов)
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=user_message,
            config={
                'system_instruction': system_instruction,
                'temperature': 0.8,
            }
        )

        santa_reply = response.text
        logger.info("✨ Ответ от Санты успешно получен!")
        
        return jsonify({"reply": santa_reply})

    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ Ошибка при генерации: {error_msg}")
        return jsonify({
            "error": "Олени запутались в проводах",
            "details": error_msg
        }), 500

if __name__ == '__main__':
    # Автоматический выбор порта для Render
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
