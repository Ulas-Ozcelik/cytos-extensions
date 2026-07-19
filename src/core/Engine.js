export default class Engine {
    constructor(onFound) {
        this.onFound = onFound;
        this.engine = null;
        this.loader = null;
        this.store = null;

        window.engine = this;

        this.init();
        this.initWebpack();
    }

    get modules() {
        if (!this.loader) return {};

        const self = this;

        return new Proxy({}, {
            get(target, prop) {
                const id = parseInt(prop);
                if (!isNaN(id)) return self.loader(id);
                if (prop === 'network') return self.engine ? self.engine.an : null;
                if (prop === 'engine') return self.engine;
                if (prop === 'store') return self.store;
                return undefined;
            }
        });
    }

    init() {
        const _ = Function.prototype.bind;
        const self = this;

        const c = function (...args) {
            const obj = args[0];

            if (obj && typeof obj === 'object') {
                if (obj.al instanceof Map && typeof obj.Ls === 'function') {
                    if (!self.engine || Object.keys(obj).length > Object.keys(self.engine).length) {
                        self.engine = obj;
                        if (typeof self.onFound === "function") self.onFound(obj);
                    }
                }

                if (obj.Ma instanceof Uint8Array && obj.ze instanceof Uint16Array && typeof obj.Na === 'function') {
                    self.network = obj;
                }

                const container = obj.H1 || obj.Ct;
                if (container && container.dt && container.fl && typeof obj.ye === 'function') {
                    self.store = obj;
                    console.log("%c[Engine]%c Bind store captured successfully!", "color: #00d2ff; font-weight: bold;", "");
                }
            }
            return _.apply(this, args);
        };

        c.toString = () => "function bind() { [native code] }";
        Function.prototype.bind = c;
    }

    initWebpack() {
        const self = this;
        const originalCall = Function.prototype.call;

        Function.prototype.call = function (...args) {
            const res = originalCall.apply(this, args);
            const ib = args[3];

            if (typeof ib === 'function' && !self.loader) {
                self.loader = ib;
                Function.prototype.call = originalCall;

                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    try {
                        const storeMod = self.findModule(mod => {
                            const container = mod && (mod.H1 || mod.Ct);
                            return container && container.Jn && (Array.isArray(container.Jn.value) || Array.isArray(container.Jn));
                        });
                        if (storeMod) {
                            self.store = storeMod;
                            console.log("%c[Engine]%c Webpack store module found!", "color: #00d2ff; font-weight: bold;", "");
                            clearInterval(checkInterval);
                        } else if (attempts > 30) {
                            // If precise scan fails after 15 seconds, try fallback criteria
                            const fallbackMod = self.findModule(mod => {
                                const container = mod && (mod.H1 || mod.Ct);
                                return container && container.dt && container.fl && (container.kB || container.ye || mod.ye);
                            });
                            if (fallbackMod) {
                                self.store = fallbackMod;
                                console.log("%c[Engine]%c Webpack store module found (fallback)!", "color: #00d2ff; font-weight: bold;", "");
                                clearInterval(checkInterval);
                            }
                        }
                    } catch (e) {}
                }, 500);
            }
            
            return res;
        };

        Function.prototype.call.toString = () => "function call() { [native code] }";
    }

    findModule(pattern) {
        if (typeof this.loader !== 'function') return null;
        const ranges = [[1, 500], [1000, 10000], [20000, 40000]];
        for (const [start, end] of ranges) {
            for (let id = start; id <= end; id++) {
                try {
                    const mod = this.loader(id);
                    if (mod && pattern(mod)) return mod;
                } catch (e) { }
            }
        }
        return null;
    }
}
