// Адрес вашего сервера на Render
const API_URL = 'https://santaal-melania-project.onrender.com/chat';
let currentLang = 'ru';

// 1. Функция переключения языков (теперь флаги оживут!)
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
    if (input) {
        input.placeholder = placeholders[lang] || placeholders['ru'];
    }
    console.log('Язык переключен на:', lang);
}

// 2. Функция открытия письма
function openWishlist() {
    alert("Санта внимательно читает твои пожелания! Напиши ему в чате прямо сейчас. 🎅🎁");
}

// 3. Функция отправки сообщения
async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;

    // Показываем сообщение пользователя
    addMessage(message, 'user');
    input.value = '';

    try {
        // Отправляем запрос на ваш живой сервер
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: message,
                lang: currentLang 
            })
        });

        const data = await response.json();
        
        // Обрабатываем ответ от ИИ Санты
        if (data.reply) {
            addMessage(data.reply, 'santa');
        } else {
            addMessage('Ох, олени запутались! Попробуй еще раз чуть позже 🦌', 'santa');
        }
    } catch (error) {
        console.error('Ошибка связи:', error);
        addMessage('Ошибка связи с Северным полюсом... Проверь интернет ❄️', 'santa');
    }
}

// 4. Функция добавления сообщений в окно чата
function addMessage(text, sender) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    msgDiv.innerText = text;

    chatBox.appendChild(msgDiv);
    
    // Автоматическая прокрутка вниз
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 5. Отправка сообщения по нажатию Enter
document.getElementById('user-input')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
