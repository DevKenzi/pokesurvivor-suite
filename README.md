# PokéSurvivor Master Suite (Silph Tactical Edition)

> Advanced client-side tactical HUD, reverse-engineered engine patches, and official Firebase Leaderboard compliance for [PokéSurvivor](https://pokesurvivor.com).  
> Built with zero frameworks, zero dependencies, and 100% pure ASCII JavaScript.

![License](https://img.shields.io/badge/License-GPLv3-blue.svg)
![Version](https://img.shields.io/badge/Version-2.9.0-emerald.svg)
![Platform](https://img.shields.io/badge/Platform-Tampermonkey%20%7C%20Violentmonkey-orange.svg)
[![Discord](https://img.shields.io/badge/Discord-_kenzi_04-5865F2?logo=discord&logoColor=white)](https://discord.com)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Donate-yellow.svg?logo=buy-me-a-coffee)](https://buymeacoffee.com/xkenzix)
![Design System](https://img.shields.io/badge/UI-Silph%20Tactical-red.svg)

---

## ⚡ Architecture & Reverse-Engineering Overview

PokéSurvivor runs its physics, combat, and match loop entirely client-side, communicating with Google Cloud Firestore for player profiles, saves, and global leaderboards.

When designing modifications, naive approaches (such as `Infinity` health, speed multipliers $> 1$, or raw memory edits) result in silent drops: the game completes locally, but scores are rejected by either the client-side validation gate (`clean()`) or server-side security rules (`firestore.rules`).

The **Silph Tactical Suite** is built around full protocol compliance: every feature operates precisely within the mathematical boundaries enforced by the game engine and Google Cloud Firestore.

---

## 🛠️ Modules Breakdown: What They Do & Why

### 1. 🛰️ Tactical Visual ESP (Radar Overlay)
* **What it does:**  
  Renders a high-performance 2D Canvas radar overlay displaying on-screen reticles and directional edge arrows with exact distance tags (in meters) for:
  * 🎁 **Chests:** Golden indicators pointing to rare reward chests.
  * ⚡ **Stat Altars:** Cyan markers indicating shrines (2x DMG, Haste, Magnetism).
  * 💧 **Healing Springs:** Emerald markers pointing to HP recovery wells.
  * 👑 **Bosses & Shinies:** High-threat red crosshair reticles with HP percentages (`[BOSS SLAKING [85%] [14m]]`) and pink markers for rare Shiny spawns.
* **Why this implementation:**  
  * The vanilla game map spans thousands of pixels in all directions. Wandering randomly wastes crucial early-game leveling time.
  * Unlike primitive scripts that only scan `G.World.specialsNear` (which only returns static map objects), this radar scans both `G.World.specialsNear` AND `G.EnemyMgr.all()`.
  * Fully compensates for display DPI scaling (`devicePixelRatio`) and camera offsets (`cam.scale`), ensuring reticles stay pixel-locked on targets without drifting when moving.

---

### 2. 🎁 Insta-Chest (0.01s Contact Unlock)
* **What it does:**  
  Eliminates the 3.5-second stationary channel time required to open big reward chests. Opening occurs in 0.01s upon physical contact.
* **Why this option exists:**  
  * In minutes 15+, mob swarm density is extreme. Standing motionless for 3.5 seconds to open a chest leaves the player vulnerable to lethal collision bursts.
  * Hooks into `G.Interact.update` directly, keeping interaction logic legitimate while accelerating the state transition.

---

### 3. 🎲 Infinite Card Rerolls (Reroll INF)
* **What it does:**  
  Grants unlimited level-up rerolls (`Reroll ∞`), allowing players to cycle through card offerings indefinitely until the exact desired attack, passive item, or synergy appears.
* **Why this implementation:**  
  * Bad RNG can ruin an otherwise optimal 30-minute run.
  * Modifying the player's reroll inventory directly in vanilla code can trigger anti-cheat flags. The suite cleanly sets `pl.rerollBonus = 9999` dynamically during level-up states and restores clean values when syncing, leaving zero footprint.

---

### 4. 🛡️ Arceus Aegis (Post-30:00 Judgment Shield)
* **What it does:**  
  Grants complete damage immunity during the post-30:00 Judgment phase against Arceus, lethal hazard pillars/beams, and multiplying legendary bosses.
* **Why this option is critical:**  
  * At exactly 30:00, Arceus enters the arena. The vanilla design intentionally guarantees player death:
    * Arceus touch deals pure `% maxHp` damage, bypassing defenses.
    * Golden pillars and cross beams deal 30%-40% maxHp bursts.
    * Starting at 30:05, legendary bosses spawn every 5 seconds with exponential damage multipliers ($k = 2^{\text{bossN}}$). By 30:35, the 7th boss deals **$\times 128$ damage**, hitting for tens of thousands of damage in a single frame.
  * **How it works:**  
    Hooks `G.Player.prototype.hurt` (which leaves `Object.prototype.hasOwnProperty` strictly `false`, preserving clean anti-cheat verification) and zeros hazard collision payloads (`G.Hazards.add`), allowing survival into minutes 35–45.

---

### 5. 🍬 Rare Candy Overdrive (Stat Auto-Clamping)
* **What it does:**  
  Applies an optimal combat baseline on-demand:
  * **42,000 HP** (with Shell Bell lifesteal & auto-healing)
  * **1,800x Attack Multiplier** (one-shots standard swarms)
  * **25x Faster Cooldown** (`cdMul = 0.04`)
  * **2,500 Attraction Magnet** (all EXP gems funnel into your Pokémon)
* **Why these exact numbers (The Anti-Cheat Truth):**  
  In `game.js`, the game evaluates `clean()` on match end:
  ```javascript
  function clean() {
    if (tampered) return false;
    if (time > (performance.now() - runReal) / 1000 + 10) return false;
    for (const k of ['hurt', 'update', 'heal', 'gainXp']) if (Object.prototype.hasOwnProperty.call(pl, k)) return false;
    if (!isFinite(pl.hp) || !isFinite(pl.maxHp) || pl.hp > pl.maxHp + 1 || pl.maxHp > 50000) return false;
    if (pl.atkMul > 2000 || pl.spdMul > 25 || pl.cdMul < 0.03 || pl.level > 20 + time / 3) return false;
    return true;
  }
  ```
  * Setting `atkMul` to 1900+ is dangerous: picking just one Attack card in-game applies `pl.atkMul *= 1.10`, pushing it to $1900 \times 1.10 = 2090 > 2000$, which fails `clean()`!
  * Setting `maxHp` to 45,000+ is dangerous: over 200+ levels, HP upgrades push maxHp past 50,000, which fails `clean()`!
  * **Real-Time Auto-Clamping:** The suite continuously clamps stats every tick:
    ```javascript
    if (pl.atkMul > 1950) pl.atkMul = 1950;  // Engine limit is 2000
    if (pl.maxHp > 48000) pl.maxHp = 48000;  // Engine limit is 50000
    if (pl.cdMul < 0.035) pl.cdMul = 0.035;  // Engine limit is 0.03
    if (pl.spdMul > 22)   pl.spdMul = 22;    // Engine limit is 25
    ```
    Regardless of how many level-up cards you select, your stats will **never breach the engine ceiling**, guaranteeing `clean() === true` on every single run.

---

### 6. 🏆 Official Leaderboard Compliance Filter (Firebase Rules)
* **What it does:**  
  Intercepts `G.Ranking.submitSolo` upon match completion and shapes the submission payload to strictly satisfy Google Cloud Firestore security rules.
* **Why this is required (The Backend Truth):**  
  In `firestore.rules` on the server, submissions must satisfy:
  ```javascript
  function validEntry(board, id) {
    let d = request.resource.data;
    let run = get(/databases/$(database)/documents/runs/$(me())).data;
    return d.t <= 2700                                        // Hard cap: exactly 45:00 minutes!
      && d.t <= (request.time - run.startedAt).seconds() + 30  // Must have elapsed in real-world time
      && d.kills <= 100 + d.t * 12                             // Kill limit (max 32,500 at 45m)
      && d.lv <= 10 + d.t / 4                                  // Level limit (max 685 at 45m)
      ...
  }
  ```
  * **The 45:00 Cap:** If a player survives 50 or 53 minutes, sending raw seconds ($3000+$) triggers an instant `PERMISSION_DENIED` rejection. The compliance filter automatically clamps `t = Math.min(t, 2700)` (45:00), which is the absolute maximum time accepted by the database.
  * **The Kill Cap:** A run with 44k+ kills is rejected because $44,196 > 32,500$. The filter safely normalizes kills to $\sim 31,150$.
  * **Cache Flush:** Automatically purges the 6-hour `ps.rk.c.*` localStorage cache so your new world record appears on the in-game leaderboard immediately.

---

### 7. 💻 Professor's PC (Account Booster)
* **What it does:**  
  Unlocks all permanent shop upgrades (+80 HP, +40% Atk, -24% CD, +16% Def, Magnetism, etc.), adds 999,999 coins & tickets, and unlocks all 1,025 Pokémon along with their Shiny forms.

---

## ⌨️ Controls & Hotkeys

| Key / Input | Action |
| :--- | :--- |
| **`H`** | Toggle main Silph Tactical HUD drawer menu |
| **`[SILPH [H]]` Pill** | Clickable top-right floating pill to toggle menu on mobile or touchscreens |
| **`toggleSilphMenu()`** | Console helper command to toggle menu from DevTools (`F12`) |

---

## 🚀 How to Claim #1 World Rank

1. Install the suite in **[Tampermonkey](https://www.tampermonkey.net/)**.
2. Start a match on **[pokesurvivor.com](https://pokesurvivor.com)**.
3. Open the menu (`H`), click **`Activate Overdrive`**, and ensure **`Arceus Aegis`** is ON.
4. Play or leave the game running for **at least 45 minutes**:
   * At 30:00, Arceus enters, but Arceus Aegis renders you completely immune.
   * Auto-clamping keeps your stats 100% legal.
5. After the clock passes **45:00** (e.g., at 45:15 or 46:00):
   * Toggle **`Arceus Aegis`** to OFF.
   * Click **`Deactivate Overdrive`**.
   * A boss hits you, triggering Game Over.
6. The Compliance Filter formats the payload ($45:00$, $\sim 31\text{k}$ kills), Firestore approves the write, and your name appears at **#1 on the World Leaderboard**!

---

## 📦 Installation Guide

### Method 1: Direct Userscript Link (Recommended)
1. Install **[Tampermonkey](https://www.tampermonkey.net/)** (Chrome, Brave, Edge, Firefox).
2. Open the raw userscript file:  
   👉 **[`pokesurvivor.user.js`](https://raw.githubusercontent.com/DevKenzi/pokesurvivor-suite/main/pokesurvivor.user.js)**
3. Tampermonkey will detect the script — click **Install**.
4. Navigate to **[https://pokesurvivor.com](https://pokesurvivor.com)**.

### Method 2: Manual Paste
1. Copy the full contents of [`pokesurvivor.user.js`](pokesurvivor.user.js).
2. In Tampermonkey dashboard, create a new script (+), paste the code (**Ctrl + A** $\to$ **Ctrl + V**), and save (**Ctrl + S**).

---

## 💬 Support & Contact

* 🐛 **Bug Reports & Feedback:** Open an [Issue on GitHub](https://github.com/DevKenzi/pokesurvivor-suite/issues).
* 💬 **Discord:** `_kenzi_04`

---

## ☕ Support the Project

If this suite helped you top the leaderboards and understand the game's inner workings, consider supporting continued updates:

<a href="https://buymeacoffee.com/xkenzix" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 48px !important;width: 174px !important;" ></a>

---

## 📜 License

This project is licensed under the **GNU General Public License v3.0 (GPLv3)**.
