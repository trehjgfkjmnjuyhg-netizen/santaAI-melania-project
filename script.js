const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');

async function handleChat() {
    const msg = userInput.value.trim();
    if (!msg) return;

    appendMessage(msg, 'user');
    userInput.value = '';
    if (typingIndicator) typingIndicator.style.display = 'block';

    try {
        const res = await fetch('https://santaai-melania-project.onrender.com/api/santa-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        const data = await res.json();
        if (typingIndicator) typingIndicator.style.display = 'none';
        appendMessage(data.santaReply, 'santa');
    } catch (error) {
        if (typingIndicator) typingIndicator.style.display = 'none';
        appendMessage("Санта на связи, но метель мешает! Попробуй еще раз.", 'santa');
    }
}

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerHTML = `<p>${text}</p>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Привязываем события только если кнопки найдены
if (sendBtn) sendBtn.onclick = handleChat;
if (userInput) {
    userInput.onkeypress = (e) => { if (e.key === 'Enter') handleChat(); };
}
