/**
 * ui.js — shared UI primitives: theme, toast, HTML escaping, colour palette.
 * No business logic lives here.
 */

// ── Theme ─────────────────────────────────────────────────────────────────────

const THEMES = ["dark", "sepia", "light"];

export function applyTheme(theme) {
  if (!THEMES.includes(theme)) theme = "dark";
  document.documentElement.className = theme === "dark" ? "" : `theme-${theme}`;
  document.querySelectorAll(".swatch").forEach((s) =>
    s.classList.toggle("active", s.dataset.theme === theme)
  );
  localStorage.setItem("theme", theme);
  return theme;
}

export function savedTheme() {
  return localStorage.getItem("theme") || "dark";
}

// ── Toast ─────────────────────────────────────────────────────────────────────

let _toastTimer;

export function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

/** Escape a string for safe insertion into innerHTML. */
export function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build the empty-state block used across multiple panels.
 * @param {string} icon  Single emoji or character
 * @param {string} title
 * @param {string} sub
 */
export function emptyState(icon, title, sub) {
  return `<div class="empty-state">
    <div class="empty-state-icon">${icon}</div>
    <div class="empty-state-title">${esc(title)}</div>
    <div class="empty-state-sub">${esc(sub)}</div>
  </div>`;
}

// ── Cover colour palette ──────────────────────────────────────────────────────

const PALETTE = [
  { bg: "#132518", ac: "#4e9a6f" },
  { bg: "#1e1004", ac: "#c4875a" },
  { bg: "#080e18", ac: "#3a8ab5" },
  { bg: "#120a1e", ac: "#8a5ab5" },
  { bg: "#1a1000", ac: "#c4a030" },
  { bg: "#180a0a", ac: "#b55a5a" },
];

/** Deterministic colour from a book title — same title always gives same colour. */
export function coverColor(title) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = title.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

/** SVG fallback cover art for books without an extracted image. */
export function fallbackCover(title) {
  const c = coverColor(title);
  return `
  <div class="book-cover-fallback" style="background:${c.bg}">
    <svg viewBox="0 0 140 210" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="140" height="210" fill="${c.bg}"/>
      <circle cx="70" cy="88" r="52" stroke="${c.ac}" stroke-width="1" fill="none" opacity=".2"/>
      <circle cx="70" cy="88" r="30" stroke="${c.ac}" stroke-width=".8" fill="none" opacity=".15"/>
      <circle cx="70" cy="88" r="12" fill="${c.ac}" opacity=".18"/>
      <rect x="14" y="18" width="112" height=".5" fill="${c.ac}" opacity=".3"/>
      <rect x="14" y="170" width="112" height=".5" fill="${c.ac}" opacity=".3"/>
    </svg>
    <span class="book-cover-fallback-title">${esc(title)}</span>
  </div>`;
}
