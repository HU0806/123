// src/core/StateManager.js

export class StateManager {
    constructor(initialState = {}) {
        this.state = {
            currentMode: 'normal',
            currentImage: '8b374a4f-90c3-46eb-843d-6b4aa15c9706.jpg',
            isUserUploaded: false,
            stats: { totalClicks: 0 },
            ...initialState
        };
        this.listeners = [];
        this.lastSwitchTime = 0;
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        const currentTime = Date.now();
        const nextMode = newState.currentMode;

        if (nextMode) {
            this.lastSwitchTime = currentTime;
        }

        // 🎯 核心優化：已完全移除舊有的 bubble -> fire 晃動與煙霧彩蛋殘骸碼，確保切換乾淨俐落！
        this.state = { ...this.state, ...newState };
        this.listeners.forEach(listener => listener(this.state));
    }

    triggerScreenShake(duration) {
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.classList.add('magic-screen-shake');
            setTimeout(() => appContainer.classList.remove('magic-screen-shake'), duration);
        }
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
}