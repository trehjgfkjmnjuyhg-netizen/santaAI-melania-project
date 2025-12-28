const UI_TEXTS = {
    'ru': { typing: 'Санта записывает видео...', error: 'Олени застряли в снегу!' },
    'en': { typing: 'Santa is recording...', error: 'Reindeer are stuck!' }
};

let currentLang = localStorage.getItem('santaLang') || 'ru';

document.addEventListener('DOMContentLoaded', () => {
    // Наполнение страницы "Добрые дела"
    const reportsContainer = document.getElementById('reports-container');
    if (reportsContainer) {
        const reports = [
            { name: "Мелания", task: "Настроила Санте искусственный интеллект", date: "28.12.2025" },
            { name: "Netizen", task: "Помог с отладкой видеосвязи", date: "29.12.2025" }
        ];
        reportsContainer.innerHTML = reports.map(r => `
            <div style="background:white; padding:15px; margin:10px; border-radius:12px; color:black; border-left:5px solid red;">
                <strong>${r.name}</strong>: ${r.task} <br><small>${r.date}</small>
            </div>
        `).join('');
    }

    // Логика чата
    const chatForm = document.getElementById('chat-form');
    chatForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('user-input');
        const msg = input.value.trim();
        if (!msg) return;

        appendMessage(msg, 'user');
        input.value = '';
        document.getElementById('typing-indicator').style.display = 'block';

        try {
            const res = await fetch('https://santaai-melania-project.onrender.com/api/santa-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, lang: currentLang })
            });
            const data = await res.json();
            document.getElementById('typing-indicator').style.display = 'none';

            if (data.videoUrl) appendMessage(data.videoUrl, 'santa', true);
            appendMessage(data.santaReply, 'santa');
        } catch (err) {
            document.getElementById('typing-indicator').style.display = 'none';
            appendMessage("Олени застряли в снегу!", 'santa');
        }
    });

    function appendMessage(content, sender, isVideo = false) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        if (isVideo) {
            div.innerHTML = `<video width="100%" controls autoplay style="border-radius:10px;"><source src="${content}" type="video/mp4"></video>`;
        } else {
            div.innerHTML = `<p>${content}</p>`;
        }
        document.getElementById('chat-box').appendChild(div);
        document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;
    }
});
