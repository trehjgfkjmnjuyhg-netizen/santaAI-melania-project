import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app) # Разрешаем сайту обращаться к серверу

API_KEY = os.environ.get('GEMINI_API_KEY')

client = None
try:
    if API_KEY:
        client = genai.Client(api_key=API_KEY, http_options={'api_version': 'v1'})
        logger.info("✅ Сервер Санты успешно подключен к ИИ (v1)!")
    else:
        logger.error("❌ ОШИБКА: Ключ не найден!")
except Exception as e:
    logger.error(f"❌ Ошибка клиента: {str(e)}")

@app.route('/')
def home():
    return "Santa's API is Running!", 200

@app.route('/chat', methods=['POST'])
def post_chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        # Инструкция для ИИ
        system_instruction = "Ты — добрый Дедушка Мороз. Отвечай сказочно и тепло с эмодзи 🎅🎄. Отвечай на языке пользователя."

        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=user_message,
            config={'system_instruction': system_instruction, 'temperature': 0.8}
        )
        
        return jsonify({"reply": response.text})
    except Exception as e:
        logger.error(f"❌ Ошибка: {str(e)}")
        return jsonify({"error": "Олени запутались в проводах"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
