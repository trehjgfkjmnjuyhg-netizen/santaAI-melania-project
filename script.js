const API_URL = 'https://santaal-melania-project.onrender.com/chat';

async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        if (data.reply) {
            addMessage(data.reply, 'santa');
        } else {
            addMessage('Ох, олени запутались! Попробуй еще раз 🦌', 'santa');
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('Ошибка связи с Северным полюсом... ❄️', 'santa');
    }
}

function addMessage(text, sender) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
