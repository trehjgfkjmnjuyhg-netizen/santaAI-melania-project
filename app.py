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
    "ru": "Ох, олени запутались! (Попробуй через 30 секунд)",
    "en": "Oh, the reindeer got tangled! (Please try again in 30 seconds)",
    "de": "Oh, die Rentiere haben sich verfangen!",
    "fr": "Oh, les rennes se sont emmêlés !",
    "es": "¡Oh, los renos se han enredado!"
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
            model='gemini-1.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system_prompt, temperature=0.7)
        )
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        return jsonify({"santaReply": ERROR_MESSAGES.get(lang_code, ERROR_MESSAGES["ru"])}), 500

if __name__ == '__main__':
    app.run(debug=True, port=int(os.environ.get("PORT", 5001)), host='0.0.0.0')
