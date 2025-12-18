import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

# --- КОНФИГУРАЦИЯ БЕЗОПАСНОСТИ ---
# Берем ключ из "Environment Variables" на Render
API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)
# Упрощенный CORS для максимальной совместимости
CORS(app)

client = None
if API_KEY:
    try:
        client = genai.Client(api_key=API_KEY)
        print("Сервер Санты успешно подключен к ИИ!")
    except Exception as e:
        print(f"Ошибка подключения к Google AI Studio: {e}")
else:
    print("ВНИМАНИЕ: Переменная GEMINI_API_KEY не найдена!")

ERROR_MESSAGES = {
    "ru": "Ох, олени запутались! Санте нужно немного передохнуть.",
    "en": "Oh, the reindeer got tangled! Santa needs a little break.",
    "de": "Oh, die Rentiere haben sich verfangen! Santa braucht eine Pause.",
    "fr": "Oh, les rennes se sont emmêlés ! Le Père Noël a besoin d'une pause.",
    "es": "¡Oh, los renos se han enredado! Papá Noel necesita un descanso."
}

@app.route('/api/santa-chat', methods=['POST', 'OPTIONS'])
def santa_chat():
    # Обработка предварительных запросов браузера (CORS preflight)
    if request.method == 'OPTIONS':
        return '', 204

    if not client:
        return jsonify({"santaReply": "Ошибка конфигурации сервера (API Key missing)"}), 500
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({"santaReply": "Пустой запрос"}), 400

        user_message = data.get('message', '')
        system_prompt = data.get('systemPrompt', 'Я — Санта Клаус.')
        history_data = data.get('history', [])

        # Определяем язык для сообщения об ошибке на основе промпта
        lang_code = "ru"
        if "Santa Claus" in system_prompt: lang_code = "en"
        elif "Weihnachtsmann" in system_prompt: lang_code = "de"
        elif "Père Noël" in system_prompt: lang_code = "fr"
        elif "Papá Noel" in system_prompt: lang_code = "es"
        
        # Формируем историю для ИИ
        contents = []
        for entry in history_data:
            role = "user" if entry['role'] == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part(text=entry['content'])]))
        
        contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

        # Запрос к Gemini
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system_prompt, temperature=0.7)
        )
        
        return jsonify({"santaReply": response.text}), 200

    except Exception as e:
        print(f"Ошибка при генерации ответа: {e}")
        return jsonify({"santaReply": ERROR_MESSAGES.get(lang_code, ERROR_MESSAGES["ru"])}), 500

if __name__ == '__main__':
    # Render автоматически подставит нужный порт
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=False, port=port, host='0.0.0.0')
