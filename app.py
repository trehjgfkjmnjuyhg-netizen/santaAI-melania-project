import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

API_KEY = "AIzaSyCi0AooUUV8I2wo2mvOaPT2_xyWbcCDNIs"

app = Flask(__name__)
CORS(app)

client = genai.Client(api_key=API_KEY)

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    data = request.get_json()
    user_message = data.get('message', '')
    system_prompt = data.get('systemPrompt', 'Я — Санта Клаус.')
    history_data = data.get('history', [])

    contents = [types.Content(role=e['role'], parts=[types.Part(text=e['content'])]) for e in history_data]
    contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system_prompt)
        )
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        return jsonify({"santaReply": "Ох, олени запутались в снегу!"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
