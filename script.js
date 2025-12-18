const API_URL = 'https://santaal-melania-project.onrender.com/chat';
let currentLang = 'ru';

// 1. Функция переключения языков
function setLanguage(lang) {
    currentLang = lang;
    const prompts = {
        'ru': 'Напишите Санте...',
        'en': 'Write to Santa...',
        'de': 'Schreib an den Weihnachtsmann...',
        'fr': 'Écrire au Père Noël...',
        'es': 'Escribir a Papá Noel...'
    };
    document.getElementById('user-input').placeholder = prompts[lang] || prompts['ru'];
    console.log('Язык изменен на:', lang);
}

// 2. Функция открытия письма/инструкции
function openWishlist() {
    alert("Санта внимательно читает твои пожелания! Напиши ему в чате прямо сейчас. 🎅🎁");
}

// 3. Функция отправки сообщения
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
            body: JSON.stringify({ 
                message: message,
                lang: currentLang 
            })
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

// 4. Добавление сообщений в чат
function addMessage(text, sender) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Позволяем отправлять через Enter
document.getElementById('user-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
