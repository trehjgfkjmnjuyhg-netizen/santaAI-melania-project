import os
from flask import Flask, request, jsonify
from flask_cors import CORS
# Исправленный импорт согласно требованиям новой библиотеки
import google.generativeai as genai

# Ключ будет браться из настроек Render (Environment Variables)
API_KEY = os.environ.get("GEMINI_API_KEY") 

app = Flask(__name__)
CORS(app)

# Инициализация модели через правильный метод настройки
try:
    if API_KEY:
        genai.configure(api_key=API_KEY)
        # Создаем модель один раз при запуске
        model = genai.GenerativeModel('gemini-pro') 
except Exception as e:
    print(f"Ошибка API: {e}")

ERROR_MESSAGES = {
    "ru": "Санта кормит своих оленей, напиши ему через 30 секунд и он обязательно ответит!",
    "en": "Santa is feeding his reindeer, write to him in 30 seconds and he will definitely answer!",
    "de": "Der Weihnachtsmann füttert seine Rentiere, schreib ему in 30 Sekunden и er wird bestimmt antworten!",
    "fr": "Le Père Noël nourrit ses rennes, écrivez-lui dans 30 secondes et il répondra certainement !",
    "es": "¡Papá Noel está alimentando a sus renos, escríbele в 30 segundos y te responderá sin duda!"
}

@app.route('/api/santa-chat', methods=['POST'])
def santa_chat():
    data = request.get_json()
    user_message = data.get('message', '')
    system_prompt = data.get('systemPrompt', 'Я — Санта Клаус.')
    history_data = data.get('history', [])

    lang_code = "ru"
    if "Santa" in system_prompt: lang_code = "en"
    
    # Формируем историю сообщений для модели
    contents = []
    for entry in history_data:
        role = "model" if entry['role'] == 'assistant' else "user"
        contents.append({"role": role, "parts": [entry['content']]})
    
    contents.append({"role": "user", "parts": [user_message]})

    try:
        # Используем метод generate_content с системной инструкцией
        # В версии google-generativeai промпт объединяется с инструкцией
        full_prompt = f"{system_prompt}\n\nПользователь: {user_message}"
        
        response = model.generate_content(
            full_prompt,
            generation_config={"temperature": 0.7}
        )
        
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        print(f"Runtime Error: {e}")
        return jsonify({"santaReply": ERROR_MESSAGES.get(lang_code, ERROR_MESSAGES["ru"])}), 500

if __name__ == '__main__':
    # Используем порт 10000, который ожидает Render по умолчанию
    port = int(os.environ.get("PORT", 10000))
    app.run(debug=True, port=port, host='0.0.0.0')
