import Icon from "./icons.js";

export default class Sidebar {
    constructor(onTabChange) {
        this.onTabChange = onTabChange;
        this.icon = new Icon();
        this.tabs = [
            { id: 'players', icon: this.icon.getIcon('players'), label: "Players" },
            { id: 'nameSettings', icon: this.icon.getIcon('nameSettings'), label: "Name Customizer" },
            { id: 'themeSettings', icon: this.icon.getIcon('themeSettings'), label: "Visual Theme" },
            { id: 'generalSettings', icon: this.icon.getIcon('generalSettings'), label: "General Settings" },
        ];
        this.activeTab = 'players';
    }

    render(parent) {
        this.container = document.createElement("div");
        this.container.className = "cytos-sidebar";

        this.tabs.forEach(tab => {
            const btn = document.createElement("button");
            btn.className = `cytos-tab-btn ${tab.id === this.activeTab ? 'active' : ''}`;
            btn.innerHTML = tab.icon;
            btn.title = tab.label;
            btn.dataset.id = tab.id;
            btn.onclick = () => this.switchTab(tab.id, btn);
            this.container.appendChild(btn);
        });

        parent.appendChild(this.container);
    }

    switchTabDirectly(tabId) {
        if (!this.container) return;
        const btn = this.container.querySelector(`.cytos-tab-btn[data-id="${tabId}"]`);
        if (btn) {
            this.container.querySelectorAll('.cytos-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.activeTab = tabId;
        }
    }

    switchTab(tabId, btn) {
        if (this.activeTab === tabId) return;

        this.container.querySelectorAll('.cytos-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.activeTab = tabId;
        if (this.onTabChange) this.onTabChange(tabId);
    }
}
