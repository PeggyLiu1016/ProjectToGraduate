document.addEventListener('DOMContentLoaded', () => {
    // --- 全域狀態 ---
    window.userGameData = {
        name: '',
        scamMethod: '',
        personalization: '',
        character: ''
    };

    // --- 頁面元素 ---
    const pages = document.querySelectorAll('.page');
    const enrollPageWrapper = document.querySelector('#enroll-page .wrapper');
    
    // --- 導航按鈕 ---
    const enterBtnLink = document.getElementById('enter-btn-link');
    const enrollNextBtn = document.getElementById('enroll-next-btn');
    const confirmCharacterBtn = document.getElementById('confirm-character-btn');
    const sequenceNextBtn = document.getElementById('sequence-next-btn');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const playEndingVideoBtn = document.getElementById('play-ending-video-btn');
    const replayEndingVideoBtn = document.getElementById('replay-ending-video-btn');

    // --- 影片相關元素 ---
    const videoPlayer1 = document.getElementById('video-player-1');
    const introVideo = document.getElementById('intro-video');
    const videoPlayerEnding = document.getElementById('video-player-ending');
    const endingVideo = document.getElementById('ending-video');

    // --- 互動序列元素 ---
    const sequenceVideo1 = document.getElementById('sequence-video-1');
    const clickableGif = document.getElementById('clickable-gif');
    const sequenceVideo2 = document.getElementById('sequence-video-2');
    const finalPng = document.getElementById('final-png');

    // --- 【*** 關鍵修改：建立結局影片對應表 ***】 ---
    // 請將 '...' 部分替換成您實際的影片檔案路徑
    const endingVideoMap = {
        '假投資': ['ED/假投資介紹.mp4', 'ED/假投資預防.mp4'],
        '假網購': ['ED/假網購介紹.mp4', 'ED/假網購預防.mp4'],
        '假中獎': ['ED/假中獎介紹.mp4', 'ED/假中獎預防.mp4'],
        '詐取帳戶': ['ED/假帳戶介紹.mp4', 'ED/假帳戶預防.mp4'],
        '貸款詐騙': ['ED/假貸款介紹.mp4', 'ED/假貸款預防.mp4'],
        // 提供一個預設的影片組合，以防萬一
        'default': ['ED/結局一 新.mp4', 'ED/結局二.mp4']
    };
    let endingVideos = []; // 這個變數將用來存放當前要播放的影片列表
    let currentEndingVideoIndex = 0;


    /**
     * 切換顯示的頁面
     * @param {string} pageId 要顯示的頁面 ID
     */
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.toggle('active', page.id === pageId);
        });

        if (pageId === 'enroll-page') {
            enrollPageWrapper.classList.add('interactive-mode');
        } else {
            enrollPageWrapper.classList.remove('interactive-mode');
        }

        console.log(`切換到頁面: #${pageId}`);
    }

    /**
     * 播放互動序列
     */
    function playInteractiveSequence() {
        showPage('interactive-sequence-page');
        const scamIntroPath = `UI設計/詐騙簡介/${window.userGameData.character}-${window.userGameData.scamMethod}.jpg`;
        finalPng.src = scamIntroPath;
        finalPng.onerror = () => {
            console.error(`圖片載入失敗: ${scamIntroPath}`);
            finalPng.src = 'https://placehold.co/1920x1080/000000/FFFFFF?text=圖片載入失敗';
        };

        const skipSequenceVideo1 = () => {
            sequenceVideo1.pause();
            sequenceVideo1.style.display = 'none';
            clickableGif.style.display = 'block';
            sequenceVideo1.removeEventListener('click', skipSequenceVideo1);
        };

        const skipSequenceVideo2 = () => {
            sequenceVideo2.pause();
            sequenceVideo2.style.display = 'none';
            finalPng.style.display = 'block';
            sequenceNextBtn.style.display = 'block';
            sequenceVideo2.removeEventListener('click', skipSequenceVideo2);
        };

        sequenceVideo1.style.display = 'block';
        sequenceVideo1.play();
        sequenceVideo1.addEventListener('click', skipSequenceVideo1);
        sequenceVideo1.onended = skipSequenceVideo1;

        clickableGif.onclick = () => {
            clickableGif.style.display = 'none';
            sequenceVideo2.style.display = 'block';
            sequenceVideo2.play();
            sequenceVideo2.addEventListener('click', skipSequenceVideo2);
        };

        sequenceVideo2.onended = skipSequenceVideo2;
    }

    // --- 影片跳過處理函式 ---
    function skipIntroVideo() {
        introVideo.pause();
        videoPlayer1.style.display = 'none';
        showPage('enroll-page');
    }

    /**
     * (由「進動畫」或「再播一次」觸發)
     */
    function playEndingSequence() {
        // 根據玩家選擇的詐騙方式，從對應表中取得正確的影片組合
        const userScamMethod = window.userGameData.scamMethod;
        endingVideos = endingVideoMap[userScamMethod] || endingVideoMap['default'];
        console.log(`根據詐騙方式 "${userScamMethod}"，選擇影片列表:`, endingVideos);

        currentEndingVideoIndex = 0; // 每次都從第一個影片開始
        videoPlayerEnding.style.display = 'flex'; // 顯示影片播放器
        document.getElementById('ending-buttons-container').style.display = 'none'; // 播放時隱藏按鈕區
        document.querySelector('#ending-gif-page .ending-gif-container').classList.remove('masked'); // 移除遮罩
        playNextEndingVideo();
    }

    /**
     * 依序播放下一個結局影片 (由前一個影片結束或點擊螢幕觸發)
     */
    function playNextEndingVideo() {
        if (currentEndingVideoIndex < endingVideos.length) {
            // 如果還有影片，就設定來源並播放
            endingVideo.src = endingVideos[currentEndingVideoIndex];
            endingVideo.play();
            currentEndingVideoIndex++;
        } else {
            // 所有影片播放完畢
            endingVideo.pause(); // 【*** 強制停止影片播放以消除聲音 ***】
            videoPlayerEnding.style.display = 'none'; // 隱藏播放器
            
            showPage('ending-gif-page');

            const endingGif = document.getElementById('ending-gif');
            const endingGifContainer = document.querySelector('#ending-gif-page .ending-gif-container');
            const endingButtons = document.getElementById('ending-buttons-container');

            // 【*** 關鍵修改：實現全黑背景與按鈕置中 ***】
            // 1. 隱藏原本的 GIF 圖片
            endingGif.style.display = 'none';

            // 2. 將容器背景設為黑色，並用 flexbox 將內容（按鈕）置中
            endingGifContainer.classList.remove('masked'); // 移除舊的遮罩樣式
            endingGifContainer.style.backgroundColor = 'black';
            endingGifContainer.style.display = 'flex';
            endingGifContainer.style.justifyContent = 'center';
            endingGifContainer.style.alignItems = 'center';

            // 顯示「回首頁」和「再播一次」按鈕，並隱藏「進動畫」按鈕
            backToHomeBtn.style.display = 'block';
            replayEndingVideoBtn.style.display = 'block';
            playEndingVideoBtn.style.display = 'none';
            
            endingButtons.style.display = 'flex'; // 重新顯示按鈕區
        }
    }


    // --- 事件監聽設定 (控制頁面流程) ---

    // 1. 封面頁 -> (播放影片) -> 註冊頁
    enterBtnLink.addEventListener('click', (e) => {
        e.preventDefault();
        videoPlayer1.style.display = 'flex';
        introVideo.play();
    });

    introVideo.addEventListener('ended', skipIntroVideo);
    videoPlayer1.addEventListener('click', skipIntroVideo);

    // 2. 註冊頁 -> 角色選擇頁
    enrollNextBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('name');
        const selectedScamMethodBtn = document.querySelector('#scam-method-options .option-btn.selected');
        const selectedPersonalizationBtns = document.querySelectorAll('#personalization-options .option-btn.selected');
        const personalizations = Array.from(selectedPersonalizationBtns).map(btn => btn.innerText).join(', ');

        window.userGameData.name = nameInput.value.trim();
        window.userGameData.scamMethod = selectedScamMethodBtn ? selectedScamMethodBtn.innerText : '';
        window.userGameData.personalization = personalizations;
        
        if (window.userGameData.name && window.userGameData.scamMethod && window.userGameData.personalization) {
            console.log('註冊資料已確認:', window.userGameData);
            showPage('character-select-page');
        } else {
            alert('請填寫所有註冊資訊！');
        }
    });
    
    // 3. 角色選擇頁 -> 互動序列
    confirmCharacterBtn.addEventListener('click', () => {
        const activeCard = document.querySelector('#character-select-page .card.active');
        if (activeCard) {
            window.userGameData.character = activeCard.dataset.characterName;
            console.log('使用者最終選擇:', window.userGameData);
            
            sessionStorage.setItem('userName', window.userGameData.name);
            sessionStorage.setItem('userScamMethod', window.userGameData.scamMethod);
            sessionStorage.setItem('userPersonal', window.userGameData.personalization);
            sessionStorage.setItem('selectedCharacter', window.userGameData.character);
            
            playInteractiveSequence();
        } else {
            alert('請選擇一個角色！');
        }
    });

    // 4. 互動序列 -> 聊天室
    sequenceNextBtn.addEventListener('click', () => {
        if (typeof window.initializeChat === 'function') {
            window.initializeChat();
        } else {
            console.error("錯誤：找不到 initializeChat 函數。");
        }
        showPage('chat-page');
    });
    
    // 5. 遊戲結局 -> 結局畫面
    document.addEventListener('gameEnded', (e) => {
        const { success } = e.detail;
        const endingGif = document.getElementById('ending-gif');
        const endingButtons = document.getElementById('ending-buttons-container');
        const endingGifContainer = document.querySelector('#ending-gif-page .ending-gif-container');

        // 【*** 新增：重置結局畫面樣式 ***】
        // 確保 GIF 可見，並移除黑色背景和置中樣式，以恢復初始狀態
        endingGif.style.display = 'block';
        endingGifContainer.style.backgroundColor = '';
        endingGifContainer.style.display = '';
        endingGifContainer.style.justifyContent = '';
        endingGifContainer.style.alignItems = '';
        endingGifContainer.classList.remove('masked');

        endingGif.src = success ? 'ED/成功.GIF' : 'ED/失敗.GIF';
        
        showPage('ending-gif-page');

        // GIF 播放一段時間後顯示按鈕
        setTimeout(() => {
            endingGifContainer.classList.add('masked');
            endingButtons.style.display = 'flex';
            playEndingVideoBtn.style.display = 'block';
            replayEndingVideoBtn.style.display = 'none';
        }, 4000);
    });

    // 6. 結局頁按鈕與影片序列邏輯
    backToHomeBtn.addEventListener('click', () => {
        window.location.reload(); 
    });

    playEndingVideoBtn.addEventListener('click', playEndingSequence);
    
    replayEndingVideoBtn.addEventListener('click', playEndingSequence);

    endingVideo.addEventListener('ended', playNextEndingVideo);

    videoPlayerEnding.addEventListener('click', playNextEndingVideo);


    // --- 應用程式初始化 ---
    showPage('cover-page');
});

