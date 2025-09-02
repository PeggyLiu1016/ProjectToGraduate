// --- 全域變數 ---
let chatWindow, messageInput, sendMessageBtn;
let conversationHistory = [];
let isGameOver = false;
let turnCounter = 0;
const MAX_TURNS = 10;
const userAvatar = 'UI設計/EnrollO/頭貼2.png'; // 玩家的頭像
const BACKEND_API_URL = 'http://127.0.0.1:5000/chat';

// --- NPC 角色資料庫 ---
const NPC_DATA = {
    "阿明": { name: "阿明", avatar: "頭貼/阿明.jpg" },
    "獅頭": { name: "獅頭", avatar: "頭貼/獅頭.jpg" },
    "土集": { name: "土集", avatar: "頭貼/土集.jpg" },
    "企頁佳": { name: "企頁佳", avatar: "頭貼/企頁佳.jpg" }
};

// --- 開場白資料庫 ---
const OPENING_LINES = {
    "阿明": {
        "假網購": { starter: 'player', line: '哈囉，你最近賣的東西還在嗎？', npcResponse: '在喔，有需要可以直接下單。' },
        "假投資": { starter: 'npc', line: '你好，我追蹤你一陣子了，覺得你好厲害！想請問要怎麼跟你一樣成功？' },
        "詐取帳戶": { starter: 'player', line: '我這邊正好有管道可以申請政府補助金，你要試試看嗎？', npcResponse: '真的嗎？那要怎麼申請？'},
        "貸款詐騙": { starter: 'npc', line: '你好，我看到你們的貸款廣告，想了解一下。'},
        "假中獎": { starter: 'npc', line: '你好，我收到通知說我中獎了，請問要怎麼領取？'}
    },
    "獅頭": {
        "假網購": { starter: 'player', line: '您好，請問這個還有貨嗎？我想買。', npcResponse: '有，規格跟照片一樣，沒問題的話可以直接下單。' },
        "假投資": { starter: 'npc', line: '你好，拜讀了您很多文章，想請教一下關於家庭資產配置的問題。' },
        "詐取帳戶": { starter: 'player', line: '大哥，最近政府有給家庭的補助金方案，你知道嗎？', npcResponse: '喔？我沒聽說，是什麼樣的方案？' },
        "貸款詐騙": { starter: 'npc', line: '你好，請問貸款最快多久可以撥款？' },
        "假中獎": { starter: 'npc', line: '你好，我收到中獎通知，是真的嗎？' }
    },
    "企頁佳": {
        "假網購": { starter: 'player', line: '嗨，東西還在？直接賣我吧。', npcResponse: '在，要就直接下單，別浪費我時間。' },
        "假投資": { starter: 'npc', line: '看你過得不錯，有什麼好康的能帶我一個嗎？' },
        "詐取帳戶": { starter: 'player', line: '欸，有個政府的紓困補助可以拿錢，你有沒有興趣？', npcResponse: '喔？要幹嘛？麻煩就算了。' },
        "貸款詐騙": { starter: 'npc', line: '廣告上說的不用證明是真的？利息怎麼算？' },
        "假中獎": { starter: 'npc', line: '我中獎了，東西要怎麼拿？' }
    },
    "土集": {
        "假網購": { starter: 'player', line: '喂，這個賣不賣？', npcResponse: '賣啊，要就快點。' },
        "假投資": { starter: 'npc', line: '大神，收徒弟嗎？我想跟你一樣猛！' },
        "詐取帳戶": { starter: 'player', line: '有個賺錢的門路，只要辦個資料就能拿錢，要不要？', npcResponse: '蛤？這麼好？說來聽聽。' },
        "貸款詐騙": { starter: 'npc', line: '喂，學生真的能借嗎？我今天就要拿到錢。' },
        "假中獎": { starter: 'npc', line: '我中了最大獎！手機什麼時候可以拿到？' }
    }
};


// --- 函數 ---

function getNpcInfo(characterName) {
    return NPC_DATA[characterName] || { name: 'NPC', avatar: '頭貼/阿明.jpg' };
}

function toggleSendButton() {
    sendMessageBtn.disabled = messageInput.value.trim() === '' || isGameOver;
}

function appendMessage(text, side, avatar) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${side}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    
    const avatarImg = document.createElement('img');
    avatarImg.src = avatar;
    avatarImg.className = 'avatar';
    
    if (side === 'left') {
        messageDiv.appendChild(avatarImg);
        messageDiv.appendChild(bubble);
    } else {
        messageDiv.appendChild(bubble);
        messageDiv.appendChild(avatarImg);
    }
    
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// 【*** 新增：產生可點擊結局訊息的函數 ***】
function appendClickableEndingMessage(isSuccess, npcInfo) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message left';

    const bubble = document.createElement('div');
    bubble.className = 'bubble ending-trigger-bubble'; // 加上新的 class
    bubble.textContent = '▶ 點此查看結局動畫';

    const avatarImg = document.createElement('img');
    avatarImg.src = npcInfo.avatar;
    avatarImg.className = 'avatar';
    
    messageDiv.appendChild(avatarImg);
    messageDiv.appendChild(bubble);

    // 加上只會觸發一次的點擊事件
    bubble.addEventListener('click', () => {
        console.log("結局按鈕被點擊，觸發 gameEnded 事件");
        document.dispatchEvent(new CustomEvent('gameEnded', { 
            detail: { success: isSuccess } 
        }));
        // 點擊後讓按鈕失效，避免重複觸發
        bubble.style.pointerEvents = 'none';
        bubble.style.backgroundColor = '#cccccc';
        bubble.textContent = '已觸發結局';
    }, { once: true }); // once: true 確保事件只會被觸發一次

    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


