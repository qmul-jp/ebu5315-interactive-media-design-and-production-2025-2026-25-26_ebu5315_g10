// --- 状态与语言 ---
let currentLang = 'zh';

// --- 夜间模式 ---
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;
const iconSpan = darkModeToggle.querySelector('.icon');

const applyTheme = (isDark) => {
    body.classList.toggle('dark-mode', isDark);
    iconSpan.textContent = isDark ? '🌙' : '☀️';
};

darkModeToggle.addEventListener('click', () => {
    const isDark = !body.classList.contains('dark-mode');
    applyTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

if (localStorage.getItem('theme') === 'dark') applyTheme(true);

// --- 语言切换 ---
const langToggle = document.getElementById('lang-toggle');
const langText = document.getElementById('lang-text');

langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    langText.textContent = currentLang === 'zh' ? 'EN' : 'CN';
    
    document.querySelectorAll('[data-zh]').forEach(el => {
        el.textContent = currentLang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-zh');
    });
});

// --- 平滑滚动 (导航栏与Hero按钮) ---
const scrollToUSP = (e) => {
    if (e) e.preventDefault();
    document.getElementById('usp-section').scrollIntoView({ behavior: 'smooth' });
};
document.getElementById('learn-usp-btn').addEventListener('click', scrollToUSP);
document.getElementById('nav-usp-btn').addEventListener('click', scrollToUSP);

// --- AI 助手交互 ---
const aiWidget = document.getElementById('ai-widget');
const aiChatWindow = document.getElementById('ai-chat-window');
const closeChat = document.getElementById('close-chat');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

aiWidget.addEventListener('click', () => {
    aiChatWindow.style.display = aiChatWindow.style.display === 'flex' ? 'none' : 'flex';
});

closeChat.addEventListener('click', (e) => {
    e.stopPropagation();
    aiChatWindow.style.display = 'none';
});

const handleSend = () => {
    const val = chatInput.value.trim();
    if (!val) return;
    
    const userMsg = document.createElement('div');
    userMsg.className = 'message user-msg';
    userMsg.textContent = val;
    chatMessages.appendChild(userMsg);
    chatInput.value = '';

    setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'message ai-msg';
        aiMsg.textContent = currentLang === 'zh' ? "正在检索圆几何定理..." : "Fetching geometry theorems...";
        chatMessages.appendChild(aiMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 600);
};

sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSend());

// --- 订阅逻辑 ---
document.getElementById('subscribe-btn').addEventListener('click', () => {
    const email = document.getElementById('subscribe-email').value;
    if (email.includes('@')) {
        alert(currentLang === 'zh' ? "🎉 订阅成功！" : "🎉 Subscribed!");
    } else {
        alert(currentLang === 'zh' ? "请输入有效邮箱" : "Please enter a valid email");
    }
});