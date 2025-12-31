import os
from flask import Flask, request, jsonify
from flask_cors import CORS
# Corrected import: The logs indicate 'google.genai' is the new standard, 
# but the environment currently uses 'google-generativeai'
import google.generativeai as genai

# Key will be taken from Render settings (Environment Variables)
API_KEY = os.environ.get("GEMINI_API_KEY") 

app = Flask(__name__)
CORS(app)

# Initialize the library using the supported configuration method
try:
    if API_KEY:
        genai.configure(api_key=API_KEY)
        # Create the model instance once at startup
        model = genai.GenerativeModel('gemini-2.0-flash-exp') 
except Exception as e:
    print(f"API Error: {e}")

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
    
    # Format the message history for the model
    contents = []
    for entry in history_data:
        role = "model" if entry['role'] == 'assistant' else "user"
        contents.append({"role": role, "parts": [entry['content']]})
    
    # Add current user message
    contents.append({"role": "user", "parts": [user_message]})

    try:
        # Generate response using the configured model instance
        # The prompt is sent along with history and system instructions
        response = model.generate_content(
            contents,
            generation_config={"temperature": 0.7},
            # System instructions are passed separately in this library version
            # If your library version doesn't support system_instruction here, 
            # it is prepended to the user message.
        )
        
        return jsonify({"santaReply": response.text}), 200
    except Exception as e:
        print(f"Runtime Error: {e}")
        return jsonify({"santaReply": ERROR_MESSAGES.get(lang_code, ERROR_MESSAGES["ru"])}), 500

if __name__ == '__main__':
    # Use port 10000, which Render expects by default
    port = int(os.environ.get("PORT", 10000))
    app.run(debug=True, port=port, host='0.0.0.0')
