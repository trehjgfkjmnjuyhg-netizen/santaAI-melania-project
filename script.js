const UI_TEXTS = {
    'ru': { welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', typing: 'Санта записывает видео...', error: 'Олени застряли в снегу!' },
    'en': { welcome: 'Ho-ho-ho! I am Santa Claus.', typing: 'Santa is recording...', error: 'Error!' },
    'fr': { welcome: 'Je suis le Père Noël.', typing: 'Écrit...', error: 'Erreur!' },
    'de': { welcome: 'Ich bin der Weihnachtsmann.', typing: 'Schreibt...', error: 'Fehler!' },
    'es': { welcome: 'Soy Papá Noel.', typing: 'Escribiendo...', error: 'Error!' }
};

let currentLang = localStorage.getItem('santaLang') || 'ru';

document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const typingIndicator = document.getElementById('typing-indicator');

    // 1. Кнопки языков
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.getAttribute('data-lang');
            localStorage.setItem('santaLang', currentLang);
            location.reload(); 
        });
    });

    // 2. Наши Добрые Дела (Карточки)
    if (document.getElementById('reports-container')) {
        const reports = [
            { name: "Мелания", task: "Помогла детям собрать игрушки", date: "25.12.2025" },
            { name: "Netizen", task: "Настроил видео для Санты", date: "28.12.2025" }
        ];
        document.getElementById('reports-container').innerHTML = reports.map(r => `
            <div style="background:white; padding:15px; margin:10px; border-radius:12px; color:black; border-left: 5px solid red; text-align:left;">
                <strong style="color:red;">${r.name}</strong>: ${r.task} <br><small>${r.date}</small>
            </div>
        `).join('');
    }

    // 3. Чат
    chatForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = userInput.value.trim();
        if (!msg) return;

        appendMessage(msg, 'user');
        userInput.value = '';
        typingIndicator.style.display = 'block';

        try {
            const response = await fetch('https://santaai-melania-project.onrender.com/api/santa-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, lang: currentLang })
            });
            const data = await response.json();
            typingIndicator.style.display = 'none';

            if (data.videoUrl) appendMessage(data.videoUrl, 'santa', true);
            appendMessage(data.santaReply, 'santa');
        } catch (err) {
            typingIndicator.style.display = 'none';
            appendMessage(UI_TEXTS[currentLang].error, 'santa');
        }
    });

    function appendMessage(content, sender, isVideo = false) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        if (isVideo) {
            div.innerHTML = `<video width="100%" controls autoplay style="border-radius:15px; border:2px solid red;"><source src="${content}" type="video/mp4"></video>`;
        } else {
            div.innerHTML = `<p>${content}</p>`;
        }
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
