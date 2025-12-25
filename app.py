import os
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Проверка наличия ключей при старте
API_KEY = os.getenv("GEMINI_API_KEY")
DID_KEY = os.getenv("DID_API_KEY")
PHOTO_URL = os.getenv("SANTA_IMAGE_URL")

if API_KEY:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-pro')

def create_santa_video(text, lang):
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
        "authorization": f"Basic {DID_KEY}"
    }

    try:
        print(f"--- Отправка запроса в D-ID для текста: {text[:20]}... ---")
        res = requests.post(url, json=payload, headers=headers)
        print(f"--- Ответ D-ID: {res.status_code} {res.text} ---")
        
        talk_id = res.json().get("id")
        if not talk_id: return None
        
        for _ in range(30):
            status_res = requests.get(f"{url}/{talk_id}", headers=headers)
            data = status_res.json()
            if data.get("status") == "done":
                return data.get("result_url")
            if data.get("status") == "error":
                print(f"--- Ошибка генерации видео: {data} ---")
                return None
            time.sleep(2)
    except Exception as e:
        print(f"--- Ошибка в функции видео: {str(e)} ---")
        return None
    return None

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    try:
        data = request.json
        user_msg = data.get("message")
        lang = data.get("lang", "ru")
        
        print(f"--- Новый запрос: {user_msg} (lang: {lang}) ---")

        # 1. Текст от Gemini
        response = model.generate_content(f"Ты — Санта. Кратко ответь ребенку: {user_msg}")
        santa_text = response.text
        print(f"--- Ответ Gemini: {santa_text} ---")
        
        # 2. Видео от D-ID
        video_url = create_santa_video(santa_text, lang)
        
        return jsonify({
            "santaReply": santa_text, 
            "videoUrl": video_url
        })
    except Exception as e:
        print(f"--- КРИТИЧЕСКАЯ ОШИБКА СЕРВЕРА: {str(e)} ---")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
