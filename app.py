import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# Твой API ключ
API_KEY = "AIzaSyCi0AooUUV8I2wo2mvOaPT2_xyWbcCDNIs"

app = Flask(__name__)
CORS(app)

# Настройка подключения
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/')
def home():
    return "OK", 200

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    try:
        data = request.get_json()
        user_msg = data.get('message', '')
        # Самый прямой вызов ИИ без лишних настроек
        response = model.generate_content(user_msg)
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"santaReply": "Санта занят подарками, попробуй еще раз!"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
