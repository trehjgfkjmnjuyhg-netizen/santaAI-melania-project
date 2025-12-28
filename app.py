import os
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Ключи из твоего Render Environment
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
SANTA_PHOTO = os.getenv("SANTA_IMAGE_URL")

# Твой личный закодированный токен (Email + Ключ JgC42cg_IgxYY3mSM4Ns0)
# Прописан напрямую, чтобы исключить любые ошибки кодирования
D_ID_AUTH = "dHJlaGpnZmtqbW5qdXloZ0BnbWFpbC5jb206SmdDNDJjZ19JZ3hZWTNtU000TnMw"

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
    model = genai.GenerativeModel('gemini-pro')

def create_video(text, lang):
    print(f"[LOG] Попытка создать видео. Язык: {lang}")
    url = "https://api.d-id.com/talks"
    
    voices = {
        "ru": "ru-RU-DmitryNeural", "en": "en-US-ChristopherNeural",
        "de": "de-DE-ConradNeural", "fr": "fr-FR-HenriNeural", "es": "es-ES-AlvaroNeural"
    }
    voice_id = voices.get(lang, "ru-RU-DmitryNeural")

    headers = {
        "Authorization": f"Basic {D_ID_AUTH}",
        "Content-Type": "application/json"
    }
    
    body = {
        "source_url": SANTA_PHOTO,
        "script": {
            "type": "text",
            "input": text,
            "provider": {"type": "microsoft", "voice_id": voice_id}
        },
        "config": {"fluent": "true", "pad_audio": "0.0"}
    }

    try:
        # Шаг 1: Отправка задачи
        res = requests.post(url, json=body, headers=headers, timeout=15)
        if res.status_code not in [200, 201]:
            print(f"[D-ID ERROR] Статус: {res.status_code}, Ответ: {res.text}")
            return None
        
        talk_id = res.json().get("id")
        print(f"[LOG] Задача принята D-ID. ID: {talk_id}")

        # Шаг 2: Ожидание (до 30 сек)
        for i in range(15):
            time.sleep(2)
            check = requests.get(f"{url}/{talk_id}", headers=headers)
            data = check.json()
            status = data.get("status")
            print(f"[LOG] Статус видео (попытка {i+1}): {status}")
            
            if status == "done":
                return data.get("result_url")
            if status == "error":
                print(f"[D-ID ERROR] Сбой генерации: {data}")
                return None
    except Exception as e:
        print(f"[CRITICAL ERROR] {str(e)}")
        return None
    return None

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    try:
        data = request.json
        msg = data.get("message", "")
        lang = data.get("lang", "ru")

        # 1. Текст от Gemini
        response = model.generate_content(f"Ты Санта Клаус. Кратко и весело ответь на {lang}: {msg}")
        text = response.text
        print(f"[LOG] Текст от Gemini: {text}")

        # 2. Видео от D-ID
        video_url = create_video(text, lang)

        return jsonify({"santaReply": text, "videoUrl": video_url})
    except Exception as e:
        print(f"[SERVER ERROR] {str(e)}")
        return jsonify({"santaReply": "Хо-хо-хо! Попробуй еще раз!", "videoUrl": None}), 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
