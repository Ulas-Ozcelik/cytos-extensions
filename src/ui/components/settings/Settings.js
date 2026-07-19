import NameCustomizer from "./NameCustomizer.js";
import VisualTheme from "./VisualTheme.js";
import GeneralSettings from "./GeneralSettings.js";

export default class Settings {
    constructor() {
        this.config = {
            showServerInLeaderboard: false,
            coloredName: false,
            nameGradient: false,
            nameRgb: false,
            nameColor1: "#ff0000",
            nameColor2: "#00ff00",
            nameGradientAngle: 90,
            highlightColor: "#00d2ff",
            opacity: 85
        };
        this.hue = 0;
        this.syncTimeout = null;
        this.originalLeaderboardText = undefined;

        this.load();

        this.nameCustomizer = new NameCustomizer(this.config, this.save.bind(this), this.hslToHex.bind(this));
        this.visualTheme = new VisualTheme(this.config, this.save.bind(this));
        this.generalSettings = new GeneralSettings(this.config, this.save.bind(this));

        this.startEnforcementLoop();
        this.startStoreSyncLoop();
    }

    load() {
        const stored = localStorage.getItem("cytos_rpc_settings");
        if (stored) {
            try {
                this.config = { ...this.config, ...JSON.parse(stored) };
            } catch (e) {
                console.error("Failed to load settings", e);
            }
        }
    }

    save() {
        localStorage.setItem("cytos_rpc_settings", JSON.stringify(this.config));
        this.apply();
    }

    get(key) {
        return this.config[key];
    }

    render(parent) {
        this.nameCustomizer.render(parent);
        this.visualTheme.render(parent);
        this.generalSettings.render(parent);
    }

    apply() {
        let serverEl = document.querySelector(".react-tabs__tab.TmxhcvJMKsOlw9eruS3UB.react-tabs__tab--disabled");
        if (!serverEl) {
            serverEl = document.querySelector(".react-tabs__tab--disabled") ||
                document.querySelector(".react-tabs__tab[aria-disabled='true']");
        }

        let lbdEl = document.querySelector("._12r-kWKkjIkrwbXraUuxRS");
        if (!lbdEl) {
            const divs = document.querySelectorAll('div, span');
            for (const el of divs) {
                if (el.className && typeof el.className === 'string' && el.className.includes('Leaderboard_title')) {
                    lbdEl = el;
                    break;
                }
            }
        }

        if (lbdEl) {
            if (this.config.showServerInLeaderboard && serverEl) {
                const serverText = serverEl.textContent.trim();
                if (lbdEl.textContent !== serverText) {
                    if (this.originalLeaderboardText === undefined) {
                        this.originalLeaderboardText = lbdEl.textContent;
                    }
                    lbdEl.textContent = serverText;
                }
            } else if (!this.config.showServerInLeaderboard && this.originalLeaderboardText !== undefined) {
                lbdEl.textContent = this.originalLeaderboardText;
                this.originalLeaderboardText = undefined;
            }
        }

        document.documentElement.style.setProperty("--cytos-highlight", this.config.highlightColor);
        document.documentElement.style.setProperty("--cytos-opacity", (this.config.opacity / 100).toFixed(2));

        const extContainer = document.getElementById("cytos-main-panel");
        if (extContainer) {
            extContainer.style.background = `rgba(10, 10, 12, ${(this.config.opacity / 100).toFixed(2)})`;
            extContainer.style.boxShadow = `0 12px 48px rgba(0, 0, 0, 0.5), 0 0 20px ${this.config.highlightColor}20`;
        }
    }

    startEnforcementLoop() {
        setInterval(() => {
            this.apply();
        }, 1000);
    }

    startStoreSyncLoop() {
        const tick = () => {
            this.syncStore();
            const delay = (this.config.coloredName && this.config.nameRgb) ? 120 : 1000;
            this.syncTimeout = setTimeout(tick, delay);
        };
        tick();
    }

    syncStore() {
        try {
            const appInstance = window.ext || window.cytosApp;
            const store = appInstance && appInstance.engineHook ? appInstance.engineHook.store : null;
            if (!store) {
                if (!this._loggedStoreErr) {
                    console.warn("[Settings] syncStore: store is null on appInstance");
                    this._loggedStoreErr = true;
                }
                return;
            }
            this._loggedStoreErr = false;

            const stateContainer = store.H1 || store.Ct;
            if (!stateContainer) {
                if (!this._loggedContainerErr) {
                    console.warn("[Settings] syncStore: stateContainer (H1/Ct) is null");
                    this._loggedContainerErr = true;
                }
                return;
            }
            this._loggedContainerErr = false;

            const jnState = stateContainer.Jn;
            if (!jnState) {
                if (!this._loggedJnErr) {
                    console.warn("[Settings] syncStore: Jn is null on stateContainer", stateContainer);
                    this._loggedJnErr = true;
                }
                return;
            }
            this._loggedJnErr = false;

            if (!Array.isArray(jnState.value)) {
                if (!this._loggedJnValueErr) {
                    console.warn("[Settings] syncStore: Jn.value is not an array", jnState.value);
                    this._loggedJnValueErr = true;
                }
                return;
            }
            this._loggedJnValueErr = false;

            let currentJn = [];
            try {
                currentJn = JSON.parse(JSON.stringify(jnState.value));
            } catch (e) {
                currentJn = Array.from(jnState.value).map(i => ({ ...i }));
            }

            let changed = false;

            // Custom Colored Nickname Customizer sync
            if (this.config.coloredName) {
                let colorValue;
                let colorGt;

                if (this.config.nameRgb) {
                    this.hue = (this.hue + 4) % 360;
                    const c1 = this.hslToHex(this.hue, 100, 50);
                    const c2 = this.hslToHex((this.hue + 60) % 360, 100, 50);
                    colorValue = `#FFFFFF gradient: ${parseInt(this.config.nameGradientAngle)}deg|${c1} 0%|${c2} 100%`;
                    colorGt = "gradient-color";
                } else if (this.config.nameGradient) {
                    colorValue = `#FFFFFF gradient: ${parseInt(this.config.nameGradientAngle)}deg|${this.config.nameColor1} 0%|${this.config.nameColor2} 100%`;
                    colorGt = "gradient-color";
                } else {
                    colorValue = this.config.nameColor1;
                    colorGt = "custom-hacked-color";
                }

                let colorItem = currentJn.find(it => it && it.Gt && it.Gt.endsWith("color"));
                if (!colorItem || colorItem.I !== colorValue || colorItem.Gt !== colorGt) {
                    currentJn = currentJn.filter(it => it && it.Gt && !it.Gt.endsWith("color"));
                    currentJn.push({ Gt: colorGt, I: colorValue, Ln: 99999, Yd: "Hacked Color" });
                    changed = true;
                }
            } else {
                const hasColorItem = currentJn.some(it => it && it.Gt && it.Gt.endsWith("color"));
                if (hasColorItem) {
                    currentJn = currentJn.filter(it => it && it.Gt && !it.Gt.endsWith("color"));
                    changed = true;
                }
            }

            if (changed) {
                jnState.set(currentJn);
            }
        } catch (e) {
            console.error("[Settings] syncStore error:", e);
        }
    }

    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
}
