const RENDER_URL = "https://santaai-melania-project.onrender.com/api/santa-chat";

const UI_TEXTS = {
    'ru': { welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', typing: 'Санта пишет...' },
    'en': { welcome: 'Ho-ho-ho! I am Santa Claus. What is your name?', typing: 'Santa is typing...' },
    // Добавь другие языки по аналогии
};

let currentLang = 'ru';

document.addEventListener('DOMContentLoaded', () => {
    initSnow();
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const typing = document.getElementById('typing-indicator');

    async function handleChat(e) {
        e.preventDefault();
        const msg = userInput.value.trim();
        if(!msg) return;

        appendMsg(msg, 'user');
        userInput.value = '';
        typing.style.display = 'block';

        try {
            const res = await fetch(RENDER_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ message: msg, systemPrompt: "Ты добрый Санта Клаус." })
            });
            const data = await res.json();
            appendMsg(data.santaReply, 'santa');
        } catch (err) {
            appendMsg("Ой, связь прервалась!", 'santa');
        } finally {
            typing.style.display = 'none';
        }
    }

    function appendMsg(text, role) {
        const div = document.createElement('div');
        div.className = role;
        div.innerHTML = `<p>${text}</p>`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    document.getElementById('chat-form').addEventListener('submit', handleChat);
    appendMsg(UI_TEXTS[currentLang].welcome, 'santa');
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
            f.y += 1; if(f.y > canvas.height) f.y = -10;
        });
        ctx.fill(); requestAnimationFrame(draw);
    }
    draw();
}
