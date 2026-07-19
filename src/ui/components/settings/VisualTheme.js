export default class VisualTheme {
    constructor(settingsConfig, saveCallback) {
        this.config = settingsConfig;
        this.save = saveCallback;
    }

    render(parent) {
        this.container = document.createElement("div");
        this.container.className = "cytos-tab-content";
        this.container.innerHTML = `
            <div class="cytos-settings-scroll">
                <div class="cytos-settings-section">
                    <div class="cytos-settings-section-title">Visual Theme</div>
                    
                    <div class="cytos-settings-row">
                        <div class="cytos-settings-info">
                            <div class="cytos-settings-label">Highlight Color</div>
                            <div class="cytos-settings-desc">Choose a custom glow and text accent color.</div>
                        </div>
                        <input type="color" id="settings-highlight-color" value="#00d2ff" class="cytos-color-picker">
                    </div>

                    <div class="cytos-settings-row">
                        <div class="cytos-settings-info">
                            <div class="cytos-settings-label">Panel Transparency</div>
                            <div class="cytos-settings-desc">Adjust the background opacity of the extension.</div>
                        </div>
                        <div class="cytos-slider-container">
                            <input type="range" id="settings-opacity" min="40" max="100" value="85" class="cytos-range">
                            <span class="cytos-range-val" id="settings-opacity-val">85%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        parent.appendChild(this.container);
        this.initInputs();
    }

    initInputs() {
        const colorPicker = this.container.querySelector("#settings-highlight-color");
        if (colorPicker) {
            colorPicker.value = this.config.highlightColor;
            colorPicker.addEventListener("input", (e) => {
                this.config.highlightColor = e.target.value;
                this.save();
            });
        }

        const opacityRange = this.container.querySelector("#settings-opacity");
        const opacityVal = this.container.querySelector("#settings-opacity-val");
        if (opacityRange && opacityVal) {
            opacityRange.value = this.config.opacity;
            opacityVal.textContent = `${this.config.opacity}%`;
            opacityRange.addEventListener("input", (e) => {
                this.config.opacity = parseInt(e.target.value);
                opacityVal.textContent = `${this.config.opacity}%`;
                this.save();
            });
        }
    }
}
