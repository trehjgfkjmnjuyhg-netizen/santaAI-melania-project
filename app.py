import os
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Настройка Gemini из переменных окружения Render
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
PHOTO_URL = os.getenv("SANTA_IMAGE_URL")

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
    model = genai.GenerativeModel('gemini-pro')

def create_santa_video(text, lang):
    url = "https://api.d-id.com/talks"
    
    # Полный токен (почта + твой ключ JgC42cg_IgxYY3mSM4Ns0)
    auth_token = "dHJlaGpnZmtqbW5qdXloZ0BnbWFpbC5jb206SmdDNDJjZ19JZ3hZWTNtU000TnMw"
    
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
        "authorization": f"Basic {auth_token}" 
    }

    try:
        print(f"--- Запрос к D-ID для языка {lang} ---")
        res = requests.post(url, json=payload, headers=headers)
        
        if res.status_code not in [200, 201]:
            print(f"D-ID API Error: {res.status_code} - {res.text}")
            return None
        
        talk_id = res.json().get("id")
        
        # Цикл ожидания видео (до 60 секунд)
        for i in range(30):
            status_res = requests.get(f"{url}/{talk_id}", headers=headers)
            data = status_res.json()
            status = data.get("status")
            print(f"Попытка {i+1}: Статус видео - {status}")
            
            if status == "done":
                return data.get("result_url")
            if status == "error":
                print(f"D-ID Generation Error: {data}")
                return None
            time.sleep(2)
            
    except Exception as e:
        print(f"Критическая ошибка функции видео: {str(e)}")
        return None
    return None

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    try:
        data = request.json
        user_msg = data.get("message", "")
        lang = data.get("lang", "ru")
        
        # 1. Генерация текста через Gemini
        prompt = f"Ты добрый Санта Клаус. Ответь ребенку на вопрос: '{user_msg}' на языке {lang}. Ответ должен быть теплым и коротким (до 20 слов)."
        response = model.generate_content(prompt)
        santa_text = response.text
        
        # 2. Попытка генерации видео
        video_url = create_santa_video(santa_text, lang)
        
        return jsonify({
            "santaReply": santa_text, 
            "videoUrl": video_url
        })
    except Exception as e:
        print(f"Ошибка в santa_chat: {str(e)}")
        # Возвращаем текст, даже если всё сломалось
        return jsonify({
            "santaReply": "Хо-хо-хо! Мои олени немного устали и застряли в сугробе. Давай пообщаемся текстом!",
            "videoUrl": None
        }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
