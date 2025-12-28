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

def create_santa_video(text, lang):
    url = "https://api.d-id.com/talks"
    # Это закодированный токен (ваша почта + ключ)
    auth_token = "dHJlaGpnZmtqbW5qdXloZ0BnbWFpbC5jb206SmdDNDJjZ19JZ3hZWTNtU000TnMw"
    
    voices = {"ru": "ru-RU-DmitryNeural", "en": "en-US-ChristopherNeural"}
    voice_id = voices.get(lang, "ru-RU-DmitryNeural")
    
    payload = {
        "script": {
            "type": "text", 
            "provider": {"type": "microsoft", "voice_id": voice_id}, 
            "input": text
        },
        "source_url": os.getenv("SANTA_IMAGE_URL")
    }
    
    headers = {
        "accept": "application/json", 
        "content-type": "application/json",
        "authorization": f"Basic {auth_token}"
    }

    try:
        res = requests.post(url, json=payload, headers=headers)
        if res.status_code not in [200, 201]: return None
        
        talk_id = res.json().get("id")
        for _ in range(25):
            status_res = requests.get(f"{url}/{talk_id}", headers=headers)
            data = status_res.json()
            if data.get("status") == "done": return data.get("result_url")
            time.sleep(2)
    except:
        return None
    return None

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    try:
        data = request.json
        user_msg = data.get("message")
        lang = data.get("lang", "ru")
        
        response = model.generate_content(f"Ты — Санта. Кратко ответь ребенку: {user_msg}")
        santa_text = response.text
        
        video_url = create_santa_video(santa_text, lang)
        
        return jsonify({"santaReply": santa_text, "videoUrl": video_url})
    except Exception as e:
        return jsonify({"santaReply": "Хо-хо-хо! Попробуй еще раз!", "videoUrl": None}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
