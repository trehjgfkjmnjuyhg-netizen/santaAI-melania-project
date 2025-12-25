// 1. Полные тексты интерфейса, включая заголовок Добрых дел
const UI_TEXTS = {
    'ru': { title: 'Санта Клаус', welcome: 'Хо-хо-хо! Я — Санта Клаус. Как тебя зовут?', typing: 'Санта записывает видео...', error_santa: 'Олени запутались, попробуй через 30 сек!', good_deeds: 'Наши Добрые Дела 📸' },
    'en': { title: 'Santa Claus', welcome: 'Ho-ho-ho! I am Santa Claus. What is your name?', typing: 'Santa is recording...', error_santa: 'Try again in 30 seconds!', good_deeds: 'Our Good Deeds 📸' },
    'de': { title: 'Weihnachtsmann', welcome: 'Ich bin der Weihnachtsmann. Как тебя зовут?', typing: 'Schreibt...', error_santa: 'Versuchen Sie es позже!', good_deeds: 'Unsere guten Taten 📸' },
    'fr': { title: 'Père Noël', welcome: 'Je suis le Père Noël. Quel est ton nom?', typing: 'Écrit...', error_santa: 'Réessayez plus tard !', good_deeds: 'Nos bonnes actions 📸' },
    'es': { title: 'Papá Noel', welcome: 'Soy Papá Noel. ¿Cómo te llamas?', typing: 'Escribiendo...', error_santa: '¡Inténtalo de nuevo!', good_deeds: 'Nuestras buenas acciones 📸' }
};

// 2. Глобальные переменные, доступные всем функциям
let currentLang = localStorage.getItem('santaLang') || 'ru';
let chatBox, typingIndicator, userInput, chatForm;

// 3. Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    chatBox = document.getElementById('chat-box');
    typingIndicator = document.getElementById('typing-indicator');
    userInput = document.getElementById('user-input');
    chatForm = document.getElementById('chat-form');

    // Логика переключения языков
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.getAttribute('data-lang');
            localStorage.setItem('santaLang', currentLang);
            location.reload(); 
        });
    });

    // Отображение Добрых дел, если мы на странице отчетов
    if (document.getElementById('reports-container')) {
        displayReports();
    }

    if (chatForm) chatForm.addEventListener('submit', handleChat);
    if (chatBox) loadHistory();
});

// 4. Функция для вывода карточек "Добрых дел"
function displayReports() {
    const container = document.getElementById('reports-container');
    if (!container) return;

    const reports = [
        { name: "Мелания", task: "Помогла детям собрать подарки", date: "25.12.2025" },
        { name: "Netizen", task: "Настроил видео для Санты", date: "26.12.2025" }
    ];

    container.innerHTML = reports.map(r => `
        <div class="report-card" style="background:rgba(255,255,255,0.9); margin:10px auto; padding:15px; border-radius:15px; max-width:90%; color:#3e2723; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
            <strong style="color:#d42426;">${r.name}</strong> <span style="font-size:12px; color:#666;">(${r.date})</span>
            <p style="margin-top:5px;">${r.task}</p>
        </div>
    `).join('');
}

// 5. Обработка сообщений с поддержкой видео
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
    if (!isVideo) localStorage.setItem('santaChatHistory_' + currentLang, chatBox.innerHTML);
}

function loadHistory() {
    const history = localStorage.getItem('santaChatHistory_' + currentLang);
    if (history && history.trim().length > 10) {
        chatBox.innerHTML = history;
    } else {
        const welcomeVideo = "https://v.d-id.com/p/voc_7n1j7z0z/talk_7n1j7z0z/video.mp4"; 
        appendMessage(welcomeVideo, 'santa', true);
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
