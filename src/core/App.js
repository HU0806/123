import { StateManager } from './StateManager.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { Loader } from '../components/Loader.js';
import { Hero } from '../components/Hero.js';
import { ControlPanel } from '../components/ControlPanel.js';
import { Playground } from '../components/Playground.js';

class App {
    constructor() {
        this.stateManager = new StateManager();
        this.canvas = document.getElementById('effects-canvas');

        // 背景粒子生成計數器（用來精準控制高幀率下的發射頻率）
        this.ambientCounter = 0;

        this.init();
    }

    init() {
        console.log("%c🚀 視覺特效動畫平台核心引擎初始化中...", "color: #7cfcff; font-weight: bold;");

        if (this.canvas) {
            this.lastMode = 'normal';
            this.lastSwitchTime = 0;
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '9999';

            this.particleSystem = new ParticleSystem(this.canvas);
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        // 模組組裝與啟動
        new Loader(() => {
            new Hero();
            new ControlPanel(this.stateManager);
            new Playground(this.stateManager, this.particleSystem);
            this.startLoop();
        });
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    startLoop() {
        const loop = () => {
            if (this.particleSystem) {
                this.spawnAmbientParticlesFrame(); // 💡 每幀都會進來判定要不要生粒子
                this.particleSystem.update();
                this.particleSystem.render();
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    spawnAmbientParticlesFrame() {
        this.ambientCounter++;
        const state = this.stateManager.getState();

        // 1. 預設模式（每 20 幀落下一顆微光星塵）
        if (state.currentMode === 'normal' && this.ambientCounter % 20 === 0) {
            const randomX = Math.random() * window.innerWidth;
            this.particleSystem.emit(randomX, -20, 'ambient', 1);
        }

        // 2. 🔥 燃燒模式（每 8 幀從螢幕底部往上噴發火焰）
        if (state.currentMode === 'fire' && this.ambientCounter % 8 === 0) {
            const randomX = Math.random() * window.innerWidth;
            const randomY = window.innerHeight - 15;
            this.particleSystem.emit(randomX, randomY, 'fire', 1);
        }

        // 3. 🫧 泡泡模式（每 10 幀從螢幕底下浮起大泡泡）
        if (state.currentMode === 'bubble' && this.ambientCounter % 10 === 0) {
            const randomX = Math.random() * window.innerWidth;
            const randomY = window.innerHeight + 20;
            this.particleSystem.emit(randomX, randomY, 'bubble', 1);
        }

        // ========================================================
        // ✨ 【核心修復：以下為你漏掉的背景自動產生碼，請務必補上！】
        // ========================================================

        // 4. 🌿 草木模式（每 12 幀自動從天空中徐徐飄落下一片綠葉）
        if (state.currentMode === 'nature' && this.ambientCounter % 12 === 0) {
            const randomX = Math.random() * window.innerWidth;
            this.particleSystem.emit(randomX, -20, 'nature', 1);
        }

        // 5. ⚡ 閃電模式（每 25 幀在螢幕上方隨機空域突發劇烈炸裂驚雷）
        if (state.currentMode === 'thunder' && this.ambientCounter % 25 === 0) {
            const randomX = Math.random() * window.innerWidth;
            const randomY = Math.random() * (window.innerHeight * 0.5); // 在中上方空域雷擊
            this.particleSystem.emit(randomX, randomY, 'thunder', 3);
        }
    }
}

// 註冊至全域供狀態管理器的隱藏魔法偵測
window.app = new App();