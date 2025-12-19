import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# --- КОНФИГУРАЦИЯ ---
# Используем ваш рабочий ключ
API_KEY = "AIzaSyA1599Xpw9MJf-qJLhSxUyNSwYyE2KnkaI" 

app = Flask(__name__)
# Разрешаем запросы со всех адресов (важно для работы GitHub Pages + Render)
CORS(app)

try:
    genai.configure(api_key=API_KEY)
    # Используем версию -latest для стабильной работы в интернете
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    print("Сервер Санты готов к чудесам!")
except Exception as e:
    print(f"Ошибка настройки API: {e}")

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
            return jsonify({"santaReply": "Хо-хо-хо! Я тебя не расслышал."}), 200

        # Запрос к нейросети
        response = model.generate_content(
            user_message,
            generation_config={"temperature": 0.7}
        )
        
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        print(f"Ошибка: {e}")
        return jsonify({"santaReply": ERROR_MESSAGES["ru"]}), 200

if __name__ == '__main__':
    # На Render порт назначается автоматически через переменную окружения
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
