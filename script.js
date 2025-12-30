const UI_TEXTS = {
    'ru': { welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', typing: 'Санта думает...', error: 'Олени застряли в снегу!', good_deeds: 'Наши Добрые Дела' },
    'en': { welcome: 'Ho-ho-ho! I am Santa Claus. What is your name?', typing: 'Santa is thinking...', error: 'Reindeer are stuck!', good_deeds: 'Our Good Deeds' },
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

    // Кнопки языков
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.getAttribute('data-lang');
            localStorage.setItem('santaLang', currentLang);
            location.reload(); 
        });
    });

    // Наши Добрые Дела
    if (document.getElementById('reports-container')) {
        const reports = [
            { name: "Мелания", task: "Настроила Санте чат на нейросетях", date: "30.12.2025" },
            { name: "Помощник", task: "Украсил елку", date: "29.12.2025" }
        ];
        document.getElementById('reports-container').innerHTML = reports.map(r => `
            <div style="background:white; padding:15px; margin:10px; border-radius:12px; color:black; border-left:5px solid red;">
                <strong>${r.name}</strong>: ${r.task} <br><small>${r.date}</small>
            </div>
        `).join('');
    }

    // Логика чата
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
