// Адрес вашего живого сервера на Render
const API_URL = 'https://santaal-melania-project.onrender.com/chat';
let currentLang = 'ru';

// 1. Функция переключения языков
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

// 2. Функция для кнопки "Хочу стать Сантой" или иконки письма
function openWishlist() {
    alert("Санта внимательно читает твои пожелания! Напиши ему в чате прямо сейчас. 🎅🎁");
}

// 3. Основная функция отправки сообщения
async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Добавляем сообщение пользователя в интерфейс
    addMessage(message, 'user');
    input.value = '';

    try {
        // Отправка запроса на ваш сервер Render
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: message,
                lang: currentLang 
            })
        });

        const data = await response.json();

        // Проверка ответа от Санты
        if (data.reply) {
            addMessage(data.reply, 'santa');
        } else {
            addMessage('Ох, олени запутались! Попробуй еще раз чуть позже 🦌', 'santa');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        addMessage('Ошибка связи с Северным полюсом... Проверь интернет ❄️', 'santa');
    }
}

// 4. Функция для отображения сообщений в чате
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

// 5. Позволяем отправлять сообщение по нажатию клавиши Enter
document.getElementById('user-input')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
