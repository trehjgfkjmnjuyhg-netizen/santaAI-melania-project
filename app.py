import os
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Настройка Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

# Настройки D-ID
DID_API_KEY = os.getenv("DID_API_KEY")
SANTA_PHOTO = os.getenv("SANTA_IMAGE_URL")

def create_santa_video(text, lang):
    url = "https://api.d-id.com/talks"
    voices = {
        "ru": "ru-RU-DmitryNeural", "en": "en-US-ChristopherNeural",
        "fr": "fr-FR-HenriNeural", "de": "de-DE-ConradNeural", "es": "es-ES-AlvaroNeural"
    }
    voice_id = voices.get(lang, "ru-RU-DmitryNeural")
    payload = {
        "script": {
            "type": "text", "subtitles": "false",
            "provider": {"type": "microsoft", "voice_id": voice_id}, "input": text
        },
        "config": {"fluent": "true", "pad_audio": "0.0"},
        "source_url": SANTA_PHOTO
    }
    headers = {
        "accept": "application/json", "content-type": "application/json",
        "authorization": f"Basic {DID_API_KEY}"
    }
    try:
        res = requests.post(url, json=payload, headers=headers)
        talk_id = res.json().get("id")
        if not talk_id: return None
        for _ in range(30):
            status_res = requests.get(f"{url}/{talk_id}", headers=headers)
            data = status_res.json()
            if data.get("status") == "done": return data.get("result_url")
            time.sleep(2)
    except: return None

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    data = request.json
    user_msg = data.get("message")
    lang = data.get("lang", "ru")
    try:
        # Ответ от Gemini
        response = model.generate_content(f"Ты Санта Клаус. Ответь кратко на: {user_msg}")
        santa_text = response.text
        # Видео от D-ID
        video_url = create_santa_video(santa_text, lang)
        return jsonify({"santaReply": santa_text, "videoUrl": video_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
