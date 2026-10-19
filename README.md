# ⚡ PokéSurvivor Master Suite v2.5 (Silph Tactical Edition)

> Advanced tactical navigation, gameplay enhancement, and account suite for [PokéSurvivor](https://pokesurvivor.com).  
> **100% Player Freedom:** No card forcing — experiment and create your own builds!  
> **Infinite Card Rerolls:** Reroll level-up choices indefinitely (`Reroll ∞`) to craft your dream kit.  
> **Fully Ranking Compliant:** Safe under `clean() === true` anti-cheat verification for official TOP 50 Firebase leaderboards.  
> **Clean Address Bar:** Play directly on [pokesurvivor.com](https://pokesurvivor.com) without any unsightly URL redirects.

![License](https://img.shields.io/badge/License-GPLv3-blue.svg)
![Version](https://img.shields.io/badge/Version-2.5.0-emerald.svg)
![Platform](https://img.shields.io/badge/Platform-Tampermonkey%20%7C%20Violentmonkey-orange.svg)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Donate-yellow.svg?logo=buy-me-a-coffee)](https://buymeacoffee.com/xkenzix)
![Design System](https://img.shields.io/badge/UI-Silph%20Tactical-red.svg)

---

## 🌟 Suite Features:

### 1. 🛰️ Tactical Visual ESP (Radar Overlay)
- Dynamic canvas overlay displaying off-screen edge arrows and on-screen pulse reticles with real-time distance in meters:
  - 🎁 **Chests:** Golden reticles and directional arrows to big reward chests.
  - ⚡ **Altars:** Cyan markers indicating stat shrines (2x DMG, Haste, etc.).
  - 💧 **Healing Springs:** Emerald markers pointing to HP recovery wells.
  - 👑 **Bosses:** High-threat red directional indicators.

### 2. 🎲 Infinite Card Rerolls (Reroll ∞)
- Never get stuck with bad RNG. Whenever the level-up selection appears, reroll cards without limits (displaying `∞`).
- Keep rolling until you find the exact attack or passive item you need.

### 3. 🎁 Insta-Chest (Open on Contact)
- Big chests unlock instantly upon touch (saves 3.5 seconds of stationary channel time per chest).

### 4. 🔥 Match Modifiers & Account Unlocks (Anti-Cheat Safe)
- **🔰 Max Account (1-Click):** Unlocks all 100% permanent shop upgrades (+80 HP, +40% Atk, -24% CD, +16% Def), adds 999,999 coins & tickets, and unlocks all Pokémon + Shiny forms.
- **⚡ Legal God-Tier Match Buff (Toggle ON/OFF):** Starts **OFF** by default so matches are 100% normal. Toggle on-demand anytime during battle with anti-cheat compliance (`clean() === true`):
  - **45,000 HP** (Threshold limit is 50k)
  - **1900x Attack Multiplier** (Threshold limit is 2000x — one-shots swarms & bosses)
  - **25x Faster Attack Cooldown** (CD multiplier 0.04)
  - **Massive 2500 Attraction Magnet** — all EXP gems naturally funnel into your Pokémon
  - **Shell Bell Lifesteal**
  - Click again anytime to deactivate and restore original stats!

---

## ⌨️ Controls & Hotkeys

| Key | Action |
| :--- | :--- |
| **`H`** | Toggle main Silph Tactical drawer menu (`POKÉ [H]`) |

---

## 🚀 Installation Guide (Tampermonkey)

1. Install the **[Tampermonkey](https://www.tampermonkey.net/)** extension in your browser (Brave, Chrome, Edge, Firefox).
2. Open the Tampermonkey extension icon ➔ **Dashboard** ➔ click the **`+`** tab (*Create a new script*).
3. Replace the default template with the code from [`pokesurvivor.user.js`](pokesurvivor.user.js) and press **`Ctrl + S`** (*File ➔ Save*).
4. Navigate to the official game: **[https://pokesurvivor.com](https://pokesurvivor.com)**.
5. Look for the sleek `POKÉ [H]` pill in the top-right corner!

---

## 🎨 Figma Design System

The suite includes a ready-to-import vector design kit for Figma:
- [`figma-ui-kit.svg`](figma-ui-kit.svg) — Drag and drop directly onto your Figma canvas to inspect and edit auto-layout frames, color tokens, and hardware switch variants.

## ☕ Support the Project

If this suite helped you climb the leaderboards, save time, and catch shinies, consider buying me a coffee to support continued development and updates!

<a href="https://buymeacoffee.com/xkenzix" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 50px !important;width: 180px !important;" ></a>

---

## 📜 License

This project is licensed under the **GNU General Public License v3.0 (GPLv3)**.
