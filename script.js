const RENDER_URL = "https://santaai-melania-project.onrender.com/api/santa-chat";

const UI_TEXTS = {
    'ru': { title: 'Санта Клаус', welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', typing: 'Санта пишет...' },
    'en': { title: 'Santa Claus', welcome: 'Ho-ho-ho! I am Santa Claus. What is your name?', typing: 'Santa is typing...' },
    'de': { title: 'Weihnachtsmann', welcome: 'Ich bin der Weihnachtsmann. Wie heißen Sie?', typing: 'Schreibt...' },
    'fr': { title: 'Père Noël', welcome: 'Je suis le Père Noël. Quel est ton nom?', typing: 'Écrit...' },
    'es': { title: 'Papá Noel', welcome: 'Soy Papá Noel. ¿Cómo te llamas?', typing: 'Escribiendo...' }
};

let currentLang = localStorage.getItem('santaLang') || 'ru';

document.addEventListener('DOMContentLoaded', () => {
    initSnow(); 
    const chatBox = document.getElementById('chat-box');
    const typingIndicator = document.getElementById('typing-indicator');
    const userInput = document.getElementById('user-input');

    function appendMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add(sender);
        div.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    document.getElementById('chat-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = userInput.value.trim();
        if (!msg) return;

        appendMessage(msg, 'user');
        userInput.value = '';
        typingIndicator.textContent = UI_TEXTS[currentLang].typing;
        typingIndicator.style.display = 'block';

        try {
            const res = await fetch(RENDER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });
            const data = await res.json();
            typingIndicator.style.display = 'none';
            appendMessage(data.santaReply, 'santa');
        } catch (err) {
            typingIndicator.style.display = 'none';
            appendMessage("Ой! Олени запутались в проводах. Попробуй позже!", 'santa');
        }
    });

    document.getElementById('language-socks').addEventListener('click', (e) => {
        const btn = e.target.closest('.lang-sock');
        if (btn) {
            currentLang = btn.dataset.lang;
            localStorage.setItem('santaLang', currentLang);
            location.reload();
        }
    });

    appendMessage(UI_TEXTS[currentLang].welcome, 'santa');
});

function initSnow() {
    const canvas = document.createElement('canvas');
    canvas.id = 'snow-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let flakes = [];
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.onresize = resize; resize();
    for(let i=0; i<100; i++) flakes.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: Math.random()*3+1});
    function draw() {
        ctx.clearRect(0,0,canvas.width, canvas.height); ctx.fillStyle = "white"; ctx.beginPath();
        flakes.forEach(f => {
            ctx.moveTo(f.x, f.y); ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
            f.y += 1.5; if(f.y > canvas.height) f.y = -10;
        });
        ctx.fill(); requestAnimationFrame(draw);
    }
    draw();
}
