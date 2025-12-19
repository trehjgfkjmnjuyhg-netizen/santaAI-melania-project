import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

# --- БЕЗОПАСНАЯ КОНФИГУРАЦИЯ ---
API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)
# Разрешаем CORS только для твоего домена GitHub для безопасности
CORS(app)

client = None
if API_KEY:
    try:
        client = genai.Client(api_key=API_KEY)
        print("Сервер Санты готов к чудесам!")
    except Exception as e:
        print(f"Ошибка инициализации API: {e}")

@app.route('/')
def home():
    return "Santa is Secure and Online!", 200

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    if not client:
        return jsonify({"santaReply": "Ошибка: API ключ не настроен на сервере."}), 500
    
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        system_prompt = data.get('systemPrompt', 'Я — Санта Клаус.')
        
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.7
            )
        )
        
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        print(f"Ошибка чата: {e}")
        return jsonify({"santaReply": "Хо-хо-хо! Олени запутались в проводах, попробуй еще раз!"}), 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
