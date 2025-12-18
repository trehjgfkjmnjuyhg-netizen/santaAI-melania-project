import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

# --- КОНФИГУРАЦИЯ ---
API_KEY = "AIzaSyCi0AooUUV8I2wo2mvOaPT2_xyWbcCDNIs" 

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

client = None
try:
    if API_KEY:
        client = genai.Client(api_key=API_KEY)
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

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    data = request.get_json()
    user_message = data.get('message', '')
    system_prompt = data.get('systemPrompt', 'Я — Санта Клаус.')
    history_data = data.get('history', [])

    lang_code = "ru"
    if "Santa Claus" in system_prompt: lang_code = "en"
    elif "Weihnachtsmann" in system_prompt: lang_code = "de"
    elif "Père Noël" in system_prompt: lang_code = "fr"
    elif "Papá Noel" in system_prompt: lang_code = "es"
    
    contents = []
    for entry in history_data:
        contents.append(types.Content(role=entry['role'], parts=[types.Part(text=entry['content'])]))
    contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

    try:
        # ИСПРАВЛЕНИЕ 404: Используем прямое имя модели
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system_prompt, temperature=0.7)
        )
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        print(f"Ошибка: {e}")
        return jsonify({"santaReply": ERROR_MESSAGES.get(lang_code, ERROR_MESSAGES["ru"])}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')