// Адрес вашего живого сервера на Render
const API_URL = 'https://santaal-melania-project.onrender.com/chat';
let currentLang = 'ru';

// 1. Возвращаем переключение языков
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
    console.log('Язык переключен на:', lang);
}

// 2. Оживляем кнопку письма (Wishlist)
function openWishlist() {
    alert("Санта внимательно читает твои пожелания! Напиши ему в чате прямо сейчас. 🎅🎁");
    // Если у вас есть файл wishlist.html, можно заменить на: window.location.href = 'wishlist.html';
}

// 3. Исправленная функция отправки сообщения
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
        
        // Берем ответ из поля 'reply', как прописано в вашем app.py
        if (data.reply) {
            addMessage(data.reply, 'santa');
        } else {
            addMessage('Ох, олени запутались! Попробуй еще раз 🦌', 'santa');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        addMessage('Ошибка связи с Северным полюсом... ❄️', 'santa');
    }
}

// 4. Функция отображения сообщений
function addMessage(text, sender) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Подключаем отправку через клавишу Enter
document.getElementById('user-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
