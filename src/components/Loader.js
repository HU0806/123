export class Loader {
    constructor(onComplete) {
        // 同時支援舊版自訂屬性與新版 ID 抓取，徹底防止回傳 null 報錯
        this.loaderEl = document.getElementById('page-loader') || document.querySelector('[data-page-loader]');
        this.progressBar = document.getElementById('loader-progress') || document.querySelector('[data-loader-progress]');
        this.percentText = document.getElementById('loader-percent') || document.querySelector('[data-loader-percent]');
        this.onComplete = onComplete;
        this.start();
    }

    start() {
        if (!this.loaderEl || !this.progressBar || !this.percentText) { 
            console.warn("[Loader] 找不到載入動畫相關 DOM 節點，直接跳過蓋板。");
            if (this.onComplete) this.onComplete(); 
            return; 
        }
        
        let progress = 0;
        const timer = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;

            this.progressBar.style.width = `${progress}%`;
            this.percentText.textContent = `${Math.floor(progress)}%`;

            if (progress >= 100) {
                clearInterval(timer);
                setTimeout(() => {
                    this.loaderEl.style.transition = 'opacity 0.6s ease';
                    this.loaderEl.style.opacity = '0';
                    setTimeout(() => {
                        this.loaderEl.remove();
                        if (this.onComplete) this.onComplete();
                    }, 600);
                }, 400);
            }
        }, 50);
    }
}