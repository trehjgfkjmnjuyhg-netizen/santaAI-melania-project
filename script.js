const UI_TEXTS = {
    'ru': { welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', typing: 'Санта думает...', error: 'Олени застряли в снегу!' },
    'en': { welcome: 'Ho-ho-ho! I am Santa Claus.', typing: 'Santa is thinking...', error: 'Reindeer are stuck!' },
    'fr': { welcome: 'Je suis le Père Noël.', typing: 'Le Père Noël écrit...', error: 'Erreur!' },
    'de': { welcome: 'Ich bin der Weihnachtsmann.', typing: 'Schreibt...', error: 'Fehler!' },
    'es': { welcome: 'Soy Papá Noel.', typing: 'Escribiendo...', error: 'Error!' }
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

    // Наполнение страницы "Добрые дела"
    const reportsContainer = document.getElementById('reports-container');
    if (reportsContainer) {
        const reports = [
            { name: "Мелания", task: "Настроила Санте чат на нейросетях", date: "30.12.2025" },
            { name: "Помощник", task: "Украсил елку", date: "29.12.2025" }
        ];
        reportsContainer.innerHTML = reports.map(r => `
            <div style="background:white; padding:15px; margin:10px; border-radius:12px; color:black; border-left:5px solid red;">
                <strong>${r.name}</strong>: ${r.task} <br><small>${r.date}</small>
            </div>
        `).join('');
    }

    // Логика отправки сообщения
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

            appendMessage(data.santaReply, 'santa');
        } catch (err) {
            typingIndicator.style.display = 'none';
            appendMessage(UI_TEXTS[currentLang].error, 'santa');
        }
    });

    function appendMessage(content, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.innerHTML = `<p>${content}</p>`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
