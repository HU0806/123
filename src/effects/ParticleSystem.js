class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.alpha = 1;
        this.life = 1.0;

        // 💡 根據不同的元素模式，指派對應的物理特性
        if (type === 'fire') {
            this.decay = Math.random() * 0.002 + 0.003;
            this.size = Math.random() * 30 + 20;
            this.vx = (Math.random() - 0.5) * 2.0;
            this.vy = -Math.random() * 3.0 - 4.5;
        } else if (type === 'bubble') {
            this.decay = Math.random() * 0.004 + 0.004;
            this.size = Math.random() * 15 + 5;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = -Math.random() * 2.0 - 1.0;
        } else if (type === 'ambient') {
            this.decay = Math.random() * 0.01 + 0.005;
            this.size = Math.random() * 4 + 1;
            this.vx = (Math.random() - 0.5) * 1.0;
            this.vy = Math.random() * 1.5 + 0.5;
            this.color = ['#ff6bff', '#7cfcff', '#ffe066'][Math.floor(Math.random() * 3)];
        } 
        // 🌿 【全新擴充】草木模式：落葉物理參數設定
        else if (type === 'nature') {
            this.size = Math.random() * 10 + 8;        // 葉子大小
            this.vx = Math.random() * 2 - 1;           // 左右微風偏移
            this.vy = Math.random() * 1.2 + 1.2;       // 向下緩緩飄落的速度
            this.decay = Math.random() * 0.005 + 0.004; // 壽命較長，能從頂部一路飄到底部
            this.angle = Math.random() * Math.PI * 2;   // 隨機初始旋轉角度
            this.spin = Math.random() * 0.03 - 0.015;   // 空中打轉的自轉速度
        }
        // ⚡ 【全新擴充】閃電模式：雷霆高能粒子設定
        else if (type === 'thunder') {
            this.size = Math.random() * 6 + 4;         // 雷芒核心大小
            this.vx = (Math.random() - 0.5) * 12;      // 狂暴散射的水平速度
            this.vy = (Math.random() - 0.5) * 12;      // 狂暴散射的垂直速度
            this.decay = Math.random() * 0.05 + 0.03;  // 電光石火，瞬間消逝
        }
    }

    update() {
        this.life -= this.decay;
        this.alpha = Math.max(0, this.life);

        if (this.type === 'fire') {
            this.x += this.vx;
            this.y += this.vy;
            this.size = Math.max(0, this.size - 0.15);
        } else if (this.type === 'bubble') {
            this.x += this.vx + Math.sin(this.life * 10) * 0.5;
            this.y += this.vy;
        } else if (this.type === 'ambient') {
            this.x += this.vx;
            this.y += this.vy;
        }
        // 🌿 草木模式：模擬落葉隨風在空中打轉擺動的物理動態
        else if (this.type === 'nature') {
            this.angle += this.spin; // 角度自轉
            this.x += this.vx + Math.sin(this.angle) * 0.6; // 左右蛇行晃動，極度真實
            this.y += this.vy;
        }
        // ⚡ 閃電模式：高頻率鋸齒狀顫抖顫動
        else if (this.type === 'thunder') {
            this.x += this.vx + (Math.random() * 6 - 3);
            this.y += this.vy + (Math.random() * 6 - 3);
        }
    }

    draw(ctx) {
        if (this.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;

        if (this.type === 'fire') {
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, 'rgba(255, 200, 50, 1)');
            gradient.addColorStop(0.4, 'rgba(255, 80, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(150, 0, 200, 0)');
            ctx.fillStyle = gradient;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'bubble') {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(124, 252, 255, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.fillStyle = 'rgba(124, 252, 255, 0.05)';
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.15, 0, Math.PI * 2);
            ctx.fill();
        } 
        // 🌿 【核心繪圖修復：落葉幾何模型】
        else if (this.type === 'nature') {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            // 繪製左葉片曲線
            ctx.bezierCurveTo(-this.size * 0.6, -this.size * 0.5, -this.size * 0.6, this.size * 0.5, 0, this.size);
            // 繪製右葉片曲線
            ctx.bezierCurveTo(this.size * 0.6, this.size * 0.5, this.size * 0.6, -this.size * 0.5, 0, -this.size);
            
            // 翡翠綠填色與發光霓虹外圈
            ctx.fillStyle = '#4ade80';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#22c55e';
            ctx.fill();

            // 繪製精緻的白色微透明中央主葉脈
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(0, this.size);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        } 
        // ⚡ 【核心繪圖修復：閃電雷芒模型】
        else if (this.type === 'thunder') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            // 閃電金黃核心與高亮強光
            ctx.fillStyle = '#fffbeb';
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#fbbf24';
            ctx.fill();
            
            // 額外加繪一道隨機的電軌短線條，讓它看起來更像劈雷
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + (Math.random() * 20 - 10), this.y + (Math.random() * 30 - 15));
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        } 
        else {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

export class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
    }

    emit(x, y, type, count = 1) {
        // 設定最大安全快取上限，防止過載
        if (this.particles.length > 500) {
            return;
        }
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, type));
        }
    }

    update() {
        let aliveIndex = 0;
        const len = this.particles.length;

        for (let i = 0; i < len; i++) {
            this.particles[i].update();
            if (this.particles[i].life > 0) {
                this.particles[aliveIndex] = this.particles[i];
                aliveIndex++;
            }
        }
        this.particles.length = aliveIndex;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const len = this.particles.length;
        for (let i = 0; i < len; i++) {
            this.particles[i].draw(this.ctx);
        }
    }
}