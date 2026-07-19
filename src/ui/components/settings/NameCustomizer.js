export default class NameCustomizer {
    constructor(settingsConfig, saveCallback, hslToHex) {
        this.config = settingsConfig;
        this.save = saveCallback;
        this.hslToHex = hslToHex;
    }

    render(parent) {
        this.container = document.createElement("div");
        this.container.className = "cytos-tab-content";
        this.container.innerHTML = `
            <div class="cytos-settings-scroll">
                <div class="cytos-settings-section">
                    <div class="cytos-settings-section-title">Name Customizer</div>
                    
                    <div class="cytos-settings-row">
                        <div class="cytos-settings-info">
                            <div class="cytos-settings-label">Enable Colored Name</div>
                            <div class="cytos-settings-desc">Draw your name in custom colors.</div>
                        </div>
                        <label class="cytos-switch">
                            <input type="checkbox" id="toggle-colored-name">
                            <span class="cytos-slider"></span>
                        </label>
                    </div>

                    <div class="cytos-settings-row">
                        <div class="cytos-settings-info">
                            <div class="cytos-settings-label">Use Gradient Name</div>
                            <div class="cytos-settings-desc">Use a two-color gradient for your nickname.</div>
                        </div>
                        <label class="cytos-switch">
                            <input type="checkbox" id="toggle-name-gradient">
                            <span class="cytos-slider"></span>
                        </label>
                    </div>

                    <div class="cytos-settings-row">
                        <div class="cytos-settings-info">
                            <div class="cytos-settings-label">Rainbow RGB Mode</div>
                            <div class="cytos-settings-desc">Cycle your name colors in a dynamic rainbow.</div>
                        </div>
                        <label class="cytos-switch">
                            <input type="checkbox" id="toggle-name-rgb">
                            <span class="cytos-slider"></span>
                        </label>
                    </div>

                    <div class="cytos-settings-row" id="row-name-color-1">
                        <div class="cytos-settings-info">
                            <div class="cytos-settings-label">Primary Name Color</div>
                            <div class="cytos-settings-desc">Choose your main color or gradient start.</div>
                        </div>
                        <input type="color" id="name-color-1" value="#ff0000" class="cytos-color-picker">
                    </div>

                    <div class="cytos-settings-row" id="row-name-color-2">
                        <div class="cytos-settings-info">
                            <div class="cytos-settings-label">Secondary Name Color</div>
                            <div class="cytos-settings-desc">Choose your gradient end color.</div>
                        </div>
                        <input type="color" id="name-color-2" value="#00ff00" class="cytos-color-picker">
                    </div>

                    <div class="cytos-settings-row" id="row-name-angle">
                        <div class="cytos-settings-info">
                            <div class="cytos-settings-label">Gradient Angle</div>
                            <div class="cytos-settings-desc">Adjust the angle of the nickname gradient.</div>
                        </div>
                        <div class="cytos-slider-container">
                            <input type="range" id="name-gradient-angle" min="0" max="360" value="90" class="cytos-range">
                            <span class="cytos-range-val" id="name-angle-val">90°</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        parent.appendChild(this.container);
        this.initInputs();
        this.updateUIFields();
    }

    initInputs() {
        const toggleColoredName = this.container.querySelector("#toggle-colored-name");
        if (toggleColoredName) {
            toggleColoredName.checked = this.config.coloredName;
            toggleColoredName.addEventListener("change", (e) => {
                this.config.coloredName = e.target.checked;
                this.save();
                this.updateUIFields();
            });
        }

        const toggleNameGradient = this.container.querySelector("#toggle-name-gradient");
        if (toggleNameGradient) {
            toggleNameGradient.checked = this.config.nameGradient;
            toggleNameGradient.addEventListener("change", (e) => {
                this.config.nameGradient = e.target.checked;
                this.save();
                this.updateUIFields();
            });
        }

        const toggleNameRgb = this.container.querySelector("#toggle-name-rgb");
        if (toggleNameRgb) {
            toggleNameRgb.checked = this.config.nameRgb;
            toggleNameRgb.addEventListener("change", (e) => {
                this.config.nameRgb = e.target.checked;
                this.save();
                this.updateUIFields();
            });
        }

        const nameColorInput1 = this.container.querySelector("#name-color-1");
        if (nameColorInput1) {
            nameColorInput1.value = this.config.nameColor1;
            nameColorInput1.addEventListener("input", (e) => {
                this.config.nameColor1 = e.target.value;
                this.save();
            });
        }

        const nameColorInput2 = this.container.querySelector("#name-color-2");
        if (nameColorInput2) {
            nameColorInput2.value = this.config.nameColor2;
            nameColorInput2.addEventListener("input", (e) => {
                this.config.nameColor2 = e.target.value;
                this.save();
            });
        }

        const nameAngleInput = this.container.querySelector("#name-gradient-angle");
        const nameAngleVal = this.container.querySelector("#name-angle-val");
        if (nameAngleInput && nameAngleVal) {
            nameAngleInput.value = this.config.nameGradientAngle;
            nameAngleVal.textContent = `${this.config.nameGradientAngle}°`;
            nameAngleInput.addEventListener("input", (e) => {
                this.config.nameGradientAngle = parseInt(e.target.value);
                nameAngleVal.textContent = `${this.config.nameGradientAngle}°`;
                this.save();
            });
        }
    }

    updateUIFields() {
        if (!this.container) return;

        const rowColor1 = this.container.querySelector("#row-name-color-1");
        const rowColor2 = this.container.querySelector("#row-name-color-2");
        const rowAngle = this.container.querySelector("#row-name-angle");

        if (this.config.coloredName) {
            if (this.config.nameRgb) {
                if (rowColor1) rowColor1.style.display = "none";
                if (rowColor2) rowColor2.style.display = "none";
                if (rowAngle) rowAngle.style.display = "";
            } else if (this.config.nameGradient) {
                if (rowColor1) rowColor1.style.display = "";
                if (rowColor2) rowColor2.style.display = "";
                if (rowAngle) rowAngle.style.display = "";
            } else {
                if (rowColor1) rowColor1.style.display = "";
                if (rowColor2) rowColor2.style.display = "none";
                if (rowAngle) rowAngle.style.display = "none";
            }
        } else {
            if (rowColor1) rowColor1.style.display = "none";
            if (rowColor2) rowColor2.style.display = "none";
            if (rowAngle) rowAngle.style.display = "none";
        }
    }
}
