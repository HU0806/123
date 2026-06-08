export class ControlPanel {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.container = document.getElementById('experiments-grid');
        this.init();
    }

    init() {
        if (!this.container) return;

        // 🎯 請檢查這裡的 img 檔名，是否跟你的 assets/images 或根目錄檔名一模一樣
        const experiments = [
            {
                id: 'normal',
                title: "預設",
                img: "8b374a4f-90c3-46eb-843d-6b4aa15c9706.jpg",
                desc: "滑鼠跟隨 + 觸摸粒子與愛心"
            },
            {
                id: 'bubble',
                title: "泡泡模式",
                img: "b7a58574-3b39-43f5-9a6d-8e7d9d1aabf4.jpg",
                desc: "開啟泡泡粒子特效"
            },
            {
                id: 'fire',
                title: "燃燒模式",
                img: "0897732c-b2e7-468c-b232-c6d9ccdd7462.jpg",
                desc: "開啟火焰粒子特效"
            },
            {
                id: 'nature',
                title: "草木模式",
                img: "7a03964f-4112-465e-8978-c51e670df8a7.jpg",
                desc: "開啟落葉飄散特效"
            },
            {
                id: 'thunder',
                title: "閃電模式",
                img: "8cd262a9-89f3-4665-a1f8-0e24c6a7fb8d.jpg",
                desc: "開啟雷霆霹靂特效"
            }
        ]; 
        
        this.container.innerHTML = '';

        experiments.forEach(exp => {
            const card = document.createElement('div');
            card.className = 'experiment-card glass';
            card.setAttribute('data-mode', exp.id); // 綁定屬性給 CSS 點擊高亮用
            card.innerHTML = `
                <img src="${exp.img}" alt="${exp.title}">
                <div class="info">
                    <h4>${exp.title}</h4>
                    <p>${exp.desc}</p>
                </div>
            `;

            // 🎯 點擊卡片只切換模式，中間大圖不更換
            card.addEventListener('click', () => {
                this.stateManager.setState({ currentMode: exp.id });
                
                // 複合魔法安全鎖
                if (window.app?.particleSystem) {
                    const rect = document.getElementById('main-cat')?.getBoundingClientRect();
                    if (rect) {
                        const pCount = window.app.particleSystem.particles?.length || 0;
                    }
                }
            });

            this.container.appendChild(card);
        });
    }
}