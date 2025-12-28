import os
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
# CORS необходим, чтобы браузер не блокировал запросы к Render
CORS(app)

# === КОНФИГУРАЦИЯ ===
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SANTA_IMAGE_URL = os.getenv("SANTA_IMAGE_URL")

# Твой личный закодированный токен (Email + API Key)
# Это решает проблему ошибки авторизации "Basic Auth"
AUTH_TOKEN = "dHJlaGpnZmtqbW5qdXloZ0BnbWFpbC5jb206SmdDNDJjZ19JZ3hZWTNtU000TnMw"

if not GEMINI_API_KEY:
    print("❌ ОШИБКА: GEMINI_API_KEY не найден в Environment")

# === Gemini Init ===
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-pro")

# === Helpers ===
def generate_santa_text(prompt: str, lang: str) -> str:
    """Генерирует добрый ответ от Санты через Gemini"""
    full_prompt = f"Ты — добрый, весёлый Санта Клаус. Ответь ребенку на языке: {lang}. Будь краток (максимум 2 предложения).\nВопрос: {prompt}"
    try:
        response = model.generate_content(full_prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "Хо-хо-хо! Счастливого Рождества!"

def generate_santa_video(text: str, lang: str) -> str:
    """Создает видео через D-ID API"""
    url = "https://api.d-id.com/talks"
    
    # Подбор голоса под выбранный язык
    voices = {
        "ru": "ru-RU-DmitryNeural",
        "en": "en-US-ChristopherNeural",
        "fr": "fr-FR-HenriNeural",
        "de": "de-DE-ConradNeural",
        "es": "es-ES-AlvaroNeural"
    }
    voice_id = voices.get(lang, "ru-RU-DmitryNeural")

    headers = {
        "Authorization": f"Basic {AUTH_TOKEN}",
        "Content-Type": "application/json",
        "accept": "application/json"
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
        # 1. Создание задачи
        res = requests.post(url, headers=headers, json=payload, timeout=10)
        if res.status_code not in [200, 201]:
            print(f"❌ D-ID Creation Error: {res.status_code} - {res.text}")
            return None
        
        talk_id = res.json().get("id")
        
        # 2. Ожидание готовности (до 30 попыток)
        for i in range(30):
            time.sleep(2)
            status_res = requests.get(f"{url}/{talk_id}", headers=headers, timeout=10)
            if status_res.status_code == 200:
                data = status_res.json()
                if data.get("status") == "done":
                    return data.get("result_url")
                if data.get("status") == "error":
                    print(f"❌ D-ID Processing Error: {data}")
                    return None
        return None
    except Exception as e:
        print(f"❌ Video Helper Error: {e}")
        return None

# === API Routes ===
@app.route("/api/santa-chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "").strip()
    lang = data.get("lang", "ru")

    if not user_message:
        return jsonify({"error": "No message"}), 400

    print(f"--- Новый запрос от пользователя: {user_message} ---")
    
    # 1. Сначала текст
    reply_text = generate_santa_text(user_message, lang)
    
    # 2. Потом видео
    video_url = generate_santa_video(reply_text, lang)

    return jsonify({
        "santaReply": reply_text,
        "videoUrl": video_url
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
