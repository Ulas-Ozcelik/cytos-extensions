import App from "./core/App.js";

if (window.cytosApp) {
    try {
        window.cytosApp.destroy();
    } catch (e) {
        console.error("Failed to destroy previous cytosApp instance:", e);
    }
}
window.cytosApp = new App();
window.ext = window.cytosApp;
