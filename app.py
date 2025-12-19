import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# --- КОНФИГУРАЦИЯ ---
API_KEY = "AIzaSyA1599Xpw9MJf-qJLhSxUyNSwYyE2KnkaI" 

app = Flask(__name__)
# Разрешаем CORS, чтобы GitHub Pages мог достучаться до Render
CORS(app, resources={r"/api/*": {"origins": "*"}})

client = None
try:
    genai.configure(api_key=API_KEY)
    # Используем -latest, чтобы избежать ошибки 404
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    print("Сервер Санты готов к чудесам!")
except Exception as e:
    print(f"Ошибка API: {e}")

ERROR_MESSAGES = {
    "ru": "Ох, олени запутались! (Попробуй через 30 секунд, Санте нужно передохнуть)",
    "en": "Oh, the reindeer got tangled! (Please try again in 30 seconds)",
    "de": "Oh, die Rentiere haben sich verfangen! (Versuchen Sie es in 30 Sekunden erneut)",
    "fr": "Oh, les rennes se sont emmêlés ! (Réessayez dans 30 secondes)",
    "es": "¡Oh, los renos se han enredado! (Inténtalo de nuevo en 30 segundos)"
}

@app.route('/')
def home():
    return "Santa is Online!", 200

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        system_prompt = data.get('systemPrompt', 'Я — Санта Клаус.')
        
        if not user_message:
            return jsonify({"santaReply": "Хо-хо-хо! Я тебя не расслышал, повтори?"}), 200

        # Генерация контента через Gemini
        response = model.generate_content(
            user_message,
            generation_config=genai.types.GenerationConfig(temperature=0.7)
        )
        
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        error_text = str(e)
        print(f"Ошибка чата: {error_text}")
        return jsonify({"santaReply": f"Ой! Снежинка попала в провода: {error_text}"}), 200

if __name__ == '__main__':
    # Порт для Render
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
