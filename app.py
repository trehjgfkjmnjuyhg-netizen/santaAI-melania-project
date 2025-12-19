import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

API_KEY = "AIzaSyCi0AooUUV8I2wo2mvOaPT2_xyWbcCDNIs"

app = Flask(__name__)
CORS(app)

client = genai.Client(api_key=API_KEY)

# Добавляем переводы ошибок
ERROR_MESSAGES = {
    "ru": "Ох, олени запутались! Попробуй еще раз через минуту.",
    "en": "Oh, the reindeer got tangled! Please try again in a minute.",
    "de": "Oh, die Rentiere haben sich verfangen! Bitte versuchen Sie es in einer Minute erneut.",
    "fr": "Oh, les rennes se sont emmêlés ! Veuillez réessayer dans une minute.",
    "es": "¡Oh, los renos se han enredado! Por favor, inténtalo de nuevo en un minuto."
}

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    data = request.get_json()
    user_message = data.get('message', '')
    system_prompt = data.get('systemPrompt', 'Я — Санта Клаус.')
    history_data = data.get('history', [])

    # Определяем язык для ошибки по системному промпту
    lang = "ru"
    if "Santa Claus" in system_prompt: lang = "en"
    elif "Weihnachtsmann" in system_prompt: lang = "de"
    elif "Père Noël" in system_prompt: lang = "fr"
    elif "Papá Noel" in system_prompt: lang = "es"

    contents = []
    for entry in history_data:
        contents.append(types.Content(role=entry['role'], parts=[types.Part(text=entry['content'])]))
    contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system_prompt, temperature=0.7)
        )
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        print(f"Ошибка: {e}")
        return jsonify({"santaReply": ERROR_MESSAGES.get(lang, ERROR_MESSAGES["ru"])}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
