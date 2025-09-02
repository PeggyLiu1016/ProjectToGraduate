document.addEventListener('DOMContentLoaded', () => {

    const track = document.getElementById('carouselTrack');
    const cards = document.querySelectorAll('#character-select-page .card');
    const infoBox = document.getElementById('infoBox');
    // 【關鍵修正 3/3】獲取左上角圖片的元素
    const dynamicImage = document.getElementById('character-dynamic-image');
    
    if (!track || !cards.length || !infoBox || !dynamicImage) {
        return;
    }

    const total = cards.length;
    let currentIndex = 0;

    // 在角色資料中加上對應的圖片路徑
    const infoData = [
        { name: "阿明", personality: "機靈、單純", feature: "好奇心旺盛", color:"#d1a089", border:"#e9a587", dynamicImage: "UI設計/角色選擇/角色背景線1.PNG" },
        { name: "獅頭", personality: "沉穩、理性", feature: "高度警覺心", color:"#e6bb93", border:"#eca562", dynamicImage: "UI設計/角色選擇/角色背景線2.PNG" },
        { name: "土集", personality: "衝動、沒耐心", feature: "自尊心強", color:"#e9b983", border:"#eca24e", dynamicImage: "UI設計/角色選擇/角色背景線4.PNG" },
        { name: "企頁佳", personality: "懶惰、多疑", feature: "自我中心", color:"#b5c6df", border:"#6da0ec", dynamicImage: "UI設計/角色選擇//角色背景線3.PNG" },
    ];

    cards.forEach((card, index) => {
        if(infoData[index]) {
            card.style.borderColor = infoData[index].border;
            card.style.backgroundColor = infoData[index].color;
        }
    });

    function updateCarousel() {
        const cardWidth = cards[0].offsetWidth;
        const margin = 80;
        const totalCardWidth = cardWidth + (margin * 2);
        const offset = -currentIndex * totalCardWidth + (window.innerWidth / 2) - (totalCardWidth / 2);
        
        track.style.transform = `translateX(${offset}px)`;

        cards.forEach((card, index) => {
            if (index === currentIndex) {
                card.classList.add("active");

                if(infoData[index]) {
                    const { name, personality, feature, border, dynamicImage: imgSrc } = infoData[index];
                    
                    infoBox.innerHTML = `
                        <div class="info-title">${name}</div>
                        <div class="info-sub">個性：${personality}</div>
                        <div class="info-sub">特色：${feature}</div>
                    `;
                    card.style.boxShadow = `0 0 25px 10px ${border}`;

                    // 更新左上角圖片的來源並顯示
                    dynamicImage.src = imgSrc;
                    dynamicImage.style.opacity = 1;
                }

            } else {
                card.classList.remove("active");
                card.style.boxShadow = "0 6px 12px rgba(0,0,0,0.25)";
            }
        });
    }

    // --- 事件監聽 ---
    window.addEventListener('wheel', (e) => {
        if (document.getElementById('character-select-page').classList.contains('active')) {
             // 先隱藏當前圖片，等待新圖片載入後再顯示
             dynamicImage.style.opacity = 0;
             if(e.deltaY > 0) {
                currentIndex = (currentIndex + 1) % total;
             } else if(e.deltaY < 0) {
                currentIndex = (currentIndex - 1 + total) % total;
             }
             // 延遲一點時間更新，讓淡出效果更明顯
             setTimeout(updateCarousel, 250);
        }
    });

    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            if (currentIndex !== index) {
                dynamicImage.style.opacity = 0;
                currentIndex = index;
                setTimeout(updateCarousel, 250);
            }
        });
    });
    
    // --- 初始化 ---
    const observer = new MutationObserver((mutationsList) => {
        for(let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const targetElement = mutation.target;
                if (targetElement.id === 'character-select-page' && targetElement.classList.contains('active')) {
                    updateCarousel();
                }
            }
        }
    });

    const characterPage = document.getElementById('character-select-page');
    if (characterPage) {
        observer.observe(characterPage, { attributes: true });
    }
    
    window.addEventListener('resize', updateCarousel);
});

