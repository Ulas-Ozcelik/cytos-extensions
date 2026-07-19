import Engine from "./Engine.js";
import Menu from "../ui/Menu.js";
import PlayerList from "../ui/components/players/PlayerList.js";
import Settings from "../ui/components/settings/Settings.js";
import StatsTracker from "../ui/components/layout/StatsTracker.js";
import "../ui/Style.css";

export default class App {
    constructor() {
        this.players = null;
        this.activeTab = 'players';
        this.updateTimeout = null;
        this.lastMenuVisible = false;

        if (window.cytosApp) {
            try {
                window.cytosApp.destroy();
            } catch (e) {
                console.error("Failed to destroy previous extension instance:", e);
            }
        }
        window.cytosApp = this;
        window.ext = this;

        this.engineHook = new Engine(this.handlePlayers.bind(this));
        this.menu = new Menu();
        this.playerList = new PlayerList();
        this.settings = new Settings();
        this.statsTracker = new StatsTracker();
        
        this.menu.createButton(this.togglePortal.bind(this));
        this.prepareUI();

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" || e.code === "Escape") {
                this.closePortal();
            }
        });

        document.addEventListener("click", (e) => {
            const target = e.target;
            if (target) {
                const isGameBtn = target.tagName === "BUTTON" && 
                    (target.textContent.trim().toLowerCase() === "play" || 
                     target.textContent.trim().toLowerCase() === "spectate");
                const isOurSpecBtn = target.classList.contains("cytos-spectate-btn");

                if (isGameBtn || isOurSpecBtn) {
                    this.closePortal();
                }
            }
        });

        setInterval(() => {
            this.updatePanelVisibility();
        }, 150);
    }

    destroy() {
        if (this.updateTimeout) clearTimeout(this.updateTimeout);
        this.statsTracker.destroy();
    }

    prepareUI() {
        if (document.body) {
            this.createUI();
        } else {
            const check = setInterval(() => {
                if (document.body) {
                    clearInterval(check);
                    this.createUI();
                }
            }, 100);
        }
    }

    createUI() {
        // 1. Create Portal Overlay
        this.portalOverlay = document.createElement("div");
        this.portalOverlay.className = "cytos-portal-overlay";
        this.portalOverlay.onclick = () => this.closePortal();
        document.body.appendChild(this.portalOverlay);

        // 2. Create Morphing Portal Container
        this.container = document.createElement("div");
        this.container.id = "cytos-portal-container";
        this.container.className = "cytos-portal-container hidden";
        
        this.container.innerHTML = `
            <div class="cytos-portal-header">
                <div class="cytos-portal-icons">
                    <div class="cytos-portal-icon-wrapper" data-tab="players" title="Active Players">
                        <i class="fas fa-users"></i>
                        <span class="cytos-portal-icon-label">Players</span>
                    </div>
                    <div class="cytos-portal-icon-wrapper" data-tab="nameSettings" title="Name Customizer">
                        <i class="fas fa-palette"></i>
                        <span class="cytos-portal-icon-label">Name</span>
                    </div>
                    <div class="cytos-portal-icon-wrapper" data-tab="themeSettings" title="Visual Theme">
                        <i class="fas fa-sliders-h"></i>
                        <span class="cytos-portal-icon-label">Theme</span>
                    </div>
                    <div class="cytos-portal-icon-wrapper" data-tab="generalSettings" title="General Settings">
                        <i class="fas fa-cog"></i>
                        <span class="cytos-portal-icon-label">Settings</span>
                    </div>
                </div>
            </div>
            
            <div class="cytos-portal-content-area">
                <div class="cytos-header" style="display: none;">
                    <div class="cytos-title" id="cytos-header-title">Active Players</div>
                </div>
                <div class="cytos-tab-wrapper" id="cytos-tab-wrapper"></div>
            </div>
        `;
        document.body.appendChild(this.container);

        this.contentArea = this.container.querySelector("#cytos-tab-wrapper");
        this.titleNode = this.container.querySelector("#cytos-header-title");

        this.container.querySelectorAll(".cytos-portal-icon-wrapper").forEach(icon => {
            icon.onclick = () => {
                const tabId = icon.getAttribute("data-tab");
                this.activateTab(tabId);
            };
        });

        // 3. Render Players Tab (Content) inside tab-wrapper
        this.playersTab = document.createElement("div");
        this.playersTab.className = "cytos-tab-content active";
        this.playerList.render(this.playersTab);
        this.contentArea.appendChild(this.playersTab);

        // Render stats icon inside the players tab stats box
        const statBox = this.playersTab.querySelector(".cytos-stat-box");
        if (statBox) {
            this.statsTracker.render(statBox);
        }

        // 4. Render Settings Tab (Content) inside tab-wrapper
        this.settings.render(this.contentArea);
    }

    isMenuVisible() {
        const menuWrapper = document.querySelector('[panel-transition]');
        if (menuWrapper) {
            const hasHidden = menuWrapper.hasAttribute('hidden');
            const transitionState = menuWrapper.getAttribute('panel-transition');
            
            return !hasHidden && transitionState !== 'fade-out';
        }

        const nickInput = document.querySelector('input[placeholder="Nickname"]');
        if (nickInput) {
            return nickInput.offsetParent !== null;
        }

        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            if (btn.textContent.trim().toLowerCase() === 'play') {
                return btn.offsetParent !== null;
            }
        }
        return false;
    }

    activateTab(tabId) {
        if (!this.container) return;

        // Morph to active content state
        this.container.classList.add("content-active");

        // Highlight active icon
        this.container.querySelectorAll(".cytos-portal-icon-wrapper").forEach(icon => {
            icon.classList.toggle("active", icon.getAttribute("data-tab") === tabId);
        });

        this.handleTabChange(tabId);
        this.startUpdateLoop();
    }

    handleTabChange(tabId) {
        this.activeTab = tabId;

        const contents = this.contentArea.querySelectorAll('.cytos-tab-content');
        contents.forEach(c => c.classList.remove('active'));

        const index = ['players', 'nameSettings', 'themeSettings', 'generalSettings'].indexOf(tabId);
        if (contents[index]) contents[index].classList.add('active');

        if (tabId === 'players' && this.isMenuVisible()) {
            this.playerList.update(this.players, true);
        }
    }

    handlePlayers(players) {
        this.players = players;
        this.statsTracker.update(players);
        
        const isCurrentlyVisible = this.container && this.container.classList.contains("active") && this.container.classList.contains("content-active");
        if (isCurrentlyVisible && this.isMenuVisible() && this.activeTab === 'players') {
            this.playerList.update(this.players, true);
        }
    }

    togglePortal() {
        if (!this.container || !this.portalOverlay) return;

        const isActive = this.container.classList.contains("active");
        if (isActive) {
            this.closePortal();
        } else {
            this.openPortal();
        }
    }

    openPortal() {
        if (!this.container || !this.portalOverlay) return;

        this.container.classList.remove("inactive", "closing", "content-active");
        this.container.classList.remove("hidden");
        this.container.classList.add("active");
        this.portalOverlay.classList.add("active");

        // Reset icon highlights
        this.container.querySelectorAll(".cytos-portal-icon-wrapper").forEach(icon => {
            icon.classList.remove("active");
        });
    }

    closePortal() {
        if (!this.container || !this.portalOverlay) return;

        if (this.container.classList.contains("active")) {
            this.container.classList.remove("active");
            this.container.classList.add("closing");
            this.portalOverlay.classList.remove("active");

            setTimeout(() => {
                this.container.classList.remove("closing");
                this.container.classList.add("hidden");
                this.container.classList.remove("content-active");
            }, 500);
        }
    }

    updatePanelVisibility() {
        if (!this.container) return;

        const isMenuVisible = this.isMenuVisible();
        if (!isMenuVisible && this.container.classList.contains("active")) {
            this.closePortal();
        }
    }

    startUpdateLoop() {
        if (this.updateTimeout) clearTimeout(this.updateTimeout);
        
        const isCurrentlyVisible = this.container && this.container.classList.contains("active") && this.container.classList.contains("content-active");
        if (this.activeTab === 'players' && isCurrentlyVisible && this.isMenuVisible()) {
            this.playerList.update(this.players, true);
        }
        if (isCurrentlyVisible) {
            this.updateTimeout = setTimeout(() => this.startUpdateLoop(), 2000);
        }
    }
}
