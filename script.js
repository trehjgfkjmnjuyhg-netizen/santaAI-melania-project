const UI_TEXTS = {
    'ru': { title: 'Санта Клаус', subtitle: 'На Северном полюсе...', input_placeholder: 'Напишите Санте...', welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', wishlist_link: 'Хочу стать Сантой!', typing: 'Санта пишет...', qr_support: 'Сканируй, чтобы поддержать Меланию и детей! ❤️', error_santa: 'Санта кормит своих оленей, напиши ему через 30 секунд!' },
    'en': { title: 'Santa Claus', subtitle: 'At the North Pole...', input_placeholder: 'Write to Santa...', welcome: 'Ho-ho-ho! I am Santa Claus. What is your name?', wishlist_link: 'I want to be Santa!', typing: 'Santa is typing...', qr_support: 'Scan to support Melania and the children! ❤️', error_santa: 'Santa is feeding his reindeer, try again in 30 seconds!' },
    'de': { title: 'Weihnachtsmann', subtitle: 'Am Nordpol...', input_placeholder: 'Schreiben...', welcome: 'Ich bin der Weihnachtsmann. Wie heißen Sie?', wishlist_link: 'Ich möchte Weihnachtsmann sein!', typing: 'Schreibt...', qr_support: 'Scannen, um Melania zu unterstützen! ❤️', error_santa: 'Der Weihnachtsmann füttert seine Rentiere...' },
    'fr': { title: 'Père Noël', subtitle: 'Au Pôle Nord...', input_placeholder: 'Écrire...', welcome: 'Je suis le Père Noël. Quel est ton nom?', wishlist_link: 'Devenez le Père Noël !', typing: 'Écrit...', qr_support: 'Scannez pour soutenir Mélanie! ❤️', error_santa: 'Le Père Noël nourrit ses rennes...' },
    'es': { title: 'Papá Noel', subtitle: 'En el Polo Norte...', input_placeholder: 'Escribir...', welcome: 'Soy Papá Noel. ¿Cómo te llamas?', wishlist_link: '¡Quiero ser Papá Noel!', typing: 'Escribiendo...', qr_support: '¡Escanea para apoyar a Melania! ❤️', error_santa: '¡Papá Noel está alimentando a sus renos...' }
};

let currentLang = localStorage.getItem('santaLang') || 'ru';
let chatHistory = [];

// Объявляем переменные здесь, чтобы все функции их видели
let chatBox, typingIndicator, userInput, chatForm;

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация элементов
    chatBox = document.getElementById('chat-box');
    typingIndicator = document.getElementById('typing-indicator');
    userInput = document.getElementById('user-input');
    chatForm = document.getElementById('chat-form');

    if (chatForm) {
        chatForm.addEventListener('submit', handleChat);
    }
    
    // Запуск снега и загрузка истории
    if (typeof initSnow === "function") initSnow(); 
    loadHistory();
});

function saveHistory() {
    if (chatBox) {
        localStorage.setItem('santaChatHistory_' + currentLang, chatBox.innerHTML);
    }
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
        const videoUrl = welcomeVideos[currentLang] || welcomeVideos['en'];
        appendMessage(videoUrl, 'santa', true);
        setTimeout(() => {
            appendMessage(UI_TEXTS[currentLang].welcome, 'santa');
        }, 1500);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(content, sender, isVideo = false) {
    if (!chatBox) return;
    const div = document.createElement('div');
    div.classList.add('message', sender);

    if (isVideo) {
        div.innerHTML = `
            <div class="video-container" style="margin: 10px 0;">
                <video width="100%" controls autoplay style="border-radius: 15px; border: 3px solid #d42426;">
                    <source src="${content}" type="video/mp4">
                </video>
            </div>`;
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
    if (!msg || !userInput) return;

    appendMessage(msg, 'user');
    userInput.value = '';
    if (typingIndicator) typingIndicator.style.display = 'block';

    try {
        const response = await fetch('https://santa-brain.onrender.com/api/santa-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg, lang: currentLang })
        });
        const data = await response.json();
        if (typingIndicator) typingIndicator.style.display = 'none';
        
        if (data.videoUrl) {
            appendMessage(data.videoUrl, 'santa', true);
        }
        if (data.santaReply) {
            appendMessage(data.santaReply, 'santa');
        }
    } catch (err) {
        if (typingIndicator) typingIndicator.style.display = 'none';
        appendMessage(UI_TEXTS[currentLang].error_santa, 'santa');
    }
}
