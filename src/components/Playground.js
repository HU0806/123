export class Playground {
    constructor(stateManager, particleSystem) {
        this.stateManager = stateManager;
        this.particleSystem = particleSystem;

        this.catContainer = document.getElementById('main-cat');
        this.catImg = document.getElementById('main-cat-img');
        this.btnUpload = document.getElementById('btn-upload');
        this.btnReset = document.getElementById('btn-reset');
        this.imageUploader = document.getElementById('image-uploader');

        this.statClicks = document.getElementById('stat-clicks');
        this.statMode = document.getElementById('stat-mode');

        this.allMagicClasses = ['magic-normal', 'magic-bubble', 'magic-fire', 'magic-nature', 'magic-thunder'];

        // 🛠️ 滑動/拖曳狀態追蹤變數
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.dragX = 0;
        this.dragY = 0;

        this.sounds = {};
        try {
            this.sounds.normal = new Audio('assets/audio/meow.mp3');
            this.sounds.bubble = new Audio('assets/audio/bubble.mp3');
            this.sounds.fire = new Audio('assets/audio/fire.mp3');
            this.sounds.nature = new Audio('assets/audio/nature.mp3');
            this.sounds.thunder = new Audio('assets/audio/thunder.mp3');

            if(this.sounds.normal) this.sounds.normal.volume = 0.7;
            if(this.sounds.bubble) this.sounds.bubble.volume = 0.6;
            if(this.sounds.fire) this.sounds.fire.volume = 0.6;
            if(this.sounds.nature) this.sounds.nature.volume = 0.6;
            if(this.sounds.thunder) this.sounds.thunder.volume = 0.6;
        } catch(e) {
            console.warn("[Playground] 音效初始化失敗，將以無聲模式執行。", e);
        }

        this.init();
    }

    init() {
        if (!this.catContainer || !this.catImg) return;

        this.stateManager.subscribe((state) => this.updateUI(state));

        // ========================================================
        // 🌌 1. 視覺懸浮移動 + 滑動動態效應
        // ========================================================
        this.catContainer.addEventListener('mousemove', (e) => {
            const state = this.stateManager.getState();
            
            // 計算滑鼠相對於容器中心點的偏移
            const rect = this.catContainer.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // 如果同時在拖曳滑動，疊加滑動位移
            const finalX = x * 0.15 + this.dragX;
            const finalY = y * 0.15 + this.dragY;

            this.catImg.style.transform = `scale(1.03) translate(${finalX}px, ${finalY}px) rotateX(${-finalY * 0.12}deg) rotateY(${finalX * 0.12}deg)`;

            // 邊滑動邊噴發環境粒子
            if (Math.random() < 0.25) {
                this.emitModeParticle(state.currentMode, e.clientX, e.clientY, 1);
            }
        });

        // ========================================================
        // 👆 2. 圖片滑動/拖曳操控機制 (支援滑鼠與手機觸控)
        // ========================================================
        const startDrag = (clientX, clientY) => {
            this.isDragging = true;
            this.startX = clientX - this.dragX;
            this.startY = clientY - this.dragY;
            this.catImg.style.transition = 'none'; // 拖曳時關閉過渡，確保絕對跟手
        };

        const doDrag = (clientX, clientY) => {
            if (!this.isDragging) return;
            // 計算滑動產生的位移量
            this.dragX = clientX - this.startX;
            this.dragY = clientY - this.startY;

            // 限制最大滑動範圍，防止圖片飛出螢幕外（鎖定最大半徑 60px）
            const distance = Math.sqrt(this.dragX * this.dragX + this.dragY * this.dragY);
            if (distance > 60) {
                const angle = Math.atan2(this.dragY, this.dragX);
                this.dragX = Math.cos(angle) * 60;
                this.dragY = Math.sin(angle) * 60;
            }

            this.catImg.style.transform = `scale(1.05) translate(${this.dragX}px, ${this.dragY}px) rotateX(${-this.dragY * 0.3}deg) rotateY(${this.dragX * 0.3}deg)`;
        };

        const stopDrag = () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.dragX = 0;
            this.dragY = 0;
            // 放開後恢復平滑的果凍回彈動畫
            this.catImg.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            this.catImg.style.transform = 'scale(1) translate(0, 0) rotateX(0deg) rotateY(0deg)';
        };

        // 滑鼠監聽
        this.catImg.addEventListener('mousedown', (e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); });
        window.addEventListener('mousemove', (e) => doDrag(e.clientX, e.clientY));
        window.addEventListener('mouseup', stopDrag);

        // 手機觸控監聽
        this.catImg.addEventListener('touchstart', (e) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); });
        window.addEventListener('touchmove', (e) => doDrag(e.touches[0].clientX, e.touches[0].clientY));
        window.addEventListener('touchend', stopDrag);

        // 滑鼠離開容器時的防呆還原
        this.catContainer.addEventListener('mouseleave', () => {
            if (!this.isDragging) {
                this.catImg.style.transition = 'transform 0.4s ease';
                this.catImg.style.transform = 'scale(1) translate(0, 0) rotateX(0deg) rotateY(0deg)';
            }
        });

        // ========================================================
        // 🖱️ 3. 點擊計數與特效噴發
        // ========================================================
        this.catImg.addEventListener('click', (e) => {
            // 如果剛剛發生了較大範圍的滑動，則判定為拖曳而非單純點擊
            if (Math.abs(this.dragX) > 5 || Math.abs(this.dragY) > 5) return;

            const state = this.stateManager.getState();
            
            const currentClicks = state.stats.totalClicks + 1;
            this.stateManager.setState({
                stats: { ...state.stats, totalClicks: currentClicks }
            });

            // 🎵 觸發優化後的聲音控制
            this.playModeSound(state.currentMode);

            // 爆發大量點擊粒子
            this.emitModeParticle(state.currentMode, e.clientX, e.clientY, 6);
        });

        // 圖片上傳與重置按鈕邏輯
        if (this.btnUpload && this.imageUploader) {
            this.btnUpload.addEventListener('click', () => this.imageUploader.click());
            this.imageUploader.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        if (this.btnReset) {
            this.btnReset.addEventListener('click', () => {
                this.stateManager.setState({
                    currentMode: 'normal',
                    currentImage: '8b374a4f-90c3-46eb-843d-6b4aa15c9706.jpg',
                    isUserUploaded: false
                });
            });
        }
    }

    /**
     * 🎵【聲音優化核心】：播完才能撥下一次（不打斷防刷機制）
     */
    playModeSound(mode) {
        try {
            const sound = this.sounds[mode] || this.sounds.normal;
            if (sound) {
                // 🎯 核心檢查：如果目前的聲音還在前一次的播放中，就直接 return 讓它完整播完
                if (!sound.paused && sound.currentTime > 0) {
                    return; 
                }
                sound.currentTime = 0;
                sound.play().catch(() => {});
            }
        } catch(e) {}
    }

    /**
     * 🔮 粒子發射輔助器
     */
    emitModeParticle(mode, x, y, count) {
        if (mode === 'fire') {
            this.particleSystem.emit(x, y, 'fire', count);
        } else if (mode === 'bubble') {
            this.particleSystem.emit(x, y, 'bubble', count);
        } else if (mode === 'nature') {
            this.particleSystem.emit(x, y, 'nature', count);
        } else if (mode === 'thunder') {
            this.particleSystem.emit(x, y, 'thunder', count);
        } else {
            this.particleSystem.emit(x, y, 'ambient', count);
        }
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            this.stateManager.setState({
                currentImage: event.target.result,
                isUserUploaded: true
            });
        };
        reader.readAsDataURL(file);
    }

    updateUI(state) {
        if (this.statClicks) this.statClicks.textContent = state.stats.totalClicks;

        if (this.catImg) {
            this.catImg.src = state.currentImage;
        }

        this.allMagicClasses.forEach(cls => this.catContainer.classList.remove(cls));

        if (state.currentMode === 'fire') {
            if (this.statMode) this.statMode.textContent = "🔥 燃燒模式";
            this.catImg.style.filter = 'hue-rotate(-20deg) brightness(1.2) contrast(1.1)';
            this.catContainer.classList.add('magic-fire');
        } else if (state.currentMode === 'bubble') {
            if (this.statMode) this.statMode.textContent = "🫧 泡泡模式";
            this.catImg.style.filter = 'hue-rotate(180deg) brightness(1.1)';
            this.catContainer.classList.add('magic-bubble');
        } else if (state.currentMode === 'nature') {
            if (this.statMode) this.statMode.textContent = "🌿 草木模式";
            this.catImg.style.filter = 'hue-rotate(60deg) brightness(1.05) saturate(1.2)';
            this.catContainer.classList.add('magic-nature');
        } else if (state.currentMode === 'thunder') {
            if (this.statMode) this.statMode.textContent = "⚡ 閃電模式";
            this.catImg.style.filter = 'hue-rotate(220deg) brightness(1.3) contrast(1.2)';
            this.catContainer.classList.add('magic-thunder');
        } else {
            if (this.statMode) this.statMode.textContent = "✨ 預設";
            this.catImg.style.filter = 'none';
            this.catContainer.classList.add('magic-normal');
        }

        this.updateCardGlows(state.currentMode);
    }

    updateCardGlows(currentMode) {
        const cards = document.querySelectorAll('.experiment-card');
        cards.forEach((card) => {
            card.classList.remove('active-normal', 'active-bubble', 'active-fire', 'active-nature', 'active-thunder');
            const cardMode = card.getAttribute('data-mode');
            if (cardMode === currentMode) {
                card.classList.add(`active-${currentMode}`);
            }
        });
    }
}