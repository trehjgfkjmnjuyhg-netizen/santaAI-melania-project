const UI_TEXTS = {
    'ru': { welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', typing: 'Санта записывает видео...', error_santa: 'Олени запутались, попробуй через 30 сек!' },
    'en': { welcome: 'Ho-ho-ho! I am Santa Claus. What is your name?', typing: 'Santa is recording...', error_santa: 'Try again in 30 seconds!' },
    'de': { welcome: 'Ich bin der Weihnachtsmann. Wie heißen Sie?', typing: 'Schreibt...', error_santa: 'Versuchen Sie es später!' },
    'fr': { welcome: 'Je suis le Père Noël. Quel est ton nom?', typing: 'Écrit...', error_santa: 'Réessayez plus tard !' },
    'es': { welcome: 'Soy Papá Noel. ¿Cómo te llamas?', typing: 'Escribiendo...', error_santa: '¡Inténtalo de nuevo!' }
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

function saveHistory() {
    if (chatBox) localStorage.setItem('santaChatHistory_' + currentLang, chatBox.innerHTML);
}

function loadHistory() {
    if (!chatBox) return;
    const history = localStorage.getItem('santaChatHistory_' + currentLang);
    
    if (history && history.trim().length > 10) {
        chatBox.innerHTML = history;
    } else {
        chatBox.innerHTML = '';
        const welcomeVideos = {
            'ru': "http://googleusercontent.com/generated_video_content/2879041984064999763",
            'en': "http://googleusercontent.com/generated_video_content/10944891794765588936",
            'fr': "http://googleusercontent.com/generated_video_content/3477560230210803062",
            'de': "http://googleusercontent.com/generated_video_content/10944891794765588936",
            'es': "http://googleusercontent.com/generated_video_content/10944891794765588936"
        };
        appendMessage(welcomeVideos[currentLang] || welcomeVideos['en'], 'santa', true);
        setTimeout(() => appendMessage(UI_TEXTS[currentLang].welcome, 'santa'), 1500);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(content, sender, isVideo = false) {
    if (!chatBox) return;
    const div = document.createElement('div');
    div.classList.add('message', sender);

    if (isVideo) {
        div.innerHTML = `<div class="video-container" style="margin: 10px 0;"><video width="100%" controls autoplay style="border-radius: 15px; border: 3px solid #d42426;"><source src="${content}" type="video/mp4"></video></div>`;
    } else {
        div.innerHTML = `<p>${content.replace(/\n/g, '<br>')}</p>`;
    }

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    if (!isVideo) saveHistory();
}

async function handleChat(e) {
    e.preventDefault();
    const msg = userInput.value.trim();
    if (!msg) return;

    appendMessage(msg, 'user');
    userInput.value = '';
    if (typingIndicator) {
        typingIndicator.textContent = UI_TEXTS[currentLang].typing;
        typingIndicator.style.display = 'block';
    }

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
