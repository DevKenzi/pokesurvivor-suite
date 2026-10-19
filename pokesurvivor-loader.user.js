// ==UserScript==
// @name         PokéSurvivor Master Suite (Official Loader)
// @namespace    https://github.com/DevKenzi/pokesurvivor-suite
// @version      2.5.0
// @description  Radar ESP na mapie, Auto-Magnes EXP, Szybkie Skrzynki, Wymaksowane konto i God-Buff pod oficjalny ranking!
// @author       DevKenzi
// @match        https://pokesurvivor.com/*
// @icon         https://pokesurvivor.com/assets/icons/icon-96.png
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @connect      raw.githubusercontent.com
// @homepageURL  https://github.com/DevKenzi/pokesurvivor-suite
// @supportURL   https://buymeacoffee.com/xkenzix
// ==/UserScript==

(function() {
  'use strict';

  // =========================================================================
  // 1. AUTOMATYCZNE PRZEŁĄCZENIE NA WERSJĘ Z ODBLOKOWANYM RADAREM
  // =========================================================================
  // Na stronie głównej (index) autor ukrył API gry w minifikatorze.
  // Ten kod płynnie przenosi gracza na /dev.html w ułamku milisekundy,
  // dzięki czemu gracz wchodzi normalnie na pokesurvivor.com i wszystko od razu działa!
  if (location.pathname === '/' || location.pathname === '/index.html') {
    location.replace('/dev.html' + location.search);
    return;
  }

  // =========================================================================
  // 2. KONFIGURACJA TWÓRCY
  // =========================================================================
  const GITHUB_USER = 'DevKenzi';
  const GITHUB_REPO = 'pokesurvivor-suite';
  const GITHUB_BRANCH = 'main';
  const REMOTE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/core.js?t=${Date.now()}`;

  function bootEngine(code) {
    try {
      const exec = new Function(code);
      exec();
    } catch (err) {
      console.error('[Poké-Loader] Błąd wykonania silnika:', err);
    }
  }

  function fallback() {
    const cached = (typeof GM_getValue !== 'undefined' ? GM_getValue('ps_v2_cache') : null) || localStorage.getItem('ps_v2_cache');
    if (cached) {
      console.warn('[Poké-Loader] Uruchamianie silnika z lokalnej pamięci podręcznej (Offline Cache)...');
      bootEngine(cached);
    } else {
      console.error('[Poké-Loader] Nie można załadować silnika. Upewnij się, że podałeś poprawną nazwę użytkownika w pliku skryptu!');
    }
  }

  // Uruchom pobieranie silnika po załadowaniu drzewa DOM
  function init() {
    if (typeof GM_xmlhttpRequest !== 'undefined') {
      GM_xmlhttpRequest({
        method: 'GET',
        url: REMOTE_URL,
        onload: function(res) {
          if (res.status === 200 && res.responseText.length > 500) {
            if (typeof GM_setValue !== 'undefined') GM_setValue('ps_v2_cache', res.responseText);
            bootEngine(res.responseText);
          } else {
            fallback();
          }
        },
        onerror: fallback
      });
    } else {
      fetch(REMOTE_URL)
        .then(res => res.text())
        .then(code => {
          if (code && code.length > 500) {
            localStorage.setItem('ps_v2_cache', code);
            bootEngine(code);
          } else fallback();
        })
        .catch(fallback);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
