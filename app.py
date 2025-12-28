import os
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# === ТВОИ КЛЮЧИ ===
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
SANTA_PHOTO = os.getenv("SANTA_IMAGE_URL")
# Это твой рабочий токен (Email + Ключ JgC42cg_IgxYY3mSM4Ns0)
D_ID_TOKEN = "dHJlaGpnZmtqbW5qdXloZ0BnbWFpbC5jb206SmdDNDJjZ19JZ3hZWTNtU000TnMw"

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
    model = genai.GenerativeModel('gemini-pro')

def get_video(text):
    url = "https://api.d-id.com/talks"
    headers = {
        "Authorization": f"Basic {D_ID_TOKEN}",
        "Content-Type": "application/json"
    }
    body = {
        "source_url": SANTA_PHOTO,
        "script": {
            "type": "text",
            "input": text,
            "provider": {"type": "microsoft", "voice_id": "ru-RU-DmitryNeural"}
        }
    }
    try:
        res = requests.post(url, json=body, headers=headers, timeout=10)
        if res.status_code not in [200, 201]:
            print(f"D-ID API Error: {res.text}")
            return None
        
        task_id = res.json().get("id")
        for _ in range(25):
            time.sleep(2)
            check = requests.get(f"{url}/{task_id}", headers=headers)
            data = check.json()
            if data.get("status") == "done":
                return data.get("result_url")
    except Exception as e:
        print(f"Video fail: {e}")
        return None
    return None

@app.route('/api/santa-chat', methods=['POST'])
def chat():
    try:
        data = request.json
        msg = data.get("message", "")
        
        # 1. Текст
        res = model.generate_content(f"Ты Санта. Ответь кратко (2 фразы): {msg}")
        reply_text = res.text
        
        # 2. Видео
        video = get_video(reply_text)
        
        return jsonify({
            "santaReply": reply_text,
            "videoUrl": video
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"santaReply": "Олени застряли! Попробуй еще раз.", "videoUrl": None})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
