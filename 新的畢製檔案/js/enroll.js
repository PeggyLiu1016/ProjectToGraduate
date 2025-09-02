// enroll.js

document.addEventListener('DOMContentLoaded', function () {
    // --- 獲取所有需要的 DOM 元素 ---
    const nameInput = document.getElementById('name');
    const scamMethodOptionsContainer = document.getElementById('scam-method-options');
    const scamMethodButtons = scamMethodOptionsContainer ? scamMethodOptionsContainer.querySelectorAll('.option-btn') : [];
    const personalizationOptionsContainer = document.getElementById('personalization-options');
    const personalizationButtons = personalizationOptionsContainer ? personalizationOptionsContainer.querySelectorAll('.option-btn') : [];
    const nextButton = document.getElementById('enroll-next-btn');
    const enrollWrapper = document.querySelector('#enroll-page .wrapper'); // 獲取註冊頁的 wrapper

    // 用於儲存使用者選擇的變數
    let selectedScamMethod = '';
    let selectedPersonalizations = [];

    const MAX_PERSONALIZATION_SELECTIONS = 3;

    // --- 新增：處理互動提示遮罩的邏輯 ---
    if (enrollWrapper) {
        // 定義一個移除遮罩的函數
        const removeOverlay = () => {
            enrollWrapper.classList.remove('interactive-mode');
        };

        // 為姓名輸入框加上 'focus' 事件監聽，當使用者點擊準備輸入時觸發
        // { once: true } 確保這個事件只會觸發一次
        nameInput.addEventListener('focus', removeOverlay, { once: true });

        // 為所有選項按鈕加上 'click' 事件監聽，點擊任一按鈕時觸發
        scamMethodButtons.forEach(button => {
            button.addEventListener('click', removeOverlay, { once: true });
        });
        personalizationButtons.forEach(button => {
            button.addEventListener('click', removeOverlay, { once: true });
        });
    } else {
        console.error("錯誤：在 enroll.js 中找不到 #enroll-page .wrapper 元素。");
    }

    // --- 處理「詐騙方式」選項的點擊事件 (單選) ---
    if (scamMethodButtons.length > 0) {
        scamMethodButtons.forEach(button => {
            button.addEventListener('click', function () {
                scamMethodButtons.forEach(btn => btn.classList.remove('selected'));
                this.classList.add('selected');
                selectedScamMethod = this.textContent.trim();
                console.log('Enroll Page - 已選擇的詐騙方式:', selectedScamMethod);
            });
        });
    } else {
        console.warn("警告：找不到任何詐騙方式選項按鈕。");
    }

    // --- 處理「個性化」選項的點擊事件 ---
    if (personalizationButtons.length > 0) {
        personalizationButtons.forEach(button => {
            button.addEventListener('click', function () {
                const isCurrentlySelected = this.classList.contains('selected');
                const currentSelectionText = this.textContent.trim();

                if (isCurrentlySelected) {
                    this.classList.remove('selected');
                    selectedPersonalizations = selectedPersonalizations.filter(item => item !== currentSelectionText);
                } else {
                    if (selectedPersonalizations.length < MAX_PERSONALIZATION_SELECTIONS) {
                        this.classList.add('selected');
                        selectedPersonalizations.push(currentSelectionText);
                    } else {
                        alert('「個性化」選項最多只能選擇 ' + MAX_PERSONALIZATION_SELECTIONS + ' 個！');
                    }
                }
                console.log('Enroll Page - 已選擇的個性化:', selectedPersonalizations);
            });
        });
    } else {
        console.warn("警告：找不到任何個性化選項按鈕。");
    }

    // --- 處理「下一頁」連結的點擊事件 ---
    if (nextButton) {
        nextButton.addEventListener('click', function (event) {
            // event.preventDefault() 已不再需要，因為它是一個 img 元素不是 a 連結
            const userName = nameInput.value.trim();

            // 驗證輸入
            if (userName === '') {
                alert('請輸入姓名！');
                return;
            }
            if (selectedScamMethod === '') {
                alert('請選擇一個詐騙方式！');
                return;
            }
            if (selectedPersonalizations.length === 0) {
                alert('請至少選擇一個個性化選項！');
                return;
            }

            // 將選擇的資料儲存到 sessionStorage
            sessionStorage.setItem('userName', userName);
            sessionStorage.setItem('userScamMethod', selectedScamMethod); // 儲存詐騙方式
            sessionStorage.setItem('userPersonal', selectedPersonalizations.join(', '));

            console.log('Enroll Page - 資料已儲存，準備觸發下一步...');

            // *** 關鍵修正 ***
            // 觸發一個自定義事件，通知 main.js 註冊已完成
            document.dispatchEvent(new CustomEvent('enrollmentComplete'));
        });
    } else {
        console.error("錯誤：在 enroll.js 中找不到 '下一頁' 的按鈕。請檢查 HTML 中 <img> 標籤的 ID 是否為 'enroll-next-btn'。");
    }
});
