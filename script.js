const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

async function handleChat() {
    const msg = userInput.value.trim();
    if (!msg) return;

    appendMessage(msg, 'user');
    userInput.value = '';

    try {
        const res = await fetch('https://santaai-melania-project.onrender.com/api/santa-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        const data = await res.json();
        appendMessage(data.santaReply, 'santa');
    } catch (error) {
        appendMessage("Санта не слышит, метель сильная! Попробуй еще раз.", 'santa');
    }
}

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerHTML = `<p>${text}</p>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

if (sendBtn) sendBtn.onclick = handleChat;
if (userInput) {
    userInput.onkeypress = (e) => { if (e.key === 'Enter') handleChat(); };
}
