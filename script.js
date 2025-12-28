document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');

    // Наполнение "Добрых дел"
    const reportsContainer = document.getElementById('reports-container');
    if (reportsContainer) {
        reportsContainer.innerHTML = `
            <div style="background:white; padding:10px; margin:5px; border-radius:10px; color:black;">
                <strong>Мелания</strong>: Настроила Санте нейросети!
            </div>
        `;
    }

    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = userInput.value.trim();
            if (!msg) return;

            appendMessage(msg, 'user');
            userInput.value = '';

            try {
                const response = await fetch('https://santaai-melania-project.onrender.com/api/santa-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: msg })
                });
                const data = await response.json();

                if (data.videoUrl) appendMessage(data.videoUrl, 'santa', true);
                appendMessage(data.santaReply, 'santa');
            } catch (err) {
                appendMessage("Олени застряли в снегу!", 'santa');
            }
        });
    }

    function appendMessage(content, sender, isVideo = false) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        if (isVideo) {
            div.innerHTML = `<video width="100%" controls autoplay style="border-radius:10px;"><source src="${content}" type="video/mp4"></video>`;
        } else {
            div.innerHTML = `<p>${content}</p>`;
        }
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
