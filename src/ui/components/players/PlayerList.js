export default class PlayerList {
    constructor() {
        this.players = null;
        this.lastPlayers = new Map();
        this.toastTimeout = null;
    }

    render(parent) {
        this.statsHeader = document.createElement("div");
        this.statsHeader.className = "cytos-stats-header";
        this.statsHeader.innerHTML = `
            <div class="cytos-stat-box active" style="cursor: default;">
                <span class="cytos-stat-label">Active Players</span>
                <span id="cytos-player-count" class="cytos-stat-val">0</span>
            </div>
        `;
        parent.appendChild(this.statsHeader);

        // LIST
        this.listScroll = document.createElement("div");
        this.listScroll.className = "cytos-scroll";
        parent.appendChild(this.listScroll);

        this.playerCountNode = this.statsHeader.querySelector("#cytos-player-count");

        // FOOTER
        const footer = document.createElement("div");
        footer.className = "cytos-footer";
        footer.innerHTML = `
            <span class="cytos-footer-text">Version 1.0.0</span>
        `;
        parent.appendChild(footer);
    }

    update(players, isVisible) {
        if (!isVisible) return;

        this.players = players;

        if (!this.players || !this.players.al) return;

        const activePlayers = new Map();

        this.players.al.forEach(player => {
            if (!player.ot && !player.Ui && !player.Ln) return;

            const isBot = player.xs === true;
            if (isBot) return;

            const name = player.ot || "Unnamed";
            const id = player.Ui || player.Ln;
            if (!id) return;

            const color = player.wt || "#ffffff";
            const key = `${name.toLowerCase()}_${color.toLowerCase()}`;

            if (!activePlayers.has(key)) {
                activePlayers.set(key, {
                    name: name,
                    wt: color,
                    skins: player.Ts ? [player.Ts] : [],
                    ids: [id],
                    Ui: player.Ui || null
                });
            } else {
                const existing = activePlayers.get(key);
                if (player.Ts && !existing.skins.includes(player.Ts)) {
                    existing.skins.push(player.Ts);
                }
                if (!existing.ids.includes(id)) {
                    existing.ids.push(id);
                }
                if (!existing.Ui && player.Ui) {
                    existing.Ui = player.Ui;
                }
            }
        });

        this.lastPlayers = activePlayers;

        this.renderList(activePlayers);
    }

    renderList(playerMap) {
        if (!this.listScroll) return;

        const sortByName = (a, b) => a.name.localeCompare(b.name);
        const players = Array.from(playerMap.values()).sort(sortByName);

        let html = '';

        if (players.length === 0) {
            html = `<div class="cytos-empty">No active players</div>`;
        } else {
            players.forEach(p => {
                html += this.getPlayerRowHTML(p);
            });
        }

        this.listScroll.innerHTML = html;

        if (this.playerCountNode) this.playerCountNode.textContent = players.length;

        this.bindEvents();
    }

    getPlayerRowHTML(p) {
        const color = p.wt || '#ffffff';
        const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23777777'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";
        
        let skinsHtml = "";
        if (p.skins.length === 0) {
            skinsHtml = `
                <img class="cytos-player-skin" 
                     src="${defaultAvatar}" 
                     data-skin-name=""
                     title="No custom skin" />
            `;
        } else {
            const skinsToShow = p.skins.slice(0, 2);
            skinsToShow.forEach(skinName => {
                const skinUrl = `https://cytos.io/skin/${skinName}.webp`;
                skinsHtml += `
                    <img class="cytos-player-skin" 
                         src="${skinUrl}" 
                         data-skin-name="${skinName}"
                         onerror="this.src='${defaultAvatar}'" 
                         title="Click to copy skin URL" />
                `;
            });
        }

        const badgeHtml = p.ids.length > 1 ? `<span class="cytos-multi-badge">x${p.ids.length}</span>` : '';
        const spectateHtml = p.Ui ? `<i class="fas fa-glasses cytos-spectate-btn" data-ui="${p.Ui}" title="Spectate Player"></i>` : '';
        
        return `
            <div class="cytos-item">
                <div class="cytos-player-info">
                    <div class="cytos-skins-container">
                        ${skinsHtml}
                    </div>
                    <span class="cytos-player-name" style="color:${color}" title="Click to copy nickname">
                        ${p.name}
                    </span>
                    <div class="cytos-row-actions">
                        ${badgeHtml}
                        ${spectateHtml}
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        if (!this.listScroll) return;

        const skins = this.listScroll.querySelectorAll(".cytos-player-skin");
        skins.forEach(img => {
            img.addEventListener("click", (e) => {
                e.stopPropagation();
                const skinName = img.getAttribute("data-skin-name");
                if (skinName && skinName !== "none") {
                    const skinUrl = `https://cytos.io/skin/${skinName}.webp`;
                    this.copyText(skinUrl).then(() => {
                        this.showToast("Skin URL copied!");
                    }).catch(err => {
                        console.error("Clipboard write failed:", err);
                        this.showToast("Copy failed");
                    });
                } else {
                    this.showToast("No custom skin to copy");
                }
            });
        });

        const names = this.listScroll.querySelectorAll(".cytos-player-name");
        names.forEach(nameSpan => {
            nameSpan.addEventListener("click", (e) => {
                e.stopPropagation();
                const name = nameSpan.textContent.trim();
                this.copyText(name).then(() => {
                    this.showToast(`Player name copied!`);
                }).catch(err => {
                    console.error("Clipboard write failed:", err);
                    this.showToast("Copy failed");
                });
            });
        });

        const specBtns = this.listScroll.querySelectorAll(".cytos-spectate-btn");
        specBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const uiId = btn.getAttribute("data-ui");
                if (uiId) {
                    this.spectatePlayer(uiId);
                }
            });
        });
    }

    spectatePlayer(uiId) {
        if (!window.engine) {
            this.showToast("Engine not found");
            return;
        }

        let spectateFn = null;
        let spectateCtx = null;
        let pathFound = "";

        const specModule = window.engine.findModule(mod => {
            return mod && mod.Z && mod.Z.ln && typeof mod.Z.ln._f === 'function';
        });

        if (specModule) {
            spectateFn = specModule.Z.ln._f;
            spectateCtx = specModule.Z.ln;
            pathFound = "Z.ln._f";
        } else {
            console.log("[PlayerList] Hardcoded spectate path not found, scanning webpack modules dynamically...");
            const loader = window.engine.loader;
            if (typeof loader === 'function') {
                const ranges = [[1, 500], [1000, 10000], [20000, 40000]];
                const candidates = [];
                for (const [start, end] of ranges) {
                    for (let id = start; id <= end; id++) {
                        try {
                            const mod = loader(id);
                            if (!mod) continue;

                            for (const k of Object.keys(mod)) {
                                const val = mod[k];
                                if (!val || typeof val !== 'object') continue;

                                for (const subK of Object.keys(val)) {
                                    const subVal = val[subK];
                                    if (!subVal || typeof subVal !== 'object') continue;

                                    for (const fnK of Object.keys(subVal)) {
                                        if (typeof subVal[fnK] === 'function') {
                                            const fnStr = subVal[fnK].toString();
                                            if (fnStr.includes('.Na(') || fnStr.includes('.an.Na') || fnStr.includes('writeInt32') || fnStr.includes('writeByte(') || fnStr.includes('Spectate')) {
                                                candidates.push({
                                                    fn: subVal[fnK],
                                                    ctx: subVal,
                                                    path: `${k}.${subK}.${fnK}`,
                                                    id: id
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (e) {}
                    }
                }

                if (candidates.length > 0) {
                    console.log("[PlayerList] Found spectate candidates:", candidates);
                    spectateFn = candidates[0].fn;
                    spectateCtx = candidates[0].ctx;
                    pathFound = `dynamic: ${candidates[0].path} (mod ${candidates[0].id})`;
                }
            }
        }

        if (spectateFn) {
            try {
                const parsedId = parseInt(uiId, 10);
                spectateFn.call(spectateCtx, parsedId);
                this.showToast("Spectating player...");
                console.log(`[PlayerList] Spectating player ${parsedId} via ${pathFound}`);
                this.hideGameMenu();
            } catch (err) {
                console.error("[PlayerList] Spectate failed:", err);
                this.showToast("Spectate failed");
            }
        } else {
            this.showToast("Spectate function not found");
        }
    }

    hideGameMenu() {
        if (!window.engine) return;

        const stateModule = window.engine.findModule(mod => {
            return mod && mod.H1 && mod.H1.dt && typeof mod.H1.dt.set === 'function';
        });

        if (stateModule && stateModule.H1 && stateModule.H1.dt) {
            try {
                stateModule.H1.dt.set(false);
            } catch (err) {
                console.error("Failed to close native menu:", err);
            }
        }
    }

    copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        } else {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                document.execCommand("copy");
                document.body.removeChild(textarea);
                return Promise.resolve();
            } catch (err) {
                document.body.removeChild(textarea);
                return Promise.reject(err);
            }
        }
    }

    showToast(message) {
        let toast = document.getElementById("cytos-ext-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "cytos-ext-toast";
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.className = "cytos-toast show";
        
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.className = "cytos-toast";
        }, 2000);
    }
}
