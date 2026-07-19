export default class Menu {
    constructor() {
        this.containerSelector = '._14IvnT0QqNumdupkuPJ_97';
    }

    createButton(onClick) {
        const check = setInterval(() => {
            const container = document.querySelector(this.containerSelector);
            if (container) {
                clearInterval(check);
                this.injectButton(container, onClick);
            }
        }, 1000);
    }

    injectButton(container, onClick) {
        if (container.querySelector(".tab-cytos")) return;

        const el = document.createElement("li");
        el.innerText = "C[+]";
        el.title = "Extension Settings";
        el.className = "tab fas tab-cytos cytos-btn-settings";
        el.style.fontSize = "20px";
        el.style.marginTop = "-1px";
        el.style.cursor = "pointer";
        el.onclick = onClick;
        container.appendChild(el);
    }
}
