import os
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Инициализация переменных окружения из Render
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
PHOTO_URL = os.getenv("SANTA_IMAGE_URL")

# Ваш закодированный токен (почта + ключ JgC42cg_IgxYY3mSM4Ns0)
# Прописан напрямую для исключения ошибок кодирования в Render
AUTH_TOKEN = "dHJlaGpnZmtqbW5qdXloZ0BnbWFpbC5jb206SmdDNDJjZ19JZ3hZWTNtU000TnMw"

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
    model = genai.GenerativeModel('gemini-pro')

def create_santa_video(text, lang):
    """Генерация видео через D-ID API"""
    print(f"[INFO] Начало генерации видео. Язык: {lang}")
    url = "https://api.d-id.com/talks"
    
    voices = {
        "ru": "ru-RU-DmitryNeural", 
        "en": "en-US-ChristopherNeural",
        "fr": "fr-FR-HenriNeural",
        "de": "de-DE-ConradNeural",
        "es": "es-ES-AlvaroNeural"
    }
    voice_id = voices.get(lang, "ru-RU-DmitryNeural")
    
    payload = {
        "script": {
            "type": "text", 
            "subtitles": "false",
            "provider": {"type": "microsoft", "voice_id": voice_id}, 
            "input": text
        },
        "config": {"fluent": "true", "pad_audio": "0.0"},
        "source_url": PHOTO_URL
    }
    
    headers = {
        "accept": "application/json", 
        "content-type": "application/json",
        "authorization": f"Basic {AUTH_TOKEN}" 
    }

    try:
        # Шаг 1: Запрос на создание
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code not in [200, 201]:
            print(f"[ERROR] D-ID API Error: {response.text}")
            return None
        
        talk_id = response.json().get("id")
        
        # Шаг 2: Ожидание результата (30 попыток по 2 сек)
        for attempt in range(30):
            time.sleep(2)
            check = requests.get(f"{url}/{talk_id}", headers=headers, timeout=10)
            if check.status_code == 200:
                data = check.json()
                if data.get("status") == "done":
                    return data.get("result_url")
                if data.get("status") == "error":
                    return None
    except Exception as e:
        print(f"[CRITICAL] {str(e)}")
        return None
    return None

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    try:
        data = request.json
        user_msg = data.get("message", "")
        lang = data.get("lang", "ru")
        
        # 1. Текст от Gemini
        prompt = f"Ты добрый Санта Клаус. Ответь ребенку кратко на языке {lang}: {user_msg}"
        response = model.generate_content(prompt)
        santa_text = response.text

        # 2. Видео от D-ID
        video_url = create_santa_video(santa_text, lang)
        
        return jsonify({
            "santaReply": santa_text, 
            "videoUrl": video_url
        }), 200
    except Exception as e:
        return jsonify({
            "santaReply": "Хо-хо-хо! Мои олени немного устали. Давай пообщаемся текстом!",
            "videoUrl": None
        }), 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
