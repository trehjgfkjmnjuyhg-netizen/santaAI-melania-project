const UI_TEXTS = {
    'ru': { title: 'Санта Клаус', subtitle: 'На Северном полюсе...', input_placeholder: 'Напишите Санте...', welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', wishlist_link: 'Хочу стать Сантой!', typing: 'Санта пишет...', error: 'Ошибка связи с Полюсом... ❄️' },
    'en': { title: 'Santa Claus', subtitle: 'At the North Pole...', input_placeholder: 'Write to Santa...', welcome: 'Ho-ho-ho! I am Santa Claus. What is your name?', wishlist_link: 'I want to be Santa!', typing: 'Santa is typing...', error: 'Communication error with the Pole... ❄️' },
    'de': { title: 'Weihnachtsmann', subtitle: 'Am Nordpol...', input_placeholder: 'Schreiben...', welcome: 'Ich bin der Weihnachtsmann. Wie heißen Sie?', wishlist_link: 'Ich möchte Weihnachtsmann sein!', typing: 'Schreibt...', error: 'Verbindungsfehler zum Pol... ❄️' },
    'fr': { title: 'Père Noël', subtitle: 'Au Pôle Nord...', input_placeholder: 'Écrire...', welcome: 'Je suis le Père Noël. Quel est ton nom?', wishlist_link: 'Devenez le Père Noël !', typing: 'Écrit...', error: 'Erreur de communication... ❄️' },
    'es': { title: 'Papá Noel', subtitle: 'En el Polo Norte...', input_placeholder: 'Escribir...', welcome: 'Soy Papá Noel. ¿Cómo te llamas?', wishlist_link: '¡Quiero ser Papá Noel!', typing: 'Escribiendo...', error: 'Error de comunicación... ❄️' }
};

const SYSTEM_PROMPTS = {
    'ru': "Я — Санта Клаус, дружелюбный и мудрый. Моя цель — вдохновлять на добрые дела.",
    'en': "I am Santa Claus, friendly and wise. My goal is to inspire good deeds.",
    'de': "Ich bin der Weihnachtsmann. Mein Ziel ist es, zu guten Taten zu inspirieren.",
    'fr': "Je suis le Père Noël. Mon but est d'inspirer les bonnes actions.",
    'es': "Soy Papá Noel. Mi objetivo es inspirar buenas acciones."
};

let currentLang = localStorage.getItem('santaLang') || 'ru';
// Загружаем историю из памяти браузера при входе
let chatHistory = JSON.parse(localStorage.getItem('santaChatHistory')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initSnow(); 
    const chatBox = document.getElementById('chat-box');
    const typingIndicator = document.getElementById('typing-indicator');
    const userInput = document.getElementById('user-input');
    const wishlistLink = document.getElementById('wishlist-link-main');

    function saveHistory() {
        localStorage.setItem('santaChatHistory', JSON.stringify(chatHistory));
    }

    function appendMessage(text, sender, shouldSave = true) {
        const div = document.createElement('div');
        div.classList.add(sender);
        div.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
        if (shouldSave) {
            chatHistory.push({role: sender === 'santa' ? 'assistant' : 'user', content: text});
            saveHistory();
        }
    }

    function loadMessages() {
        chatBox.innerHTML = '';
        if (chatHistory.length === 0) {
            appendMessage(UI_TEXTS[currentLang].welcome, 'santa');
        } else {
            chatHistory.forEach(msg => {
                const sender = msg.role === 'assistant' ? 'santa' : 'user';
                appendMessage(msg.content, sender, false);
            });
        }
    }

    async function handleChat(e) {
        e.preventDefault();
        const res = await fetch('https://santaai-melania-project.onrender.com/api/santa-chat', {
        if (!msg) return;
        appendMessage(msg, 'user');
        userInput.value = '';
        
        typingIndicator.textContent = UI_TEXTS[currentLang].typing;
        typingIndicator.style.display = 'block';

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
        } catch {
            typingIndicator.style.display = 'none';
            appendMessage(UI_TEXTS[currentLang].error, 'santa', false);
        }
    }

    function updateInterface(lang) {
        currentLang = lang;
        localStorage.setItem('santaLang', lang);
        document.querySelectorAll('.lang-sock').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
        document.getElementById('header-title').textContent = UI_TEXTS[lang].title;
        document.getElementById('header-subtitle').textContent = UI_TEXTS[lang].subtitle;
        userInput.placeholder = UI_TEXTS[lang].input_placeholder;
        wishlistLink.textContent = UI_TEXTS[lang].wishlist_link;
        loadMessages();
    }

    document.getElementById('language-socks').addEventListener('click', (e) => {
        const btn = e.target.closest('.lang-sock');
        if (btn) {
            // При смене языка можно очистить историю, чтобы Санта не путался
            chatHistory = [];
            saveHistory();
            updateInterface(btn.dataset.lang);
        }
    });

    document.getElementById('chat-form').addEventListener('submit', handleChat);
    updateInterface(currentLang);
});

// Функция снега остается без изменений
function initSnow() {
    const canvas = document.createElement('canvas');
    canvas.id = 'snow-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let flakes = [];
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.onresize = resize; resize();
    for(let i=0; i<100; i++) flakes.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: Math.random()*3+1, d: Math.random()*1});
    function draw() {
        ctx.clearRect(0,0,canvas.width, canvas.height); ctx.fillStyle = "white"; ctx.beginPath();
        flakes.forEach(f => {
            ctx.moveTo(f.x, f.y); ctx.arc(f.x, f.y, f.r, 0, Math.PI*2, true);
            f.y += Math.pow(f.d, 2) + 1;
            if(f.y > canvas.height) { f.y = -10; f.x = Math.random()*canvas.width; }
        });
        ctx.fill(); requestAnimationFrame(draw);
    }
    draw();
}
