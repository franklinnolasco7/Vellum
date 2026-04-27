import * as ui from "./ui.js";
import * as api from "./api.js";

let panel = null;
let activeTab = "appearance";

const THEME_OPTIONS = [
  {
    value: "dark",
    label: "Dark",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  },
  {
    value: "light",
    label: "Light",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/></svg>`,
  },
  {
    value: "sepia",
    label: "Sepia",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`,
  },
  {
    value: "bw",
    label: "Black & White",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>`,
  },
];

export function init() {
  const btn = document.getElementById("btn-settings");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle();
  });
}

function toggle() {
  if (panel) close();
  else open();
}

function open() {
  if (panel) return;

  const backdrop = document.createElement("div");
  backdrop.id = "settings-backdrop";
  backdrop.className = "settings-backdrop";
  backdrop.addEventListener("click", close);

  panel = document.createElement("div");
  panel.id = "settings-panel";
  panel.className = "settings-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "settings-title");
  panel.addEventListener("click", (e) => e.stopPropagation());

  backdrop.appendChild(panel);
  document.body.appendChild(backdrop);

  render();
  requestAnimationFrame(() => backdrop.classList.add("open"));
  document.addEventListener("keydown", onKeyDown, true);
}

function close() {
  if (!panel) return;
  const backdrop = document.getElementById("settings-backdrop");
  if (backdrop) {
    backdrop.classList.remove("open");
    backdrop.addEventListener("transitionend", () => backdrop.remove(), { once: true });
  }
  panel = null;
  document.removeEventListener("keydown", onKeyDown, true);
}

function onKeyDown(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    close();
  }
}

function setTab(tab) {
  activeTab = tab;
  render();
}

function render() {
  if (!panel) return;
  const currentTheme = ui.savedTheme();

  panel.innerHTML = `
    <div class="settings-header">
      <div>
        <div class="settings-title" id="settings-title">Settings</div>
        <div class="settings-sub">Customize your reading experience</div>
      </div>
      <button class="settings-close-btn" id="settings-close" aria-label="Close settings">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <line x1="3" y1="3" x2="11" y2="11"/>
          <line x1="11" y1="3" x2="3" y2="11"/>
        </svg>
      </button>
    </div>

    <div class="settings-tabs">
      <button class="settings-tab ${activeTab === "appearance" ? "active" : ""}" data-tab="appearance">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Appearance
      </button>
      <button class="settings-tab ${activeTab === "reading" ? "active" : ""}" data-tab="reading">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        Reading
      </button>
      <button class="settings-tab ${activeTab === "about" ? "active" : ""}" data-tab="about">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        About
      </button>
    </div>

    <div class="settings-body">
      ${
        activeTab === "appearance" ? renderAppearance(currentTheme)
        : activeTab === "reading"  ? renderReading()
        : renderAbout()
      }
    </div>
  `;

  panel.querySelector("#settings-close").addEventListener("click", close);

  panel.querySelectorAll(".settings-tab").forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab));
  });

  if (activeTab === "appearance") {
    panel.querySelectorAll(".settings-theme-row").forEach((row) => {
      row.addEventListener("click", () => {
        ui.applyTheme(row.dataset.theme);
        render();
      });
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          ui.applyTheme(row.dataset.theme);
          render();
        }
      });
    });
  }

  if (activeTab === "about") {
    panel.querySelectorAll(".settings-about-link").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        api.openExternalUrl(a.dataset.url).catch(console.error);
      });
    });
  }
}

function renderAppearance(currentTheme) {
  return `
    <div class="settings-section">
      <div class="settings-section-title">Theme</div>
      <div class="settings-option-list">
        ${THEME_OPTIONS.map((t) => `
          <div
            class="settings-theme-row ${currentTheme === t.value ? "active" : ""}"
            data-theme="${t.value}"
            role="radio"
            aria-checked="${currentTheme === t.value}"
            tabindex="0"
          >
            <span class="settings-row-dot"></span>
            <span class="settings-row-icon">${t.icon}</span>
            <span class="settings-row-label">${t.label}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderReading() {
  return `
    <div class="settings-section">
      <div class="settings-section-title">Reading</div>
      <div class="settings-placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        <span>Reading settings coming soon</span>
      </div>
    </div>
  `;
}

function renderAbout() {
  return `
    <div class="settings-about">
      <div class="settings-about-identity">
        <div class="settings-about-logo">
          <svg viewBox="0 0 512 512" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(0.37204,0,0,0.27787,-80.241,-36.032)">
              <path class="about-icon-bg" d="m 505.939,130.551 c 1.171,-0.092 2.343,-0.167 3.515,-0.227 18.618,-0.965 40.948,-0.199 59.804,-0.198 l 111.683,0.018 338.288,0.016 191.728,-0.023 c 42.239,-0.039 99.46,-3.174 139.325,7.303 54.804,14.554 105.474,49.362 146.295,100.492 57.742,72.981 91.713,173.519 94.54,279.833 1.666,67.561 0.12,144.343 0.222,212.89 l -0.017,477.788 -0.017,246.524 c 0.034,61.136 2.699,137.304 -5.937,195.612 -10.558,73.455 -36.482,141.38 -74.732,195.841 -54.864,76.843 -130.1,121.631 -209.418,124.687 -22.636,1.191 -47.313,0.779 -70.102,0.779 l -110.266,-0.092 -325.619,-0.011 -193.027,0.034 c -44.151,0.012 -100.208,3.091 -142.805,-7.888 -54.472,-13.842 -105.064,-47.455 -146.255,-97.199 -58.354,-72.184 -93.015,-172.394 -96.412,-278.729 -1.084,-30.934 -0.687,-63.334 -0.687,-94.429 l 0.008,-142.055 -0.016,-436.119 -0.026,-264.674 c -0.015,-59.258 -2.375,-137.275 5.767,-193.528 10.401,-73.536 35.801,-141.771 73.381,-197.132 55.432,-81.541 129.104,-124.558 210.781,-129.514 z"/>
              <g transform="matrix(0.84733,0,0,1.19974,16.17,-88.64)">
                <path class="about-icon-fg" d="m 680.53,636.423 c 5.055,-0.371 12.574,-0.437 17.733,-0.402 87.802,0.584 191.483,26.28 255.602,89.77 21.864,21.651 38.458,50.956 44.062,80.979 4.053,21.718 3.063,47.546 3.063,69.906 l -0.01,88.973 -0.11,339.281 c -26.669,-20.33 -38.966,-28.64 -68.436,-45.24 -86.082,-44.24 -183.38,-61.88 -279.515,-50.67 -24.518,2.81 -45.943,7.53 -69.955,12.78 -0.852,-40.9 -0.174,-83.64 -0.167,-124.73 l -0.009,-229.64 -0.019,-132.799 c 0,-22.292 -0.292,-44.879 0.346,-67.142 0.594,-20.711 23.784,-22.728 39.402,-25.375 19.286,-3.267 38.388,-4.586 58.013,-5.691 z"/>
                <path class="about-icon-fg" d="m 1597.88,364.939 c 2.93,4.048 4.47,28.985 4.67,35.528 4.15,142.297 -92.79,228.879 -206.54,295.112 -50.05,29.143 -102.44,54.373 -141.92,96.765 31.1,-16.814 68.41,-29.801 101.68,-42.231 87.18,-32.574 162.78,-65.014 228.35,-132.809 -6.76,124.012 -84.61,200.514 -192.35,250.029 -50.49,23.204 -101.2,41.613 -145.63,75.642 72.05,-23.076 147.03,-23.413 213.72,-61.869 3.12,-1.796 18.45,-10.932 20.42,-11.444 l 0.48,1.631 c -3.66,14.668 -6.89,25.9 -13.15,39.848 -25.02,55.801 -75.33,97.069 -131.68,118.819 -33.42,12.91 -69.41,22.38 -103.48,35.36 -68.33,26.03 -124.43,65.94 -162.71,129.16 -11.45,18.91 -18.4,34.98 -27.42,55.04 -1,-26.64 -0.42,-55.46 -0.43,-82.31 l -0.01,-145.42 -0.1,-101.917 c -0.01,-23.978 -0.62,-47.936 1.52,-71.73 17.1,-190.103 211.62,-235.934 352.21,-313.253 85.45,-46.995 145.06,-89.776 202.37,-169.951 z"/>
                <path class="about-icon-fg" d="m 514.407,729.104 c 9.631,-0.522 18.091,-0.442 27.703,-0.328 1.307,60.848 0.343,125 0.354,186.033 l -0.059,359.421 c 129.226,-38.04 258.808,-41.23 379.421,26.22 11.533,6.4 22.618,13.58 33.179,21.49 14.622,10.91 30.668,27.96 48.005,32.24 40.91,10.09 55.8,-9.48 83.23,-30.22 12.84,-9.79 26.43,-18.55 40.65,-26.21 89.25,-48.7 194.7,-60.37 293.93,-42.75 27.41,4.86 53.43,11.65 80.09,19.46 l -0.09,-220.85 -0.03,-71.456 c -0.01,-12.482 -0.29,-28.544 0.51,-40.692 0.69,-10.499 11.04,-28.065 14.77,-39.714 7.9,-24.637 10.4,-44.004 12.73,-69.5 5.44,-6.742 15.15,-16.734 21.3,-23.656 l 0.09,29.591 -0.08,340.647 0.12,102.74 c 0.02,17.33 0.43,35.07 -0.54,52.38 -0.26,5.1 -3.99,13 -7.92,16.37 -12.27,10.53 -47.22,7.17 -62.11,7.16 l -81.91,-0.04 -271.56,-0.12 c -9.82,13.23 -18.18,24.91 -31.51,35.16 -26.34,20.26 -60.66,25.02 -92.94,21.02 -23.772,-2.95 -48.725,-14.38 -65.453,-31.73 -5.11,-5.31 -14.267,-18.13 -19.229,-24.68 -97.711,1.07 -195.519,0.54 -293.235,0.26 -18.321,-0.05 -103.158,2.73 -114.597,-1.9 -6.662,-2.7 -12.006,-8.57 -14.498,-15.23 -3.871,-10.35 -1.731,-95.87 -1.729,-114.88 l 0.023,-239.334 -0.012,-149.442 c -0.009,-26.057 -0.095,-52.119 0.065,-78.174 0.099,-16.358 6.158,-23.934 21.332,-29.286 z"/>
                <path class="about-icon-fg" d="m 1459.91,994.771 c 1.81,7.039 0.4,48.129 0.4,58.199 l -0.23,168.69 c -25.71,-5.02 -44.35,-9.98 -71.55,-12.99 -106.01,-12.39 -213.11,11.26 -304.04,67.15 l -9.84,6.17 c 38.47,-105 99.94,-158.62 206.14,-190.82 73.94,-22.42 123.53,-40.93 179.12,-96.399 z"/>
              </g>
            </g>
          </svg>
        </div>
        <div>
          <div class="settings-about-name">Vivant</div>
          <div class="settings-about-version">Version 0.1.0</div>
        </div>
      </div>

      <div class="settings-about-desc">
        A minimal, open-source EPUB reader for Linux. Built with Tauri and vanilla JS.
      </div>

      <div class="settings-about-links">
        <a class="settings-about-link" id="about-github" href="#" data-url="https://github.com/franklinnolasco7/Vivant">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
          GitHub
        </a>
        <a class="settings-about-link" id="about-issues" href="#" data-url="https://github.com/franklinnolasco7/Vivant/issues">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Report an Issue
        </a>
        <a class="settings-about-link" id="about-license" href="#" data-url="https://www.gnu.org/licenses/gpl-3.0.html">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          GPL-3.0 License
        </a>
      </div>

      <div class="settings-about-footer">
        Free software. No telemetry. No cloud.
      </div>
    </div>
  `;
}
