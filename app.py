import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Настройка Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-pro")

@app.route("/api/santa-chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "").strip()
        lang = data.get("lang", "ru")

        if not user_message:
            return jsonify({"error": "Empty message"}), 400

        # Промпт для Санты
        prompt = f"Ты — добрый Санта Клаус. Ответь ребенку на языке {lang}: {user_message}. Твой ответ должен быть коротким и праздничным."
        
        response = model.generate_content(prompt)
        santa_text = response.text.strip()

        return jsonify({
            "santaReply": santa_text,
            "videoUrl": None  # Видео отключено
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"santaReply": "Хо-хо-хо! С Рождеством! Давай пообщаемся чуть позже.", "videoUrl": None}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
