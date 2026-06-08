export class Hero {
    constructor() {
        this.cloud = document.getElementById('hero-shapes');
        this.btnEnter = document.getElementById('btn-enter');
        this.init();
    }

    init() {
        if (this.cloud) {
            // 還原你原本的 20 個隨機絢麗光球背景
            for (let i = 0; i < 20; i++) {
                const shape = document.createElement('div');
                shape.className = 'shape';
                const size = Math.random() * 200 + 100;
                shape.style.width = `${size}px`;
                shape.style.height = `${size}px`;
                shape.style.left = `${Math.random() * 100}%`;
                shape.style.top = `${Math.random() * 75}%`;
                shape.style.background = ['#ff6bff', '#7cfcff', '#ffe066'][Math.floor(Math.random() * 3)];
                shape.style.animationDelay = `-${Math.random() * 20}s`;
                this.cloud.appendChild(shape);
            }
        }

        if (this.btnEnter) {
            this.btnEnter.addEventListener('click', () => {
                document.getElementById('playground').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }
}