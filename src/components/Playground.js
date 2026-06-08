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

        // 🎯【核心旋轉修復】：讓所有模式全面釋放「3D 旋轉傾斜特效」
        this.catContainer.addEventListener('mousemove', (e) => {
            const state = this.stateManager.getState();
            
            // 計算滑鼠相對於中央大圖容器的中心點偏移量
            const rect = this.catContainer.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // 🌟 迎回旋轉靈魂：不論什麼模式，通通注入流暢的 3D 旋轉矩陣與微幅放大
            // 通過 X 與 Y 軸的交叉變換，滑鼠移到哪，圖片就立體傾斜到哪！
            this.catImg.style.transform = `scale(1.03) translate(${x * 0.15}px, ${y * 0.15}px) rotateX(${-y * 0.12}deg) rotateY(${x * 0.12}deg)`;

            // 滑鼠移動時，根據當前模式源源不絕地從滑鼠尖端噴發對應微光粒子
            if (Math.random() < 0.3) {
                if (state.currentMode === 'fire') {
                    this.particleSystem.emit(e.clientX, e.clientY, 'fire', 1);
                } else if (state.currentMode === 'bubble') {
                    this.particleSystem.emit(e.clientX, e.clientY, 'bubble', 1);
                } else if (state.currentMode === 'nature') {
                    this.particleSystem.emit(e.clientX, e.clientY, 'nature', 1);
                } else if (state.currentMode === 'thunder') {
                    this.particleSystem.emit(e.clientX, e.clientY, 'thunder', 1);
                } else {
                    this.particleSystem.emit(e.clientX, e.clientY, 'ambient', 1);
                }
            }
        });

        // ✨ 滑鼠離開容器時，流暢回彈復原至完美正圓中心
        this.catContainer.addEventListener('mouseleave', () => {
            this.catImg.style.transform = 'scale(1) translate(0, 0) rotateX(0deg) rotateY(0deg)';
        });

        // 點擊中間大圖事件
        this.catImg.addEventListener('click', (e) => {
            const state = this.stateManager.getState();
            
            const currentClicks = state.stats.totalClicks + 1;
            this.stateManager.setState({
                stats: { ...state.stats, totalClicks: currentClicks }
            });

            this.playModeSound(state.currentMode);

            const clickX = e.clientX;
            const clickY = e.clientY;

            if (state.currentMode === 'fire') {
                this.particleSystem.emit(clickX, clickY, 'fire', 8);
            } else if (state.currentMode === 'bubble') {
                this.particleSystem.emit(clickX, clickY, 'bubble', 6);
            } else if (state.currentMode === 'nature') {
                this.particleSystem.emit(clickX, clickY, 'nature', 6);
            } else if (state.currentMode === 'thunder') {
                this.particleSystem.emit(clickX, clickY, 'thunder', 5);
            } else {
                this.particleSystem.emit(clickX, clickY, 'ambient', 5);
            }
        });

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

    playModeSound(mode) {
        try {
            const sound = this.sounds[mode] || this.sounds.normal;
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(() => {});
            }
        } catch(e) {}
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