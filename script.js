const UI_TEXTS = {
    'ru': { welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', typing: 'Санта записывает видео...', error: 'Олени застряли в снегу!', good_deeds: 'Наши Добрые Дела' },
    'en': { welcome: 'Ho-ho-ho! I am Santa Claus. What is your name?', typing: 'Santa is recording...', error: 'The reindeer are stuck!', good_deeds: 'Our Good Deeds' },
    'fr': { welcome: 'Je suis le Père Noël. Quel est ton nom?', typing: 'Le Père Noël écrit...', error: 'Erreur!', good_deeds: 'Nos bonnes actions' },
    'de': { welcome: 'Ich bin der Weihnachtsmann. Как тебя зовут?', typing: 'Schreibt...', error: 'Fehler!', good_deeds: 'Gute Taten' },
    'es': { welcome: 'Soy Papá Noel. ¿Cómo te llamas?', typing: 'Escribiendo...', error: 'Error!', good_deeds: 'Buenas acciones' }
};

let currentLang = localStorage.getItem('santaLang') || 'ru';

document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const typingIndicator = document.getElementById('typing-indicator');

    // 1. Логика переключения языков
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.getAttribute('data-lang');
            localStorage.setItem('santaLang', currentLang);
            location.reload(); 
        });
    });

    // 2. Отображение отчетов (Добрые Дела) — исправляет пустой блок
    if (document.getElementById('reports-container')) {
        displayReports();
    }

    // 3. Работа с чатом
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = userInput.value.trim();
            if (!msg) return;

            appendMessage(msg, 'user');
            userInput.value = '';
            
            if (typingIndicator) {
                typingIndicator.style.display = 'block';
                typingIndicator.textContent = UI_TEXTS[currentLang].typing;
            }

            try {
                const response = await fetch('https://santaai-melania-project.onrender.com/api/santa-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: msg, lang: currentLang })
                });
                const data = await response.json();
                
                if (typingIndicator) typingIndicator.style.display = 'none';
                
                // Сначала добавляем видео (если оно пришло)
                if (data.videoUrl) {
                    appendMessage(data.videoUrl, 'santa', true);
                }
                
                // Затем добавляем текст
                if (data.santaReply) {
                    appendMessage(data.santaReply, 'santa');
                }
            } catch (err) {
                if (typingIndicator) typingIndicator.style.display = 'none';
                appendMessage(UI_TEXTS[currentLang].error, 'santa');
            }
        });
        
        // Приветствие при первом входе
        if (chatBox && !localStorage.getItem('santaChatHistory_' + currentLang)) {
            setTimeout(() => appendMessage(UI_TEXTS[currentLang].welcome, 'santa'), 1000);
        } else if (chatBox) {
            chatBox.innerHTML = localStorage.getItem('santaChatHistory_' + currentLang);
        }
    }

    function appendMessage(content, sender, isVideo = false) {
        if (!chatBox) return;
        const div = document.createElement('div');
        div.classList.add('message', sender);
        
        if (isVideo) {
            div.innerHTML = `<div style="margin:10px 0;"><video width="100%" controls autoplay style="border-radius:15px; border:3px solid #d42426;"><source src="${content}" type="video/mp4"></video></div>`;
        } else {
            div.innerHTML = `<p>${content}</p>`;
        }
        
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
        if (!isVideo) localStorage.setItem('santaChatHistory_' + currentLang, chatBox.innerHTML);
    }
});

// Функция для вывода карточек (на странице Добрых Дел)
function displayReports() {
    const container = document.getElementById('reports-container');
    if (!container) return;

    const reports = [
        { name: "Мелания", task: "Помогла детям собрать игрушки", date: "25.12.2025" },
        { name: "Netizen", task: "Настроил видео для Санты", date: "28.12.2025" }
    ];

    container.innerHTML = reports.map(r => `
        <div class="report-card" style="background:white; padding:15px; margin:10px; border-radius:10px; color:black; text-align:left; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
            <strong style="color:#d42426;">${r.name}</strong> - ${r.task} <br>
            <small style="color:#666;">${r.date}</small>
        </div>
    `).join('');
}
