document.addEventListener('DOMContentLoaded', () => {
    const bgMusic = document.getElementById('bg-music');
    const clickSound = new Audio('audio/button_click.mp3');
    
    // --- 背景音樂控制 ---

    // 嘗試播放背景音樂的函式
    const playBgMusic = () => {
        if (bgMusic.paused) {
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("背景音樂自動播放被瀏覽器阻止了。使用者需要先與頁面互動。", error);
                });
            }
        }
    };

    // 為了符合現代瀏覽器的自動播放政策，在使用者第一次點擊頁面時才開始播放音樂
    document.body.addEventListener('click', playBgMusic, { once: true });

    // 為影片元素添加事件監聽器的函式
    const addVideoEventListeners = (videoElement) => {
        videoElement.addEventListener('play', () => {
            if (!bgMusic.paused) bgMusic.muted = true;
        });
        videoElement.addEventListener('pause', () => {
            if (!bgMusic.paused) bgMusic.muted = false;
        });
        videoElement.addEventListener('ended', () => {
            if (!bgMusic.paused) bgMusic.muted = false;
        });
    };

    // --- 按鈕點擊音效控制 ---

    // 播放點擊音效的函式
    const playClickSound = () => {
        clickSound.currentTime = 0; // 讓音效可以連續快速觸發
        clickSound.play().catch(error => console.log("按鈕音效播放失敗:", error));
    };

    // 為元素添加點擊音效監聽器的函式
    const addButtonSoundListener = (element) => {
        element.addEventListener('click', playClickSound);
    };

    // --- DOM 變動觀察與事件綁定 ---

    // 尋找所有已經存在的 <video> 和 <button> 元素並加上監聽
    const soundElementsSelector = 'button, #start-button, .character, .user-option, [id*="btn"]';
    document.querySelectorAll('video').forEach(addVideoEventListeners);
    document.querySelectorAll(soundElementsSelector).forEach(addButtonSoundListener);

    // 使用 MutationObserver 來偵測後續動態加入到畫面的元素
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // 確保是元素節點
                        // 檢查新增的節點是否為 video 或 button
                        if (node.matches('video')) addVideoEventListeners(node);
                        if (node.matches(soundElementsSelector)) addButtonSoundListener(node);
                        
                        // 檢查新增的節點是否包含 video 或 button
                        node.querySelectorAll('video').forEach(addVideoEventListeners);
                        node.querySelectorAll(soundElementsSelector).forEach(addButtonSoundListener);
                    }
                });
            }
        }
    });

    // 啟動觀察，監聽整個文件的變化
    observer.observe(document.body, { childList: true, subtree: true });
});

