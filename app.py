import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

# Ключ будет браться из настроек Render (Environment Variables)
API_KEY = os.environ.get("GEMINI_API_KEY") 

app = Flask(__name__)
CORS(app)

client = None
try:
    if API_KEY:
        client = genai.Client(api_key=API_KEY)
except Exception as e:
    print(f"Ошибка API: {e}")

ERROR_MESSAGES = {
    "ru": "Санта кормит своих оленей, напиши ему через 30 секунд и он обязательно ответит!",
    "en": "Santa is feeding his reindeer, write to him in 30 seconds and he will definitely answer!",
    "de": "Der Weihnachtsmann füttert seine Rentiere, schreib ему in 30 Sekunden и er wird bestimmt antworten!",
    "fr": "Le Père Noël nourrit ses rennes, écrivez-lui dans 30 secondes et il répondra certainement !",
    "es": "¡Papá Noel está alimentando a sus renos, escríbele в 30 segundos y te responderá sin duda!"
}

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    data = request.get_json()
    user_message = data.get('message', '')
    system_prompt = data.get('systemPrompt', 'Я — Санта Клаус.')
    history_data = data.get('history', [])

    lang_code = "ru"
    if "Santa" in system_prompt: lang_code = "en"
    
    contents = []
    for entry in history_data:
        role = "model" if entry['role'] == 'assistant' else "user"
        contents.append(types.Content(role=role, parts=[types.Part(text=entry['content'])]))
    contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system_prompt, temperature=0.7)
        )
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        return jsonify({"santaReply": ERROR_MESSAGES.get(lang_code, ERROR_MESSAGES["ru"])}), 500

if __name__ == '__main__':
    app.run(debug=True, port=int(os.environ.get("PORT", 5001)), host='0.0.0.0')
