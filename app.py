import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# Твой ключ
API_KEY = "AIzaSyA1599Xpw9MJf-qJLhSxUyNSwYyE2KnkaI"

app = Flask(__name__)
CORS(app)

try:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Ошибка настройки API: {e}")

@app.route('/')
def home():
    return "Santa is Online!", 200

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    try:
        data = request.get_json()
        user_msg = data.get('message', '')
        
        # Пробуем получить ответ от ИИ
        response = model.generate_content(user_msg)
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        print(f"Ошибка чата: {e}")
        # Если ключ не работает, мы увидим это в чате
        return jsonify({"santaReply": "Хо-хо-хо! Мой магический ключ API замерз. Проверь его в Google AI Studio!"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
