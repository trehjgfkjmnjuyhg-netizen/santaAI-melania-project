import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

app = Flask(__name__)
# Максимально простой CORS для работы с GitHub Pages
CORS(app)

# Берем ключ из настроек Render
API_KEY = os.environ.get('GEMINI_API_KEY')

# Инициализация клиента с явным указанием стабильной версии v1
client = None
if API_KEY:
    try:
        client = genai.Client(
            api_key=API_KEY,
            http_options={'api_version': 'v1'}
        )
        print("✅ Сервер Санты успешно подключен к ИИ (v1)!")
    except Exception as e:
        print(f"❌ Ошибка инициализации: {e}")

@app.route('/')
def health_check():
    return "Santa is awake!", 200

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    if not client:
        return jsonify({"santaReply": "Санта еще спит (ошибка API)"}), 500
        
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        system_prompt = data.get('systemPrompt', 'Ты — Санта Клаус.')
        
        # Запрос к модели без лишних префиксов
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.8
            )
        )
        
        return jsonify({"santaReply": response.text}), 200

    except Exception as e:
        print(f"❌ Ошибка генерации: {e}")
        return jsonify({"santaReply": "Ох, олени запутались! Попробуй еще раз через минуту."}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
