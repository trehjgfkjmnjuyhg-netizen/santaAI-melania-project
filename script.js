/** * santaAI - Melania Project
 * Полный скрипт управления интерфейсом и связью с сервером
 */

const UI_TEXTS = {
    'ru': { welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', typing: 'Санта записывает видео...', error: 'Олени застряли в снегу!', good_deeds: 'Наши Добрые Дела' },
    'en': { welcome: 'Ho-ho-ho! I am Santa Claus. What is your name?', typing: 'Santa is recording...', error: 'The reindeer are stuck!', good_deeds: 'Our Good Deeds' },
    'fr': { welcome: 'Je suis le Père Noël. Quel est ton nom?', typing: 'Le Père Noël écrit...', error: 'Erreur!', good_deeds: 'Nos bonnes actions' },
    'de': { welcome: 'Ich bin der Weihnachtsmann. Как тебя зовут?', typing: 'Schreibt...', error: 'Fehler!', good_deeds: 'Gute Taten' },
    'es': { welcome: 'Soy Papá Noel. ¿Cómo te llamas?', typing: 'Escribiendo...', error: 'Error!', good_deeds: 'Buenas acciones' }
};

// Определяем текущий язык (берем из памяти или ставим 'ru')
let currentLang = localStorage.getItem('santaLang') || 'ru';

document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const typingIndicator = document.getElementById('typing-indicator');

    // --- 1. ПЕРЕКЛЮЧЕНИЕ ЯЗЫКОВ ---
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            if (selectedLang !== currentLang) {
                localStorage.setItem('santaLang', selectedLang);
                // Очищаем историю при смене языка, чтобы Санта поздоровался заново
                localStorage.removeItem('santaChatHistory_' + selectedLang);
                location.reload(); 
            }
        });
    });

    // --- 2. ДОБРЫЕ ДЕЛА (ОТЧЕТЫ) ---
    if (document.getElementById('reports-container')) {
        const container = document.getElementById('reports-container');
        const reports = [
            { name: "Мелания", task: "Помогла детям собрать игрушки и украсить елку", date: "25.12.2025" },
            { name: "Netizen", task: "Настроил систему видеосвязи с Северным Полюсом", date: "28.12.2025" },
            { name: "Помощник Санты", task: "Проверил список всех добрых детей", date: "29.12.2025" }
        ];

        container.innerHTML = reports.map(r => `
            <div class="report-card" style="background:rgba(255,255,255,0.95); padding:15px; margin:15px auto; border-radius:15px; color:#333; max-width:90%; box-shadow:0 5px 15px rgba(0,0,0,0.1); border-left: 5px solid #d42426;">
                <strong style="color:#d42426; font-size:1.1em; display:block; margin-bottom:5px;">${r.name}</strong>
                <p style="margin: 0; line-height:1.4;">${r.task}</p>
                <small style="color:#777; display:block; margin-top:10px; font-style:italic;">Отправлено: ${r.date}</small>
            </div>
        `).join('');
    }

    // --- 3. РАБОТА С ЧАТОМ ---
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageText = userInput.value.trim();
            if (!messageText) return;

            // Добавляем сообщение пользователя на экран
            appendMessage(messageText, 'user');
            userInput.value = '';
            
            // Показываем индикатор ожидания
            if (typingIndicator) {
                typingIndicator.style.display = 'block';
                typingIndicator.textContent = UI_TEXTS[currentLang].typing;
            }

            try {
                // ОТПРАВКА ЗАПРОСА НА ТВОЙ СЕРВЕР RENDER
                const response = await fetch('https://santaai-melania-project.onrender.com/api/santa-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: messageText, lang: currentLang })
                });

                if (!response.ok) throw new Error('Ошибка сервера');

                const data = await response.json();
                
                if (typingIndicator) typingIndicator.style.display = 'none';
                
                // 1. Если сервер прислал видео - вставляем плеер
                if (data.videoUrl) {
                    appendMessage(data.videoUrl, 'santa', true);
                }
                
                // 2. Всегда добавляем текстовый ответ
                if (data.santaReply) {
                    appendMessage(data.santaReply, 'santa');
                }

            } catch (err) {
                console.error("Ошибка чата:", err);
                if (typingIndicator) typingIndicator.style.display = 'none';
                appendMessage(UI_TEXTS[currentLang].error, 'santa');
            }
        });
        
        // ЗАГРУЗКА ИСТОРИИ ИЛИ ПРИВЕТСТВИЕ
        const savedHistory = localStorage.getItem('santaChatHistory_' + currentLang);
        if (chatBox && !savedHistory) {
            setTimeout(() => appendMessage(UI_TEXTS[currentLang].welcome, 'santa'), 1000);
        } else if (chatBox) {
            chatBox.innerHTML = savedHistory;
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    // ФУНКЦИЯ ДОБАВЛЕНИЯ СООБЩЕНИЯ
    function appendMessage(content, sender, isVideo = false) {
        if (!chatBox) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        if (isVideo) {
            // Красивая обертка для видеоплеера
            messageDiv.innerHTML = `
                <div style="margin:10px 0; background:#000; border-radius:15px; overflow:hidden; border:2px solid #d42426; box-shadow:0 0 15px rgba(212,36,38,0.3);">
                    <video width="100%" controls autoplay playsinline style="display:block;">
                        <source src="${content}" type="video/mp4">
                        Ваш браузер не поддерживает видео.
                    </video>
                </div>`;
        } else {
            messageDiv.innerHTML = `<p style="margin:0; padding:5px;">${content}</p>`;
        }
        
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // Сохраняем только текст, чтобы видео не грузилось по кругу при перезагрузке
        if (!isVideo) {
            localStorage.setItem('santaChatHistory_' + currentLang, chatBox.innerHTML);
        }
    }
});
