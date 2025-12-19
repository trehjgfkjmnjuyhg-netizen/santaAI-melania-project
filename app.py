import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai # Новая библиотека

API_KEY = "AIzaSyCi0AooUUV8I2wo2mvOaPT2_xyWbcCDNIs"

app = Flask(__name__)
CORS(app)
client = genai.Client(api_key=API_KEY) # Новый способ подключения

@app.route('/')
def home():
    return "Santa is ready!", 200

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    try:
        data = request.get_json()
        user_msg = data.get('message', 'Привет')
        
        # Новый формат вызова ИИ
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=f"Ты - Санта Клаус. Отвечай очень тепло и сказочно: {user_msg}"
        )
        
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"santaReply": "Хо-хо-хо! Мои эльфы уже несут твое письмо!"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
