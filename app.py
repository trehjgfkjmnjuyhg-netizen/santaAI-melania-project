import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

# Твой ключ
API_KEY = "AIzaSyCi0AooUUV8I2wo2mvOaPT2_xyWbcCDNIs"

app = Flask(__name__)
CORS(app)
client = genai.Client(api_key=API_KEY)

@app.route('/')
def home():
    return "Santa Server is Live!", 200

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        # Запрос к ИИ с правильным названием модели
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction="Ты — добрый Санта Клаус. Отвечай тепло и сказочно.",
                temperature=0.7
            )
        )
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        print(f"Ошибка: {e}")
        return jsonify({"santaReply": "Ох, олени запутались! Попробуй еще раз."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
