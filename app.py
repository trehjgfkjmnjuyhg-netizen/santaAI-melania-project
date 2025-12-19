import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# --- БЕЗОПАСНАЯ НАСТРОЙКА ---
API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)
# Разрешаем запросы со всех адресов для связи GitHub и Render
CORS(app, resources={r"/api/*": {"origins": "*"}})

try:
    if API_KEY:
        genai.configure(api_key=API_KEY)
        # Используем стабильную модель gemini-1.5-flash
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("Сервер Санты готов к чудесам!")
    else:
        print("ОШИБКА: Переменная GEMINI_API_KEY не найдена в Render!")
except Exception as e:
    print(f"Ошибка настройки API: {e}")

@app.route('/')
def home():
    return "Santa is Online and Secure!", 200

@app.route('/api/santa-chat', methods=['POST', 'OPTIONS'])
def santa_chat():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({"santaReply": "Хо-хо-хо! Я тебя не расслышал."}), 200

        # Прямой запрос к нейросети
        response = model.generate_content(user_message)
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        print(f"Ошибка: {e}")
        return jsonify({"santaReply": f"Ой! Снежинка попала в провода: {str(e)}"}), 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
