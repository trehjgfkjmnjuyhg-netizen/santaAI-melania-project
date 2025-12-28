const UI_TEXTS = {
    'ru': { welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', typing: 'Санта записывает видео...', error: 'Олени застряли в снегу!', good_deeds: 'Наши Добрые Дела' },
    'en': { welcome: 'Ho-ho-ho! I am Santa Claus. What is your name?', typing: 'Santa is recording...', error: 'Reindeer are stuck!', good_deeds: 'Our Good Deeds' }
};

let currentLang = localStorage.getItem('santaLang') || 'ru';

document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const typingIndicator = document.getElementById('typing-indicator');

    // Кнопки языков
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.getAttribute('data-lang');
            localStorage.setItem('santaLang', currentLang);
            location.reload();
        });
    });

    // Наполнение страницы отчетов (Добрые Дела)
    if (document.getElementById('reports-container')) {
        const reports = [
            { name: "Мелания", task: "Помогла детям собрать подарки", date: "25.12.2025" },
            { name: "Netizen", task: "Настроил видеосвязь с Сантой", date: "28.12.2025" }
        ];
        document.getElementById('reports-container').innerHTML = reports.map(r => `
            <div class="report-card" style="background:white; padding:15px; margin:10px; border-radius:12px; color:black; border-left:5px solid #d42426; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <strong>${r.name}</strong> — ${r.task} <br><small style="color:#666">${r.date}</small>
            </div>
        `).join('');
    }

    // Обработка чата
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = userInput.value.trim();
            if (!msg) return;

            appendMessage(msg, 'user');
            userInput.value = '';
            typingIndicator.style.display = 'block';
            typingIndicator.textContent = UI_TEXTS[currentLang].typing;

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
    }

    function appendMessage(content, sender, isVideo = false) {
        if (!chatBox) return;
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        if (isVideo) {
            div.innerHTML = `<video width="100%" controls autoplay style="border-radius:15px; border:2px solid #d42426;"><source src="${content}" type="video/mp4"></video>`;
        } else {
            div.innerHTML = `<p>${content}</p>`;
        }
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
