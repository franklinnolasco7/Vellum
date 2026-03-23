/** Bootstraps the app shell and routes between library and reader views. */

import * as api    from "./api.js";
import * as ui     from "./ui.js";
import * as lib    from "./library.js";
import * as reader from "./reader.js";
import * as search from "./search.js";

// --- Build HTML shell ---

document.getElementById("app").innerHTML = `
<div id="titlebar">
  <span class="app-name">VELLUM</span>
  <div class="tabs">
    <div class="tab active" data-view="library">Library</div>
    <div class="tab" data-view="reader">Reading</div>
  </div>
  <div style="flex:1"></div>
  <div class="theme-swatches">
    <div class="swatch" data-theme="dark"  style="background:#111" title="Dark"></div>
    <div class="swatch" data-theme="sepia" style="background:#f2e7ce" title="Sepia"></div>
    <div class="swatch" data-theme="light" style="background:#f9f8f5;border:.5px solid rgba(0,0,0,.2)" title="Light"></div>
  </div>
  <div class="sep"></div>
  <button class="icon-btn icon-btn-search" id="btn-search" title="Search (Ctrl+F)">⌕</button>
  <div class="sep" id="sep-search"></div>
  <div class="win-controls">
    <button class="win-btn"       id="btn-min"   title="Minimize">─</button>
    <button class="win-btn"       id="btn-max"   title="Maximize">□</button>
    <button class="win-btn close" id="btn-close" title="Close">✕</button>
  </div>
</div>

<div id="content">

  <!-- Search overlay (shown over both views when active) -->
  <div class="search-overlay" id="search-overlay">
    <div class="search-row">
      <span style="color:var(--t2);font-size:14px">⌕</span>
      <input class="search-input" id="search-input" placeholder="Search in book…" autocomplete="off"/>
      <span class="search-count" id="search-count"></span>
      <span id="btn-search-close" style="cursor:pointer;color:var(--t2);font-size:18px;line-height:1" title="Close">×</span>
    </div>
    <div class="search-results" id="search-results"></div>
  </div>

  <!-- Selection tooltip -->
  <div class="selection-tooltip" id="sel-tooltip">
    <button class="sel-btn" id="sel-highlight">Highlight</button>
    <button class="sel-btn" id="sel-note">+ Note</button>
    <button class="sel-btn" id="sel-cancel">×</button>
  </div>

  <!-- ── Library view ── -->
  <div id="view-library">
    <div class="library-header">
      <div>
        <div class="library-title">Your Library</div>
        <div class="library-meta" id="library-meta">Loading…</div>
      </div>
      <button class="nav-btn" id="btn-sort">↕ Sort</button>
    </div>

    <div class="drop-zone" id="drop-zone">

      <div class="drop-zone-icon">📚</div>
      <div class="drop-zone-title">Drop EPUB files here</div>
      <div class="drop-zone-sub">or click to browse your files</div>
      <span class="drop-zone-btn">Import Books</span>
    </div>

    <div class="book-grid" id="book-grid"></div>
  </div>

  <!-- ── Reader view ── -->
  <div id="view-reader" style="display:none">
    <div class="toc-panel" id="toc-panel">
      <div class="toc-header">CONTENTS</div>
      <div class="toc-items" id="toc-items"></div>
    </div>

    <div class="reader-main">
      <div class="reader-topbar">
        <button class="icon-btn" id="btn-toc" title="Table of contents">☰</button>
        <span class="reader-title" id="reader-title">—</span>
        <button class="icon-btn" id="btn-ann" title="Annotations">✎</button>
      </div>
      <div class="reading-area" id="reading-area">
        <div class="chapter-content" id="chapter-content"></div>
      </div>
      <div class="reader-bottombar">
        <button class="nav-btn" id="btn-prev">← Prev</button>
        <div class="reader-progress">
          <div class="reader-progress-fill" id="reader-progress-fill" style="width:0%"></div>
        </div>
        <span class="pos-label" id="pos-label">—</span>
        <button class="nav-btn" id="btn-next">Next →</button>
      </div>
    </div>

    <div class="ann-panel" id="ann-panel">
      <div class="ann-header">
        <span>ANNOTATIONS</span>
        <span class="ann-count" id="ann-count"></span>
      </div>
      <div class="ann-list" id="ann-list"></div>
    </div>
  </div>

</div>

<div id="toast"></div>
`;

// --- Apply saved theme ---

ui.applyTheme(ui.savedTheme());

let currentView = "library";
let hasActiveBook = false;
let pendingReaderFlush = Promise.resolve();

function updateSearchVisibility() {
  const btn = document.getElementById("btn-search");
  const sep = document.getElementById("sep-search");
  const visible = currentView === "reader" && hasActiveBook;
  btn.style.display = visible ? "flex" : "none";
  sep.style.display = visible ? "block" : "none";
}

// --- Initialize modules ---

lib.init({
  onOpen: async (book) => {
    await pendingReaderFlush;
    hasActiveBook = true;
    switchView("reader");
    await reader.openBook(book);
  },
});

reader.init();

// --- Wire global events ---

document.querySelectorAll(".swatch").forEach((s) =>
  s.addEventListener("click", () => ui.applyTheme(s.dataset.theme))
);

document.querySelectorAll(".tab").forEach((tab) =>
  tab.addEventListener("click", () => switchView(tab.dataset.view))
);

document.getElementById("btn-search").addEventListener("click", () => {
  if (currentView === "reader" && hasActiveBook) reader.openSearch();
});

document.getElementById("btn-sort").addEventListener("click", () => {
  lib.toggleSort();
});

// Window controls call backend commands because the title bar is custom.
document.getElementById("btn-min").addEventListener("click",   () => api.windowMinimize());
document.getElementById("btn-max").addEventListener("click",   () => api.windowMaximize());
document.getElementById("btn-close").addEventListener("click", () => api.windowClose());

document.addEventListener("keydown", (e) => {
  const inInput = e.target.matches("input, textarea");

  if (e.key === "Escape") {
    if (search.isOpen()) search.close();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key === "f") {
    if (!(currentView === "reader" && hasActiveBook)) return;
    e.preventDefault();
    reader.openSearch();
    return;
  }
  if (!inInput && e.key === "ArrowRight") reader.loadChapter && document.getElementById("btn-next").click();
  if (!inInput && e.key === "ArrowLeft")  reader.loadChapter && document.getElementById("btn-prev").click();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    reader.flushProgress?.();
  }
});

window.addEventListener("beforeunload", () => {
  reader.flushProgress?.();
});

// --- Switch active view ---

function switchView(view) {
  const wasReader = currentView === "reader";
  currentView = view;

  const applyViewState = () => {
    document.getElementById("view-library").style.display = view === "library" ? "block" : "none";
    document.getElementById("view-reader").style.display  = view === "reader"  ? "flex"  : "none";
    document.querySelectorAll(".tab").forEach((t) =>
      t.classList.toggle("active", t.dataset.view === view)
    );
    updateSearchVisibility();
  };

  if (wasReader && view !== "reader") {
    pendingReaderFlush = Promise.resolve(reader.flushProgress?.()).catch(() => {});
    pendingReaderFlush.finally(() => {
      if (view === "library") lib.load();
      applyViewState();
    });
    return;
  } else if (view === "library") {
    lib.load();
  }

  applyViewState();
}

// --- Bootstrap ---

lib.load();
updateSearchVisibility();
