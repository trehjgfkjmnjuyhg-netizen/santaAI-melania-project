import os
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Настройка Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SANTA_IMAGE_URL = os.getenv("SANTA_IMAGE_URL")
# Закодированный токен (Email + Ключ)
AUTH_TOKEN = "dHJlaGpnZmtqbW5qdXloZ0BnbWFpbC5jb206SmdDNDJjZ19JZ3hZWTNtU000TnMw"

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-pro")

def generate_video(text, lang):
    print(f"--- [START] Генерация видео для: {text[:30]}... ---")
    url = "https://api.d-id.com/talks"
    
    voices = {
        "ru": "ru-RU-DmitryNeural", "en": "en-US-ChristopherNeural",
        "fr": "fr-FR-HenriNeural", "de": "de-DE-ConradNeural", "es": "es-ES-AlvaroNeural"
    }
    voice_id = voices.get(lang, "ru-RU-DmitryNeural")

    headers = {
        "Authorization": f"Basic {AUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "source_url": SANTA_IMAGE_URL,
        "script": {
            "type": "text",
            "input": text,
            "provider": { "type": "microsoft", "voice_id": voice_id }
        },
        "config": { "fluent": "true", "pad_audio": "0.0" }
    }

    try:
        res = requests.post(url, json=payload, headers=headers, timeout=15)
        # ВЫВОДИМ ОШИБКУ D-ID В ЛОГИ RENDER
        if res.status_code not in [200, 201]:
            print(f"--- [D-ID ERROR] Код: {res.status_code} | Ответ: {res.text} ---")
            return None
        
        talk_id = res.json().get("id")
        print(f"--- [D-ID] Задача создана, ID: {talk_id} ---")

        for i in range(30):
            time.sleep(2)
            status_res = requests.get(f"{url}/{talk_id}", headers=headers)
            data = status_res.json()
            print(f"--- [D-ID] Попытка {i+1}, статус: {data.get('status')} ---")
            
            if data.get("status") == "done":
                return data.get("result_url")
            if data.get("status") == "error":
                print(f"--- [D-ID ERROR] Сбой обработки: {data} ---")
                return None
    except Exception as e:
        print(f"--- [CRITICAL ERROR] {str(e)} ---")
        return None
    return None

@app.route("/api/santa-chat", methods=["POST"])
def chat():
    try:
        data = request.json
        msg = data.get("message", "")
        lang = data.get("lang", "ru")

        response = model.generate_content(f"Ты добрый Санта. Ответь кратко на языке {lang}: {msg}")
        reply_text = response.text
        print(f"--- [GEMINI] Ответ: {reply_text} ---")

        video_url = generate_video(reply_text, lang)

        return jsonify({
            "santaReply": reply_text,
            "videoUrl": video_url
        })
    except Exception as e:
        print(f"--- [SERVER ERROR] {str(e)} ---")
        return jsonify({"santaReply": "Хо-хо-хо! Попробуй еще раз!", "videoUrl": None}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
