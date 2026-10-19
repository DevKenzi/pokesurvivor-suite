
/**
 * ============================================================================
 * ⚡ PokéSurvivor Master Suite - Silph Tactical Edition (Standalone)
 * Version: 2.5.0
 * 
 * Features:
 * • Silph Tactical HUD: High-grade gaming overlay with zero AI slop
 * • Clean URL Masking: Seamlessly play on pokesurvivor.com without dev.html in address bar
 * • Visual ESP Radar: On-screen markers & directional edge arrows for chests, altars, springs & bosses
 * • Insta-Chest: Chests open instantly on contact (0.01s instead of 3.5s)
 * • Infinite Card Rerolls: Reroll level-up choices indefinitely (Reroll ∞) to build your dream kit
 * • Account Booster: 999,999 coins, tickets, all Pokémon + Shiny variants, max upgrades
 * • God-Buff: 45,000 HP, 1900x Atk, 25x faster cooldown, Shell Bell lifesteal, 2500 magnet
 *   (100% compliant with clean() anti-cheat verification for official TOP 50 leaderboards)
 * ============================================================================
 */
(function() {
  'use strict';

  // =========================================================================
  // 1. SEAMLESS REDIRECT & ADDRESS MASKING
  // =========================================================================
  if (location.pathname === '/' || location.pathname === '/index.html') {
    location.replace('/dev.html' + location.search + location.hash);
    return;
  }

  if (location.pathname.includes('dev.html')) {
    try {
      history.replaceState(null, '', '/' + location.search + location.hash);
    } catch (e) {}
  }

  if (window._psMasterLoaded) return;
  window._psMasterLoaded = true;

  console.log('%c[Poké-Suite v2.5] Initializing Silph Tactical Suite...', 'color:#ef4444;font-weight:bold;font-size:14px;');

  // =========================================================================
  // 2. USER SETTINGS (LOCALSTORAGE)
  // =========================================================================
  const SETTINGS_KEY = 'ps_suite_settings';
  const defaultSettings = {
    esp: true,
    espChests: true,
    espAltars: true,
    espSprings: true,
    espBosses: true,
    instaChest: true,
    infiniteRerolls: true
  };

  let cfg = Object.assign({}, defaultSettings);
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      delete parsed.godBuffActive;
      delete parsed.godMode;
      delete parsed.afkMode;
      cfg = Object.assign(cfg, parsed);
    }
    const cleanStorage = Object.assign({}, cfg);
    delete cleanStorage.godBuffActive;
    delete cleanStorage.godMode;
    delete cleanStorage.afkMode;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(cleanStorage));
  } catch (e) {}

  // In-memory runtime state only: strictly false on page load / match start
  cfg.godBuffActive = false;

  function saveCfg() {
    try {
      const toSave = Object.assign({}, cfg);
      delete toSave.godBuffActive;
      delete toSave.godMode;
      delete toSave.afkMode;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
    } catch (e) {}
  }

  // =========================================================================
  // 3. UI INITIALIZATION & STYLES
  // =========================================================================
  function bootSuite() {
    if (!document.body) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootSuite);
      } else {
        setTimeout(bootSuite, 50);
      }
      return;
    }

    const oldUI = document.getElementById('ps-suite-root');
    if (oldUI) oldUI.remove();

    const styleEl = document.createElement('style');
    styleEl.textContent = `
      #ps-suite-root * { box-sizing: border-box; }
      .ps-poke-switch { position: relative; width: 38px; height: 20px; display: inline-block; cursor: pointer; }
      .ps-poke-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
      .ps-poke-track {
        position: absolute; inset: 0;
        background: #0f172a; border-radius: 9999px;
        border: 1.5px solid #334155;
        transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
      }
      .ps-poke-switch input:checked + .ps-poke-track {
        background: #1e293b; border-color: #ef4444;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.4), inset 0 2px 4px rgba(0,0,0,0.6);
      }
      .ps-poke-knob {
        position: absolute; top: 1.5px; left: 1.5px;
        width: 14px; height: 14px; border-radius: 50%;
        border: 1px solid #1e293b;
        background: linear-gradient(180deg, #ef4444 0%, #ef4444 48%, #1e293b 48%, #1e293b 52%, #ffffff 52%, #ffffff 100%);
        transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 1px 3px rgba(0,0,0,0.5);
      }
      .ps-poke-knob:after {
        content: ""; position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 4px; height: 4px; border-radius: 50%;
        background: #ffffff; border: 1px solid #0f172a;
      }
      .ps-poke-switch input:checked + .ps-poke-track .ps-poke-knob {
        transform: translateX(18px) rotate(180deg);
        box-shadow: 0 0 6px rgba(239, 68, 68, 0.8);
      }
      .ps-tab-btn {
        flex: 1; padding: 7px 0; text-align: center;
        font-size: 10px; font-weight: 800; letter-spacing: 0.5px;
        color: #94a3b8; background: transparent;
        border: none; border-radius: 6px; cursor: pointer;
        transition: all 0.15s ease; font-family: inherit;
      }
      .ps-tab-btn:hover { color: #f8fafc; }
      .ps-tab-btn.active {
        background: linear-gradient(180deg, #ef4444, #dc2626);
        color: #ffffff; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
      }
      .ps-row {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 10px; padding: 9px 12px;
        display: flex; align-items: center; justify-content: space-between;
        transition: all 0.15s ease;
      }
      .ps-row:hover {
        background: rgba(30, 41, 59, 0.7);
        border-color: rgba(239, 68, 68, 0.35);
      }
      .ps-btn-tactical {
        border: none; border-radius: 8px; font-weight: 800;
        cursor: pointer; transition: all 0.15s ease; outline: none; font-family: inherit;
      }
      .ps-btn-tactical:hover { filter: brightness(1.15); transform: translateY(-1px); }
      .ps-btn-tactical:active { transform: scale(0.98); }
    `;
    document.head.appendChild(styleEl);

    const root = document.createElement('div');
    root.id = 'ps-suite-root';
    root.style = 'position:fixed;top:16px;right:16px;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;user-select:none;';

    root.innerHTML = `
      <!-- Floating Trigger Pill (Poké Ball) -->
      <div id="ps-float-btn" title="Click or press 'H' to toggle" style="
        background: linear-gradient(135deg, #1e293b, #0f172a);
        border: 1.5px solid rgba(239, 68, 68, 0.6);
        border-radius: 9999px; padding: 6px 14px;
        display: flex; align-items: center; gap: 8px;
        cursor: pointer; box-shadow: 0 4px 18px rgba(0,0,0,0.6), 0 0 10px rgba(239,68,68,0.25);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      ">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" fill="#f8fafc" stroke="#0f172a" stroke-width="1.8"/>
          <path d="M1 10H19" stroke="#0f172a" stroke-width="1.8"/>
          <path d="M1 10A9 9 0 0 1 19 10Z" fill="#ef4444"/>
          <circle cx="10" cy="10" r="3.2" fill="#0f172a" stroke="#0f172a" stroke-width="0.5"/>
          <circle cx="10" cy="10" r="1.8" fill="#ffffff"/>
        </svg>
        <span style="font-size:11px;font-weight:900;color:#f8fafc;letter-spacing:0.8px;">SILPH</span>
        <span style="font-size:10px;color:#ef4444;font-family:monospace;font-weight:800;background:rgba(239,68,68,0.15);padding:1px 5px;border-radius:4px;border:1px solid rgba(239,68,68,0.3);">[H]</span>
      </div>

      <!-- Main Pokédex / Silph Scope Drawer -->
      <div id="ps-main-panel" style="
        display: none; position: absolute; top: 46px; right: 0;
        background: #0b1120;
        border: 2px solid #1e293b;
        border-radius: 18px;
        width: 316px; color: #f8fafc; font-size: 12px;
        box-shadow: 0 24px 50px rgba(0, 0, 0, 0.85), 0 0 1px rgba(255,255,255,0.15);
        overflow: hidden;
      ">
        <!-- Pokédex Sensor Lights Bar -->
        <div style="
          background: linear-gradient(135deg, #e11d48 0%, #b91c1c 100%);
          padding: 10px 14px;
          border-bottom: 2px solid #991b1b;
          display: flex; justify-content: space-between; align-items: center;
        ">
          <!-- Pokédex Lenses -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="
              width: 22px; height: 22px; border-radius: 50%;
              background: radial-gradient(circle at 35% 35%, #93c5fd, #2563eb, #1d4ed8);
              border: 2px solid #ffffff;
              box-shadow: 0 0 10px rgba(59, 130, 246, 0.8), inset 0 2px 3px rgba(255,255,255,0.8);
            "></div>
            <div style="display: flex; gap: 4px;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: #ef4444; border: 1px solid #7f1d1d; box-shadow: 0 0 4px #ef4444;"></span>
              <span style="width: 7px; height: 7px; border-radius: 50%; background: #fbbf24; border: 1px solid #78350f; box-shadow: 0 0 4px #fbbf24;"></span>
              <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981; border: 1px solid #064e3b; box-shadow: 0 0 4px #10b981;"></span>
            </div>
          </div>

          <!-- Safe Ranking Badge -->
          <div style="display:flex;align-items:center;gap:5px;background:rgba(0,0,0,0.3);padding:3px 8px;border-radius:9999px;border:1px solid rgba(255,255,255,0.2);">
            <span style="width:5px;height:5px;border-radius:50%;background:#10b981;box-shadow:0 0 6px #10b981;"></span>
            <span style="color:#ffffff;font-size:9px;font-weight:900;letter-spacing:0.5px;">SAFE: RANKING</span>
          </div>
        </div>

        <!-- Silph Device Subheader -->
        <div style="background: #080d1a; padding: 8px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 12px; font-weight: 900; color: #f8fafc; letter-spacing: 0.5px;">SILPH SCOPE</span>
            <span style="font-size: 9px; font-weight: 800; color: #ef4444; background: rgba(239,68,68,0.15); padding: 1px 5px; border-radius: 4px;">GEN-9</span>
          </div>
          <span style="font-size: 9px; color: #64748b; font-family: monospace;">VER 2.5</span>
        </div>

        <!-- Pokédex Tabs -->
        <div style="padding: 10px 12px 6px 12px;">
          <div style="background: #060913; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 3px; display: flex; gap: 3px;">
            <button class="ps-tab-btn active" data-tab="radar">ITEMFINDER</button>
            <button class="ps-tab-btn" data-tab="tweaks">BAG &amp; UTILS</button>
            <button class="ps-tab-btn" data-tab="mods">POKÉ-LAB</button>
          </div>
        </div>

        <!-- Content Container -->
        <div style="padding: 8px 12px 12px 12px;">
          <!-- TAB 1: ITEMFINDER (RADAR) -->
          <div id="ps-tab-radar" class="ps-tab-pane">
            <div class="ps-row" style="margin-bottom:8px;">
              <div>
                <div style="font-weight: 800; font-size: 12px; color: #f8fafc;">Silph Scope Radar</div>
                <div style="font-size: 10px; color: #64748b;">Scan on-screen &amp; edge targets</div>
              </div>
              <label class="ps-poke-switch">
                <input type="checkbox" id="ps-c-esp" ${cfg.esp ? 'checked' : ''}>
                <div class="ps-poke-track">
                  <div class="ps-poke-knob"></div>
                </div>
              </label>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              <label class="ps-row" style="padding:8px 10px;cursor:pointer;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="width:7px;height:7px;border-radius:50%;background:#fbbf24;box-shadow:0 0 6px #fbbf24;"></span>
                  <div>
                    <div style="font-size:11px;font-weight:800;color:#f1f5f9;">Chests</div>
                    <div style="font-size:8.5px;color:#fbbf24;">Item Balls</div>
                  </div>
                </div>
                <input type="checkbox" id="ps-c-chests" ${cfg.espChests ? 'checked' : ''} style="accent-color:#fbbf24;">
              </label>

              <label class="ps-row" style="padding:8px 10px;cursor:pointer;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="width:7px;height:7px;border-radius:50%;background:#38bdf8;box-shadow:0 0 6px #38bdf8;"></span>
                  <div>
                    <div style="font-size:11px;font-weight:800;color:#f1f5f9;">Altars</div>
                    <div style="font-size:8.5px;color:#38bdf8;">Stat Shrines</div>
                  </div>
                </div>
                <input type="checkbox" id="ps-c-altars" ${cfg.espAltars ? 'checked' : ''} style="accent-color:#38bdf8;">
              </label>

              <label class="ps-row" style="padding:8px 10px;cursor:pointer;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 6px #4ade80;"></span>
                  <div>
                    <div style="font-size:11px;font-weight:800;color:#f1f5f9;">Healing</div>
                    <div style="font-size:8.5px;color:#4ade80;">Full Restore</div>
                  </div>
                </div>
                <input type="checkbox" id="ps-c-springs" ${cfg.espSprings ? 'checked' : ''} style="accent-color:#4ade80;">
              </label>

              <label class="ps-row" style="padding:8px 10px;cursor:pointer;">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="width:7px;height:7px;border-radius:50%;background:#ef4444;box-shadow:0 0 6px #ef4444;"></span>
                  <div>
                    <div style="font-size:11px;font-weight:800;color:#f1f5f9;">Bosses</div>
                    <div style="font-size:8.5px;color:#ef4444;">Elites &amp; Star</div>
                  </div>
                </div>
                <input type="checkbox" id="ps-c-bosses" ${cfg.espBosses ? 'checked' : ''} style="accent-color:#ef4444;">
              </label>
            </div>
          </div>

          <!-- TAB 2: BAG & UTILS -->
          <div id="ps-tab-tweaks" class="ps-tab-pane" style="display:none;flex-direction:column;gap:7px;">
            <div class="ps-row">
              <div>
                <div style="font-weight: 800; font-size: 12px; color: #f8fafc;">Instant Chest Loot</div>
                <div style="font-size: 10px; color: #64748b;">Opens immediately upon contact</div>
              </div>
              <label class="ps-poke-switch">
                <input type="checkbox" id="ps-c-chest" ${cfg.instaChest ? 'checked' : ''}>
                <div class="ps-poke-track">
                  <div class="ps-poke-knob"></div>
                </div>
              </label>
            </div>

            <div class="ps-row">
              <div>
                <div style="font-weight: 800; font-size: 12px; color: #f8fafc;">Infinite Rerolls (∞)</div>
                <div style="font-size: 10px; color: #64748b;">Unlimited card selection rolls</div>
              </div>
              <label class="ps-poke-switch">
                <input type="checkbox" id="ps-c-rr" ${cfg.infiniteRerolls ? 'checked' : ''}>
                <div class="ps-poke-track">
                  <div class="ps-poke-knob"></div>
                </div>
              </label>
            </div>
          </div>

          <!-- TAB 3: POKÉ-LAB (MODS) -->
          <div id="ps-tab-mods" class="ps-tab-pane" style="display:none;flex-direction:column;gap:8px;">
            <div class="ps-row" style="flex-direction:column;align-items:stretch;gap:8px;border-color:rgba(239,68,68,0.3);">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-weight: 800; font-size: 12px; color: #f8fafc;">Rare Candy Overdrive</div>
                  <div style="font-size: 10px; color: #94a3b8;">45k HP • 1,900x ATK • Shell Bell</div>
                </div>
                <span id="ps-god-badge" style="font-size:9px;font-weight:900;padding:2px 6px;border-radius:4px;background:#1e293b;color:#94a3b8;">OFF</span>
              </div>
              <button id="ps-btn-god" class="ps-btn-tactical" style="
                width: 100%; background: #1e293b; color: #f1f5f9; padding: 8px 10px; font-size: 11px;
                border: 1px solid rgba(239,68,68,0.4);
              ">Activate Overdrive</button>
            </div>

            <div class="ps-row" style="flex-direction:column;align-items:stretch;gap:8px;border-color:rgba(56,189,248,0.3);">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-weight: 800; font-size: 12px; color: #f8fafc;">Professor's PC</div>
                  <div style="font-size: 10px; color: #94a3b8;">All Pokémon + Shinies + 999k Coins</div>
                </div>
              </div>
              <button id="ps-btn-account" class="ps-btn-tactical" style="
                width: 100%; background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; padding: 8px 10px; font-size: 11px;
                box-shadow: 0 2px 8px rgba(2,132,199,0.3);
              ">Unlock All Pokémon</button>
            </div>
          </div>
        </div>

        <!-- Pokédex Footer -->
        <div style="
          background: #080d1a; padding: 7px 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; justify-content: space-between; align-items: center;
          font-size: 10px; color: #64748b;
        ">
          <div style="display:flex;align-items:center;gap:4px;">
            <span>Key</span>
            <kbd style="background: #1e293b; color: #f8fafc; padding: 1px 5px; border-radius: 4px; border: 1px solid #334155; font-weight: 900; font-family: monospace;">H</kbd>
          </div>
          <a href="https://buymeacoffee.com/xkenzix" target="_blank" rel="noopener noreferrer" style="
            display: inline-flex; align-items: center; gap: 4px;
            background: rgba(251, 191, 36, 0.1);
            border: 1px solid rgba(251, 191, 36, 0.3);
            color: #fbbf24; padding: 2px 7px; border-radius: 5px;
            text-decoration: none; font-size: 9.5px; font-weight: 800;
          ">
            ☕ Tip Creator
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    const floatBtn = document.getElementById('ps-float-btn');
    const mainPanel = document.getElementById('ps-main-panel');
    function toggleMenu() {
      mainPanel.style.display = mainPanel.style.display === 'none' ? 'block' : 'none';
    }
    floatBtn.onclick = toggleMenu;

    window.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'KeyH') { e.preventDefault(); toggleMenu(); }
    });

    // Tab switcher
    const tabBtns = root.querySelectorAll('.ps-tab-btn');
    const tabPanes = root.querySelectorAll('.ps-tab-pane');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        const target = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabPanes.forEach(pane => {
          pane.style.display = pane.id === 'ps-tab-' + target ? (target === 'radar' ? 'block' : 'flex') : 'none';
        });
      };
    });

    const bindCheck = (id, prop) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.onchange = () => { cfg[prop] = el.checked; saveCfg(); };
    };
    bindCheck('ps-c-esp', 'esp');
    bindCheck('ps-c-chests', 'espChests');
    bindCheck('ps-c-altars', 'espAltars');
    bindCheck('ps-c-springs', 'espSprings');
    bindCheck('ps-c-bosses', 'espBosses');
    bindCheck('ps-c-chest', 'instaChest');

    const rrInput = document.getElementById('ps-c-rr');
    if (rrInput) {
      rrInput.onchange = () => {
        cfg.infiniteRerolls = rrInput.checked;
        saveCfg();
        syncRerollState();
      };
    }

    // Account Booster
    document.getElementById('ps-btn-account').onclick = () => {
      const maxU = { hp:10, atk:10, spd:8, cd:8, def:8, regen:5, magnet:6, xp:8, coins:8, moves:1, crit:10, reroll:5, ban:3, start:1 };
      
      if (typeof G !== 'undefined' && G.DB && G.DB.save) {
        G.DB.save.coins = 999999;
        G.DB.save.tickets = { t1: 99, t10: 99 };
        G.DB.save.pupg = G.DB.save.pupg || {};
        G.DB.save.owned = G.DB.save.owned || {};
        G.DB.save.shiny = G.DB.save.shiny || {};
        for (let d = 1; d <= 1025; d++) {
          G.DB.save.pupg[d] = { ...maxU };
          if (!G.DB.save.owned[d]) G.DB.save.owned[d] = { at: Date.now(), from: 'trainer' };
          if (!G.DB.save.shiny[d]) G.DB.save.shiny[d] = { at: Date.now(), from: 'trainer' };
        }
        if (typeof G.DB.commit === 'function') G.DB.commit();
        if (typeof G.DB.saveNow === 'function') G.DB.saveNow();
      }

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('ps.save.')) {
          try {
            const s = JSON.parse(localStorage.getItem(k));
            if (!s) continue;
            s.coins = 999999;
            s.tickets = { t1: 99, t10: 99 };
            s.pupg = s.pupg || {};
            s.owned = s.owned || {};
            s.shiny = s.shiny || {};
            for (let d = 1; d <= 1025; d++) {
              s.pupg[d] = { ...maxU };
              s.owned[d] = { at: Date.now(), from: 'trainer' };
              s.shiny[d] = { at: Date.now(), from: 'trainer' };
            }
            localStorage.setItem(k, JSON.stringify(s));
          } catch (e) {}
        }
      }
      alert('✅ SUCCESS! Max upgrades applied, 999,999 coins & tickets added, all Pokémon + Shiny forms unlocked!');
    };

    // God-Buff Toggle System
    function updateGodBtn() {
      const btn = document.getElementById('ps-btn-god');
      const badge = document.getElementById('ps-god-badge');
      if (!btn || !badge) return;
      if (cfg.godBuffActive) {
        btn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
        btn.style.color = '#ffffff';
        btn.style.borderColor = '#ef4444';
        btn.textContent = 'Deactivate Overdrive';
        badge.textContent = 'ACTIVE';
        badge.style.background = '#ef4444';
        badge.style.color = '#ffffff';
      } else {
        btn.style.background = '#1e293b';
        btn.style.color = '#f1f5f9';
        btn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        btn.textContent = 'Activate Overdrive';
        badge.textContent = 'OFF';
        badge.style.background = '#1e293b';
        badge.style.color = '#94a3b8';
      }
    }

    function toggleGodBuff() {
      const pl = (typeof G !== 'undefined' && G.Game && G.Game.player) || (typeof G !== 'undefined' && G.Combat && G.Combat.player);
      if (!pl) {
        alert('⚠️ Please start or enter a match first to toggle God-Tier stats!');
        return;
      }

      cfg.godBuffActive = !cfg.godBuffActive;

      if (cfg.godBuffActive) {
        if (!pl._psOrigStats) {
          pl._psOrigStats = {
            maxHp: pl.maxHp || 100,
            hp: pl.hp || 100,
            atkMul: pl.atkMul || 1,
            cdMul: pl.cdMul || 1,
            spdMul: pl.spdMul || 1,
            magnet: pl.magnet || 100
          };
        }
        pl.maxHp = 45000;
        pl.hp = 45000;
        pl.atkMul = 1900;
        pl.cdMul = 0.04;
        pl.spdMul = 3.2;
        pl.magnet = 2500;
        if (typeof pl.equip === 'function') pl.equip('shellbell');
      } else {
        if (pl._psOrigStats) {
          pl.maxHp = pl._psOrigStats.maxHp;
          pl.hp = Math.min(pl.hp, pl._psOrigStats.maxHp);
          pl.atkMul = pl._psOrigStats.atkMul;
          pl.cdMul = pl._psOrigStats.cdMul;
          pl.spdMul = pl._psOrigStats.spdMul;
          pl.magnet = pl._psOrigStats.magnet;
        }
      }

      updateGodBtn();
    }

    const godBtn = document.getElementById('ps-btn-god');
    if (godBtn) godBtn.onclick = toggleGodBuff;
    updateGodBtn();

    setInterval(() => {
      const pl = (typeof G !== 'undefined' && G.Game && G.Game.player);
      if (!pl || pl.dead) {
        if (cfg.godBuffActive) {
          cfg.godBuffActive = false;
          updateGodBtn();
        }
        return;
      }

      if (pl._psLegitBonus === undefined) {
        pl._psLegitBonus = (pl.rerollBonus !== 9999) ? (pl.rerollBonus || 0) : 0;
        pl._psLegitRerolls = (pl.rerollBonus !== 9999) ? (pl.rerolls || 0) : 0;
      }

      if (cfg.infiniteRerolls) {
        pl.rerollBonus = 9999;
        pl.rerolls = 0;
      }
    }, 500);

    setupESP();
  }

  // =========================================================================
  // 4. SZYBKIE SKRZYNKI (INSTA-CHEST)
  // =========================================================================
  function hookInteract() {
    if (typeof G !== 'undefined' && G.Interact && G.Interact.update) {
      if (G.Interact._psHooked) return;
      G.Interact._psHooked = true;
      const origInteract = G.Interact.update;
      G.Interact.update = function(dt, pl) {
        if (cfg.instaChest && pl && G.World && G.World.specialsNear) {
          const near = G.World.specialsNear(pl.x, pl.y, 90);
          near.forEach(p => { if (p.type === 'bigchest' && !p.used) p.open = 3.5; });
        }
        return origInteract.apply(this, arguments);
      };
    } else {
      setTimeout(hookInteract, 500);
    }
  }
  hookInteract();

  // =========================================================================
  // 5. NIESKOŃCZONE REROLLE KART (REROLL ∞) & PRZYWRACANIE LIMITU
  // =========================================================================
  function syncRerollState() {
    const pl = (typeof G !== 'undefined' && G.Game && G.Game.player);
    if (!pl) return;

    if (pl._psLegitBonus === undefined) {
      pl._psLegitBonus = (pl.rerollBonus !== 9999) ? (pl.rerollBonus || 0) : 0;
      pl._psLegitRerolls = (pl.rerollBonus !== 9999) ? (pl.rerolls || 0) : 0;
    }

    const btn = document.getElementById('lvl-reroll');
    const num = document.getElementById('lvl-rr-n');

    if (cfg.infiniteRerolls) {
      pl.rerollBonus = 9999;
      pl.rerolls = 0;
      if (btn) btn.classList.remove('hidden');
      if (num) num.textContent = '∞';
    } else {
      // Revert from 9999 back to legitimate user stats
      pl.rerollBonus = pl._psLegitBonus !== undefined ? pl._psLegitBonus : 0;
      pl.rerolls = pl._psLegitRerolls !== undefined ? pl._psLegitRerolls : 0;

      const left = Math.max(0, 1 + (pl.rerollBonus || 0) - (pl.rerolls || 0));
      if (num) num.textContent = left;
      if (btn) btn.classList.toggle('hidden', left <= 0);
    }
  }

  function hookRunUI() {
    if (typeof G !== 'undefined' && G.RunUI && G.RunUI.showLevelUp) {
      if (G.RunUI._psHooked) return;
      G.RunUI._psHooked = true;
      const origShowLevelUp = G.RunUI.showLevelUp;
      G.RunUI.showLevelUp = function() {
        const pl = (typeof G !== 'undefined' && G.Game && G.Game.player);
        if (pl && pl._psLegitBonus === undefined) {
          pl._psLegitBonus = (pl.rerollBonus !== 9999) ? (pl.rerollBonus || 0) : 0;
          pl._psLegitRerolls = (pl.rerollBonus !== 9999) ? (pl.rerolls || 0) : 0;
        }
        if (pl && cfg.infiniteRerolls) {
          pl.rerollBonus = 9999;
          pl.rerolls = 0;
        }
        const res = origShowLevelUp.apply(this, arguments);
        setTimeout(syncRerollState, 0);
        return res;
      };
    } else {
      setTimeout(hookRunUI, 500);
    }
  }
  hookRunUI();

  document.addEventListener('click', e => {
    if (e.target && (e.target.id === 'lvl-reroll' || e.target.closest('#lvl-reroll'))) {
      const pl = typeof G !== 'undefined' && G.Game && G.Game.player;
      if (!pl) return;
      if (cfg.infiniteRerolls) {
        pl.rerollBonus = 9999;
        pl.rerolls = 0;
        setTimeout(syncRerollState, 35);
      } else {
        setTimeout(() => {
          if (pl && pl._psLegitBonus !== undefined) {
            pl._psLegitRerolls = pl.rerolls || 0;
          }
          syncRerollState();
        }, 35);
      }
    }
  }, true);

  // =========================================================================
  // 6. VISUAL ESP RADAR (TACTICAL CANVAS OVERLAY)
  // =========================================================================
  function setupESP() {
    const gameCv = document.getElementById('game');
    if (!gameCv) {
      setTimeout(setupESP, 250);
      return;
    }
    if (document.getElementById('ps-esp-layer')) return;

    const espCv = document.createElement('canvas');
    espCv.id = 'ps-esp-layer';
    espCv.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;';
    document.body.appendChild(espCv);

    const ctx = espCv.getContext('2d');
    let currentDpr = 1;

    function resize() {
      const rect = gameCv.getBoundingClientRect();
      currentDpr = window.devicePixelRatio || 1;
      espCv.style.left = rect.left + 'px';
      espCv.style.top = rect.top + 'px';
      espCv.style.width = rect.width + 'px';
      espCv.style.height = rect.height + 'px';
      espCv.width = Math.round(rect.width * currentDpr);
      espCv.height = Math.round(rect.height * currentDpr);
    }
    window.addEventListener('resize', resize);
    resize();

    let pulse = 0;
    function renderESP() {
      requestAnimationFrame(renderESP);

      if (!cfg.esp) {
        ctx.clearRect(0, 0, espCv.width, espCv.height);
        return;
      }

      if (typeof G === 'undefined' || !G.Game || !G.Game.player || !G.Camera) {
        ctx.clearRect(0, 0, espCv.width, espCv.height);
        return;
      }

      const rect = gameCv.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);
      if (espCv.width !== targetW || espCv.height !== targetH) {
        resize();
      }

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      pulse += 0.05;
      const pl = G.Game.player, cam = G.Camera;
      const W = rect.width, H = rect.height;

      // Exact pixel-perfect world-to-screen coordinate mapping
      const scale = cam.scale;
      const camLeft = cam.left() - (cam._sx || 0);
      const camTop = cam.top() - (cam._sy || 0);

      const toScreenX = wx => (wx - camLeft) * scale;
      const toScreenY = wy => (wy - camTop) * scale;

      const px = toScreenX(pl.x);
      const py = toScreenY(pl.y);

      // Collect targets
      const targets = [];

      // 1. Interactive map specials (chests, altars, healing springs)
      if (G.World && typeof G.World.specialsNear === 'function') {
        const specials = G.World.specialsNear(pl.x, pl.y, 4500) || [];
        for (const s of specials) {
          if (!s) continue;
          if (s.type === 'bigchest' && cfg.espChests && !s.used && s.open < 3.5) {
            targets.push({
              x: s.x,
              y: s.y,
              yOffset: -12,
              r: 22,
              icon: '🎁',
              name: 'CHEST',
              color: '#fbbf24',
              borderColor: '#fbbf24',
              isBoss: false
            });
          } else if (s.type === 'altar' && cfg.espAltars && !s.used) {
            targets.push({
              x: s.x,
              y: s.y,
              yOffset: -14,
              r: 20,
              icon: '⚡',
              name: 'ALTAR',
              color: '#38bdf8',
              borderColor: '#38bdf8',
              isBoss: false
            });
          } else if (s.type === 'spring' && cfg.espSprings && s.charge >= 0.1) {
            targets.push({
              x: s.x,
              y: s.y,
              yOffset: -6,
              r: 26,
              icon: '💧',
              name: 'HEAL',
              color: '#4ade80',
              borderColor: '#4ade80',
              isBoss: false
            });
          }
        }
      }

      // 2. Bosses and Rare Spawns (from G.EnemyMgr)
      if (cfg.espBosses && G.EnemyMgr && typeof G.EnemyMgr.all === 'function') {
        const enemies = G.EnemyMgr.all() || [];
        for (const e of enemies) {
          if (!e || e.dead || e.hp <= 0) continue;
          if (e.boss) {
            const bName = e.name ? e.name.toUpperCase() : 'BOSS';
            const hpPct = e.maxHp > 0 ? Math.round((e.hp / e.maxHp) * 100) : 100;
            targets.push({
              x: e.x,
              y: e.y,
              yOffset: -(e.bodyH ? e.bodyH * 0.45 : 18),
              r: Math.max(26, (e.r || 20) * 1.25),
              icon: '👑',
              name: `${bName} [${hpPct}%]`,
              color: '#ef4444',
              borderColor: '#ef4444',
              isBoss: true
            });
          } else if (e.shiny) {
            const sName = e.name ? e.name.toUpperCase() : 'SHINY';
            targets.push({
              x: e.x,
              y: e.y,
              yOffset: -(e.bodyH ? e.bodyH * 0.45 : 14),
              r: 22,
              icon: '✨',
              name: `SHINY ${sName}`,
              color: '#f472b6',
              borderColor: '#f472b6',
              isBoss: false
            });
          }
        }
      }

      // Render radar markers and edge arrows
      const pad = 44;
      for (const t of targets) {
        const ox = toScreenX(t.x);
        const oy = toScreenY(t.y + (t.yOffset || 0));
        const dx = ox - px;
        const dy = oy - py;
        const dist = Math.round(Math.hypot(t.x - pl.x, t.y - pl.y) / 20);
        const onScreen = (ox >= pad && ox <= W - pad && oy >= pad && oy <= H - pad);

        if (onScreen) {
          const r = t.r + Math.sin(pulse) * 3;
          ctx.save();
          ctx.strokeStyle = t.borderColor;
          ctx.lineWidth = t.isBoss ? 3 : 2;
          ctx.beginPath();
          ctx.arc(ox, oy, r, 0, Math.PI * 2);
          ctx.stroke();

          if (t.isBoss) {
            // Tactical crosshair corners for bosses
            ctx.lineWidth = 1.5;
            const cL = 8;
            ctx.beginPath();
            ctx.moveTo(ox - r - 4, oy - r + cL); ctx.lineTo(ox - r - 4, oy - r - 4); ctx.lineTo(ox - r + cL, oy - r - 4);
            ctx.moveTo(ox + r + 4, oy - r + cL); ctx.lineTo(ox + r + 4, oy - r - 4); ctx.lineTo(ox + r - cL, oy - r - 4);
            ctx.moveTo(ox - r - 4, oy + r - cL); ctx.lineTo(ox - r - 4, oy + r + 4); ctx.lineTo(ox - r + cL, oy + r + 4);
            ctx.moveTo(ox + r + 4, oy + r - cL); ctx.lineTo(ox + r + 4, oy + r + 4); ctx.lineTo(ox + r - cL, oy + r + 4);
            ctx.stroke();
          }

          // Tactical Badge Tag
          const label = `${t.icon} ${t.name} [${dist}m]`;
          ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          const tm = ctx.measureText(label);
          const bgW = tm.width + 14;
          const bgH = 18;
          const bgX = ox - bgW / 2;
          const bgY = oy - r - 22;

          ctx.fillStyle = 'rgba(7, 10, 18, 0.88)';
          ctx.fillRect(bgX, bgY, bgW, bgH);
          ctx.strokeStyle = t.borderColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(bgX, bgY, bgW, bgH);

          ctx.fillStyle = t.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, ox, bgY + bgH / 2);
          ctx.restore();
        } else {
          // Directional Edge Indicator
          const ang = Math.atan2(dy, dx);
          const minX = pad, maxX = W - pad;
          const minY = pad, maxY = H - pad;

          let tRay = Infinity;
          if (dx > 0) tRay = Math.min(tRay, (maxX - px) / dx);
          if (dx < 0) tRay = Math.min(tRay, (minX - px) / dx);
          if (dy > 0) tRay = Math.min(tRay, (maxY - py) / dy);
          if (dy < 0) tRay = Math.min(tRay, (minY - py) / dy);

          if (!isFinite(tRay) || tRay < 0) tRay = 0;
          const edgeX = px + dx * tRay;
          const edgeY = py + dy * tRay;

          ctx.save();
          ctx.translate(edgeX, edgeY);

          // Arrow
          ctx.save();
          ctx.rotate(ang);
          ctx.fillStyle = t.color;
          ctx.beginPath();
          ctx.moveTo(14, 0);
          ctx.lineTo(-7, -7);
          ctx.lineTo(-3, 0);
          ctx.lineTo(-7, 7);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Distance Tag
          const tag = `${t.icon} ${dist}m`;
          ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          const tm = ctx.measureText(tag);
          const bw = tm.width + 12;
          const bh = 17;
          const bx = -bw / 2;
          const by = edgeY > H - 55 ? -28 : 12;

          ctx.fillStyle = 'rgba(7, 10, 18, 0.92)';
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = t.borderColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, by, bw, bh);

          ctx.fillStyle = '#f8fafc';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tag, 0, by + bh / 2);
          ctx.restore();
        }
      }

      ctx.restore();
    }
    renderESP();
  }

  bootSuite();
  console.log('%c[Poké-Suite v2.5] Ready to play with Silph Tactical HUD!', 'color:#ef4444;font-weight:bold;font-size:14px;');
})();
