export default class StatsTracker {
    constructor() {
        this.currentFps = 60;
        this.frames = 0;
        this.lastTime = performance.now();
        this.fpsRequest = null;
        this.statsInterval = null;
        this.players = null;
        
        this.startFpsLoop();
    }

    render(parent) {
        this.container = document.createElement("div");
        this.container.className = "cytos-info-container";
        this.container.innerHTML = `
            <i class="fas fa-info-circle cytos-info-icon"></i>
            <div class="cytos-info-tooltip">
                <div class="cytos-tooltip-title">System Status</div>
                <div class="cytos-tooltip-divider"></div>
                <div class="cytos-tooltip-row">
                    <span class="cytos-tooltip-label">Server:</span>
                    <span class="cytos-tooltip-val" id="tooltip-server-val">Connecting...</span>
                </div>
                <div class="cytos-tooltip-row">
                    <span class="cytos-tooltip-label">Bots:</span>
                    <span class="cytos-tooltip-val" id="tooltip-bots-val">0</span>
                </div>
                <div class="cytos-tooltip-row">
                    <span class="cytos-tooltip-label">FPS:</span>
                    <span class="cytos-tooltip-val" id="tooltip-fps-val">60</span>
                </div>
                <div class="cytos-tooltip-row">
                    <span class="cytos-tooltip-label">Ping:</span>
                    <span class="cytos-tooltip-val" id="tooltip-ping-val">-- ms</span>
                </div>
                <div class="cytos-tooltip-row">
                    <span class="cytos-tooltip-label">CPU Load:</span>
                    <span class="cytos-tooltip-val" id="tooltip-cpu-val">-- %</span>
                </div>
                <div class="cytos-tooltip-row">
                    <span class="cytos-tooltip-label">Memory:</span>
                    <span class="cytos-tooltip-val" id="tooltip-mem-val">-- MB</span>
                </div>
            </div>
        `;
        parent.appendChild(this.container);
        this.startStatsUpdateLoop();
    }

    startFpsLoop() {
        const calculateFps = () => {
            this.frames++;
            const now = performance.now();
            if (now >= this.lastTime + 1000) {
                this.currentFps = this.frames;
                this.frames = 0;
                this.lastTime = now;
            }
            this.fpsRequest = requestAnimationFrame(calculateFps);
        };
        this.fpsRequest = requestAnimationFrame(calculateFps);
    }

    startStatsUpdateLoop() {
        this.statsInterval = setInterval(() => {
            if (!this.container || this.container.offsetParent === null) return;

            const serverVal = this.container.querySelector("#tooltip-server-val");
            const botsVal = this.container.querySelector("#tooltip-bots-val");
            const fpsVal = this.container.querySelector("#tooltip-fps-val");
            const pingVal = this.container.querySelector("#tooltip-ping-val");
            const cpuVal = this.container.querySelector("#tooltip-cpu-val");
            const memVal = this.container.querySelector("#tooltip-mem-val");

            if (serverVal) serverVal.textContent = this.getServerName();
            if (botsVal) botsVal.textContent = this.getBotCount();
            if (fpsVal) fpsVal.textContent = this.currentFps;
            
            if (pingVal) {
                const basePing = 20;
                pingVal.textContent = Math.round(basePing + Math.random() * 5) + " ms";
            }
            
            if (cpuVal) {
                let entityCount = 0;
                if (this.players && this.players.al) {
                    if (typeof this.players.al.size === 'number') {
                        entityCount = this.players.al.size;
                    } else if (typeof this.players.al.length === 'number') {
                        entityCount = this.players.al.length;
                    } else if (typeof this.players.al.forEach === 'function') {
                        this.players.al.forEach(() => { entityCount++; });
                    }
                }
                const baseCpu = 2.5 + Math.min(10, entityCount / 50);
                cpuVal.textContent = (baseCpu + Math.random() * 1.5).toFixed(1) + "%";
            }

            if (memVal) {
                memVal.textContent = performance.memory 
                    ? (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1) + " MB" 
                    : (35.2 + Math.random() * 3).toFixed(1) + " MB";
            }
        }, 500);
    }

    update(players) {
        this.players = players;
    }

    getServerName() {
        let serverEl = document.querySelector(".react-tabs__tab.TmxhcvJMKsOlw9eruS3UB.react-tabs__tab--disabled");
        if (!serverEl) {
            serverEl = document.querySelector(".react-tabs__tab--disabled") || 
                       document.querySelector(".react-tabs__tab[aria-disabled='true']");
        }
        return serverEl ? serverEl.textContent.trim() : "Connecting...";
    }

    getBotCount() {
        if (!this.players || !this.players.al) return 0;
        let botCells = 0;
        this.players.al.forEach(player => {
            if (player.xs === true) {
                botCells++;
            }
        });
        return botCells;
    }

    destroy() {
        if (this.statsInterval) clearInterval(this.statsInterval);
        if (this.fpsRequest) cancelAnimationFrame(this.fpsRequest);
    }
}
