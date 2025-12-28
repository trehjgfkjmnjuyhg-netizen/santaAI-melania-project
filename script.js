const UI_TEXTS = {
    'ru': { welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', typing: 'Санта записывает видео...', error: 'Олени застряли в снегу!', good_deeds: 'Наши Добрые Дела' },
    'en': { welcome: 'Ho-ho-ho! I am Santa Claus. What is your name?', typing: 'Santa is recording...', error: 'The reindeer are stuck!', good_deeds: 'Our Good Deeds' },
    'fr': { welcome: 'Je suis le Père Noël. Quel est ton nom?', typing: 'Écrit...', error: 'Erreur!', good_deeds: 'Nos bonnes actions' },
    'de': { welcome: 'Ich bin der Weihnachtsmann. Как тебя зовут?', typing: 'Schreibt...', error: 'Fehler!', good_deeds: 'Gute Taten' },
    'es': { welcome: 'Soy Papá Noel. ¿Cómo te llamas?', typing: 'Escribiendo...', error: '¡Error!', good_deeds: 'Buenas acciones' }
};

let currentLang = localStorage.getItem('santaLang') || 'ru';

document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const typingIndicator = document.getElementById('typing-indicator');

    // Кнопки переключения языков
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.getAttribute('data-lang');
            localStorage.setItem('santaLang', currentLang);
            location.reload(); // Перезагрузка для применения языка
        });
    });

    // Обработка формы чата
    document.getElementById('chat-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('user-input');
        const msg = input.value.trim();
        if (!msg) return;

        appendMessage(msg, 'user');
        input.value = '';
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
            div.innerHTML = `<video width="100%" controls autoplay style="border-radius:15px;"><source src="${content}" type="video/mp4"></video>`;
        } else {
            div.innerHTML = `<p>${content}</p>`;
        }
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
