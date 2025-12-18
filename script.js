// Адрес вашего сервера на Render (маршрут /chat)
const API_URL = 'https://santaal-melania-project.onrender.com/chat';

async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    // Если поле пустое, ничего не делаем
    if (!message) return;

    // Добавляем сообщение пользователя в чат
    addMessage(message, 'user');
    input.value = '';

    try {
        // Отправляем запрос на сервер Render
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();

        // Проверяем наличие ответа от Санты
        if (data.reply) {
            addMessage(data.reply, 'santa');
        } else if (data.error) {
            console.error('Ошибка сервера:', data.error);
            addMessage('Ох, олени запутались в проводах! Попробуй еще раз чуть позже 🦌', 'santa');
        }
    } catch (error) {
        console.error('Ошибка связи:', error);
        addMessage('Ошибка связи с Северным полюсом... Проверь интернет ❄️', 'santa');
    }
}

// Функция для добавления сообщений в визуальный интерфейс
function addMessage(text, sender) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    msgDiv.innerText = text;

    chatBox.appendChild(msgDiv);
    
    // Автоматическая прокрутка чата вниз
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Позволяем отправлять сообщение нажатием кнопки Enter
document.getElementById('user-input')?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
