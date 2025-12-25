const UI_TEXTS = {
    'ru': { welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', typing: 'Санта записывает видео...', error_santa: 'Олени запутались, попробуй через 30 сек!' },
    'en': { welcome: 'Ho-ho-ho! I am Santa Claus. What is your name?', typing: 'Santa is recording...', error_santa: 'Try again in 30 seconds!' }
};

let currentLang = localStorage.getItem('santaLang') || 'ru';
let chatBox, typingIndicator, userInput, chatForm;

document.addEventListener('DOMContentLoaded', () => {
    chatBox = document.getElementById('chat-box');
    typingIndicator = document.getElementById('typing-indicator');
    userInput = document.getElementById('user-input');
    chatForm = document.getElementById('chat-form');

    if (chatForm) chatForm.addEventListener('submit', handleChat);
    loadHistory();
});

function appendMessage(content, sender, isVideo = false) {
    if (!chatBox) return;
    const div = document.createElement('div');
    div.classList.add('message', sender);

    if (isVideo) {
        div.innerHTML = `<div style="margin: 10px 0;"><video width="100%" controls autoplay style="border-radius: 15px; border: 3px solid #d42426;"><source src="${content}" type="video/mp4"></video></div>`;
    } else {
        div.innerHTML = `<p>${content.replace(/\n/g, '<br>')}</p>`;
    }

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    if (!isVideo) localStorage.setItem('santaChatHistory_' + currentLang, chatBox.innerHTML);
}

function loadHistory() {
    if (!chatBox) return;
    const history = localStorage.getItem('santaChatHistory_' + currentLang);
    if (history) {
        chatBox.innerHTML = history;
    } else {
        const welcomeVideos = {
            'ru': "https://v.d-id.com/p/voc_7n1j7z0z/talk_7n1j7z0z/video.mp4", // Пример ссылки
            'en': "https://v.d-id.com/p/voc_7n1j7z0z/talk_7n1j7z0z/video.mp4"
        };
        appendMessage(welcomeVideos[currentLang] || welcomeVideos['en'], 'santa', true);
        setTimeout(() => appendMessage(UI_TEXTS[currentLang].welcome, 'santa'), 1500);
    }
}

async function handleChat(e) {
    e.preventDefault();
    const msg = userInput.value.trim();
    if (!msg) return;

    appendMessage(msg, 'user');
    userInput.value = '';
    if (typingIndicator) typingIndicator.style.display = 'block';

    try {
        const response = await fetch('https://santaai-melania-project.onrender.com/api/santa-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg, lang: currentLang })
        });
        const data = await response.json();
        if (typingIndicator) typingIndicator.style.display = 'none';
        
        if (data.videoUrl) appendMessage(data.videoUrl, 'santa', true);
        if (data.santaReply) appendMessage(data.santaReply, 'santa');
    } catch (err) {
        if (typingIndicator) typingIndicator.style.display = 'none';
        appendMessage(UI_TEXTS[currentLang].error_santa, 'santa');
    }
}
