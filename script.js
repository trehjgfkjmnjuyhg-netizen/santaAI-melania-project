const API_URL = 'https://santaal-melania-project.onrender.com/chat';
let currentLang = 'ru';

// Функция переключения языков
function setLanguage(lang) {
    currentLang = lang;
    const placeholders = {
        'ru': 'Напишите Санте...',
        'en': 'Write to Santa...',
        'de': 'Schreib an den Weihnachtsmann...',
        'fr': 'Écrire au Père Noël...',
        'es': 'Escribir a Papá Noel...'
    };
    const input = document.getElementById('user-input');
    if (input) input.placeholder = placeholders[lang] || placeholders['ru'];
}

// Открытие уведомления
function openWishlist() {
    alert("Санта внимательно читает твои пожелания! Напиши ему в чате прямо сейчас. 🎅🎁");
}

// Отправка сообщения
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
        addMessage(data.reply || 'Ох, олени заплутали!', 'santa');
    } catch (error) {
        addMessage('Ошибка связи с Полюсом... ❄️', 'santa');
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

// Слушатель для кнопки Enter
document.getElementById('user-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
