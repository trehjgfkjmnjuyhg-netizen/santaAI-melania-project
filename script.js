// Конфигурация и элементы
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');

let currentLang = 'ru';
let chatHistory = [];

const UI_TEXTS = {
    ru: { welcome: "Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?", typing: "Санта печатает...", error: "Ошибка связи с Полюсом... ❄️", title: "Санта Клаус" },
    en: { welcome: "Ho-ho-ho! I am Santa Claus. What is your name?", typing: "Santa is typing...", error: "Connection error to North Pole... ❄️", title: "Santa Claus" },
    de: { welcome: "Ich bin der Weihnachtsmann. Wie heißen Sie?", typing: "Weihnachtsmann schreibt...", error: "Verbindungsfehler zum Pol... ❄️", title: "Weihnachtsmann" },
    fr: { welcome: "Ho ho ho ! Je suis le Père Noël. Comment t'appelles-tu ?", typing: "Le Père Noël écrit...", error: "Erreur de connexion au Pôle... ❄️", title: "Père Noël" },
    es: { welcome: "¡Ho, ho, ho! Soy Papá Noel. ¿Cómo te llamas?", typing: "Papá Noel está escribiendo...", error: "Error de conexión con el Polo... ❄️", title: "Papá Noel" }
};

const SYSTEM_PROMPTS = {
    ru: "Ты — добрый Санта Клаус. Отвечай сказочно и тепло.",
    en: "You are Santa Claus. Be magical and warm.",
    de: "Du bist der Weihnachtsmann. Antworte magisch.",
    fr: "Tu es le Père Noël. Réponds de manière magique.",
    es: "Eres Papá Noel. Responde de forma mágica."
};

function appendMessage(text, sender, shouldSave = true) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    if (shouldSave) {
        chatHistory.push({ role: sender === 'santa' ? 'assistant' : 'user', content: text });
        saveHistory();
    }
}

function saveHistory() {
    localStorage.setItem('santaChatHistory', JSON.stringify(chatHistory));
}

function loadMessages() {
    const saved = localStorage.getItem('santaChatHistory');
    if (saved) {
        chatHistory = JSON.parse(saved);
        chatBox.innerHTML = '';
        chatHistory.forEach(msg => {
            const sender = msg.role === 'assistant' ? 'santa' : 'user';
            appendMessage(msg.content, sender, false);
        });
    } else {
        appendMessage(UI_TEXTS[currentLang].welcome, 'santa');
    }
}

async function handleChat(e) {
    if (e) e.preventDefault();
    const msg = userInput.value.trim();
    if (!msg) return;

    appendMessage(msg, 'user');
    userInput.value = '';

    typingIndicator.textContent = UI_TEXTS[currentLang].typing;
    typingIndicator.style.display = 'block';

    try {
        // ИСПРАВЛЕННАЯ СТРОКА: заменена ( на {
        const res = await fetch('https://santaai-melania-project.onrender.com/api/santa-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: msg,
                systemPrompt: SYSTEM_PROMPTS[currentLang],
                history: chatHistory.slice(-10)
            })
        });

        const data = await res.json();
        typingIndicator.style.display = 'none';
        appendMessage(data.santaReply, 'santa');
    } catch (error) {
        typingIndicator.style.display = 'none';
        appendMessage(UI_TEXTS[currentLang].error, 'santa', false);
    }
}

function updateInterface(lang) {
    currentLang = lang;
    localStorage.setItem('santaLang', lang);
    document.querySelectorAll('.lang-sock').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    document.getElementById('header-title').textContent = UI_TEXTS[lang].title;
    userInput.placeholder = lang === 'ru' ? "Напишите Санте..." : "Write to Santa...";
    loadMessages();
}

// Слушатели событий
// Безопасные слушатели событий
if (sendBtn) {
    sendBtn.addEventListener('click', handleChat);
}
if (userInput) {
    userInput.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') handleChat(); 
    });
}

// Запуск
const savedLang = localStorage.getItem('santaLang');
updateInterface(savedLang || 'ru');
