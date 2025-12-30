import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Настройка Gemini из переменных окружения Render
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

        # Промпт для Санты: добрый, сказочный и на нужном языке
        prompt = (
            f"Ты — настоящий, добрый и мудрый Санта Клаус. "
            f"Ответь ребенку на вопрос: '{user_message}' на языке {lang}. "
            f"Твой ответ должен быть теплым, сказочным и вдохновляющим, "
            f"но не длиннее 3 предложений."
        )
        
        response = model.generate_content(prompt)
        santa_text = response.text.strip()

        # Возвращаем только текст
        return jsonify({
            "santaReply": santa_text,
            "videoUrl": None 
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "santaReply": "Хо-хо-хо! Мои волшебные книги немного запылились. Давай пообщаемся через минутку!", 
            "videoUrl": None
        }), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
