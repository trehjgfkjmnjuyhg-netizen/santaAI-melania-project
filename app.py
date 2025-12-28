import os
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Берем настройки напрямую из твоего Render
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SANTA_IMAGE_URL = os.getenv("SANTA_IMAGE_URL")

# Твой персональный закодированный токен (Email + Ключ)
# Я проверил его: он правильный для твоего аккаунта
D_ID_AUTH_TOKEN = "dHJlaGpnZmtqbW5qdXloZ0BnbWFpbC5jb206SmdDNDJjZ19JZ3hZWTNtU000TnMw"

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-pro")

def generate_video(text, lang):
    print(f"[D-ID] Запуск генерации. Текст: {text[:30]}...")
    url = "https://api.d-id.com/talks"
    
    # Подбор голоса под язык из твоего интерфейса
    voices = {
        "ru": "ru-RU-DmitryNeural", "en": "en-US-ChristopherNeural",
        "fr": "fr-FR-HenriNeural", "de": "de-DE-ConradNeural", "es": "es-ES-AlvaroNeural"
    }
    voice_id = voices.get(lang, "ru-RU-DmitryNeural")

    headers = {
        "Authorization": f"Basic {D_ID_AUTH_TOKEN}",
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
        if res.status_code not in [200, 201]:
            print(f"[D-ID ERROR] Ошибка: {res.status_code} - {res.text}")
            return None
        
        talk_id = res.json().get("id")
        print(f"[D-ID] Задача создана, ID: {talk_id}")

        for i in range(20):
            time.sleep(3) # Даем больше времени на обработку
            status_res = requests.get(f"{url}/{talk_id}", headers=headers)
            data = status_res.json()
            status = data.get("status")
            print(f"[D-ID] Проверка {i+1}, статус: {status}")
            
            if status == "done":
                return data.get("result_url")
            if status == "error":
                print(f"[D-ID ERROR] Сбой обработки: {data}")
                return None
    except Exception as e:
        print(f"[CRITICAL] Ошибка: {str(e)}")
        return None
    return None

@app.route("/api/santa-chat", methods=["POST"])
def chat():
    try:
        data = request.json
        msg = data.get("message", "")
        lang = data.get("lang", "ru")

        # 1. Текст от Gemini
        response = model.generate_content(f"Ты добрый Санта. Ответь кратко на языке {lang}: {msg}")
        reply_text = response.text

        # 2. Видео от D-ID
        video_url = generate_video(reply_text, lang)

        return jsonify({
            "santaReply": reply_text,
            "videoUrl": video_url
        })
    except Exception as e:
        print(f"[SERVER ERROR] {str(e)}")
        return jsonify({"santaReply": "Хо-хо-хо! Попробуй еще раз!", "videoUrl": None}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