function showTypingIndicator(npcInfo) {
    const typingMessage = `
        <div class="message left" id="typing-indicator">
            <img src="${npcInfo.avatar}" alt="avatar" class="avatar">
            <div class="bubble">
                <span class="typing-indicator">
                    <span>.</span><span>.</span><span>.</span>
                </span>
            </div>
        </div>`;
    chatWindow.insertAdjacentHTML('beforeend', typingMessage);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}


async function callApi() {
    const selectedCharacter = sessionStorage.getItem('selectedCharacter');
    const scamMethod = sessionStorage.getItem('userScamMethod');
    const npcInfo = getNpcInfo(selectedCharacter);

    showTypingIndicator(npcInfo);
    messageInput.disabled = true;
    sendMessageBtn.disabled = true;

    try {
        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                character: selectedCharacter,
                scamType: scamMethod,
                history: conversationHistory
            })
        });

        if (!response.ok) throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);

        const data = await response.json();
        const aiReply = data.reply;

        hideTypingIndicator();
        
        // 【*** 關鍵修改：結局判斷邏輯 ***】
        if (aiReply.includes('【結局】') || aiReply.includes('[結局]') || aiReply.includes('結局')) {
            isGameOver = true;
            messageInput.placeholder = '對話已結束';
            
            // 正常顯示結局文字
            appendMessage(aiReply, 'left', npcInfo.avatar);

            // 判斷成功或失敗
            const isSuccess = aiReply.includes('信任');
            
            // 接著顯示可點擊的結局按鈕，而不是直接觸發事件
            appendClickableEndingMessage(isSuccess, npcInfo);

        } else {
            // 如果不是結局，正常顯示訊息
            appendMessage(aiReply, 'left', npcInfo.avatar);
            conversationHistory.push({ "role": "assistant", "content": aiReply });
        }

    } catch (error) {
        console.error('API 呼叫失敗:', error);
        hideTypingIndicator();
        appendMessage('抱歉，我這裡好像出了點問題，請稍後再試。', 'left', npcInfo.avatar);
    } finally {
        if (!isGameOver) {
            messageInput.disabled = false;
            toggleSendButton();
            messageInput.focus();
        }
    }
}

function handleSendMessage() {
    const userInput = messageInput.value.trim();
    if (userInput === '' || isGameOver) return;

    appendMessage(userInput, 'right', userAvatar);
    conversationHistory.push({ "role": "user", "content": userInput });
    messageInput.value = '';
    toggleSendButton();

    turnCounter++;
    if (turnCounter >= MAX_TURNS && !isGameOver) {
        isGameOver = true;
        messageInput.placeholder = '對話已達上限，正在產生結局...';
        callApi(); 
        return; 
    }
    
    if (!isGameOver) {
        callApi();
    }
}

function handleEnterKey(e) {
    if (e.key === 'Enter' && !sendMessageBtn.disabled) {
        handleSendMessage();
    }
}

function initializeChat() {
    chatWindow = document.getElementById('chatWindow');
    messageInput = document.getElementById('messageInput');
    sendMessageBtn = document.getElementById('sendMessageBtn');
    
    isGameOver = false; 
    turnCounter = 0;
    messageInput.disabled = false; 
    sendMessageBtn.disabled = true;
    messageInput.placeholder = '輸入您的訊息...';
    conversationHistory = []; 
    chatWindow.innerHTML = '';

    const selectedCharacter = sessionStorage.getItem('selectedCharacter');
    const scamMethod = sessionStorage.getItem('userScamMethod');
    
    if (!selectedCharacter || !scamMethod) {
        console.error("錯誤：在 sessionStorage 中找不到角色或詐騙類型。");
        appendMessage("遊戲初始化失敗，請回到首頁重新開始。", 'left', NPC_DATA["阿明"].avatar);
        return;
    }

    const npcInfo = getNpcInfo(selectedCharacter);
    
    document.querySelector('#chat-page .top-bar .name').textContent = npcInfo.name;
    document.querySelector('#chat-page .top-bar .avatar-container img').src = npcInfo.avatar;
    
    const opening = OPENING_LINES[selectedCharacter]?.[scamMethod];
    if (!opening) { 
        console.error("找不到開場白設定！"); 
        return; 
    }

    if (opening.starter === 'player') {
        appendMessage(opening.line, 'right', userAvatar);
        conversationHistory.push({ "role": "user", "content": opening.line });
        
        setTimeout(() => {
            appendMessage(opening.npcResponse, 'left', npcInfo.avatar);
            conversationHistory.push({ "role": "assistant", "content": opening.npcResponse });
        }, 1000);

    } else { 
        appendMessage(opening.line, 'left', npcInfo.avatar);
        conversationHistory.push({ "role": "assistant", "content": opening.line });
    }
    
    messageInput.removeEventListener('input', toggleSendButton);
    sendMessageBtn.removeEventListener('click', handleSendMessage);
    messageInput.removeEventListener('keypress', handleEnterKey);

    messageInput.addEventListener('input', toggleSendButton);
    sendMessageBtn.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', handleEnterKey);
    messageInput.focus();
}

window.initializeChat = initializeChat;

