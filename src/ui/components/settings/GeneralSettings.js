export default class GeneralSettings {
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
                    <div class="cytos-settings-section-title">General Settings</div>
                    
                    <div class="cytos-settings-row">
                        <div class="cytos-settings-info">
                            <div class="cytos-settings-label">Show Server in Leaderboard</div>
                            <div class="cytos-settings-desc">Replace leaderboard title with active server name.</div>
                        </div>
                        <label class="cytos-switch">
                            <input type="checkbox" id="toggle-server-in-leaderboard">
                            <span class="cytos-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        parent.appendChild(this.container);
        this.initInputs();
    }

    initInputs() {
        const toggleServerLbd = this.container.querySelector("#toggle-server-in-leaderboard");
        if (toggleServerLbd) {
            toggleServerLbd.checked = this.config.showServerInLeaderboard;
            toggleServerLbd.addEventListener("change", (e) => {
                this.config.showServerInLeaderboard = e.target.checked;
                this.save();
            });
        }
    }
}
