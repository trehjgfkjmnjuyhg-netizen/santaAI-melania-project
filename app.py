import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

API_KEY = "AIzaSyCi0AooUUV8I2wo2mvOaPT2_xyWbcCDNIs"

app = Flask(__name__)
CORS(app)

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/')
def home(): return "OK", 200

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    try:
        data = request.get_json()
        # Сервер теперь готов ко всему: и к простому тексту, и к сложным объектам
        user_msg = data.get('message', '')
        response = model.generate_content(f"Ты добрый Санта Клаус. Ответь ребенку: {user_msg}")
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        return jsonify({"santaReply": "Хо-хо-хо! Напиши мне еще раз, олени задели провода!"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
