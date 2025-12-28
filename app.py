import os
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Настройка ключей из Render Environment
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
DID_KEY = os.getenv("DID_API_KEY")
PHOTO_URL = os.getenv("SANTA_IMAGE_URL")

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
    model = genai.GenerativeModel('gemini-pro')

def create_santa_video(text, lang):
    url = "https://api.d-id.com/talks"
    # ЭТО ВАЖНО: Полный закодированный токен (почта + ваш ключ)
    auth_token = "dHJlaGpnZmtqbW5qdXloZ0BnbWFpbC5jb206SmdDNDJjZ19JZ3hZWTNtU000TnMw"
    
    voices = {"ru": "ru-RU-DmitryNeural", "en": "en-US-ChristopherNeural"}
    voice_id = voices.get(lang, "ru-RU-DmitryNeural")
    
    payload = {
        "script": {
            "type": "text", 
            "subtitles": "false",
            "provider": {"type": "microsoft", "voice_id": voice_id}, 
            "input": text
        },
        "config": {"fluent": "true", "pad_audio": "0.0"},
        "source_url": os.getenv("SANTA_IMAGE_URL") # Берем ссылку из Render
    }
    
    headers = {
        "accept": "application/json", 
        "content-type": "application/json",
        "authorization": f"Basic {auth_token}" # Используем готовый токен
    }

    try:
        res = requests.post(url, json=payload, headers=headers)
        if res.status_code not in [200, 201]:
            print(f"D-ID API Error: {res.status_code} - {res.text}")
            return None
        
        talk_id = res.json().get("id")
        # Ждем готовности видео
        for _ in range(25):
            status_res = requests.get(f"{url}/{talk_id}", headers=headers)
            data = status_res.json()
            if data.get("status") == "done":
                return data.get("result_url")
            time.sleep(2)
    except Exception as e:
        print(f"Video Error: {str(e)}")
        return None
    return None
   
@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    try:
        data = request.json
        user_msg = data.get("message")
        lang = data.get("lang", "ru")
        
        # 1. Получаем текст от Gemini
        prompt = f"Ты — добрый Санта Клаус. Ответь кратко (2 предложения) на языке {lang} на вопрос: {user_msg}"
        response = model.generate_content(prompt)
        santa_text = response.text
        
        # 2. Генерируем видео (в это время пользователь ждет)
        video_url = create_santa_video(santa_text, lang)
        
        return jsonify({
            "santaReply": santa_text, 
            "videoUrl": video_url
        })
    except Exception as e:
        return jsonify({"santaReply": "Хо-хо-хо! Мои олени немного устали. Попробуй еще раз!", "videoUrl": None}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
