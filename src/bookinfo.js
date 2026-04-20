/** Book info panel: slides in from right and displays rich book details. */

import { esc, fallbackCover, toast } from "./ui.js";
import * as format from "./format.js";

let backdrop = null;
let panel = null;
let onContinue = null;

/** Build panel once at startup to avoid re-creating DOM for smooth slide animations on repeated open/close. */
export function init() {
  if (panel) return;

  const content = document.getElementById("content");
  if (!content) return;

  backdrop = document.createElement("div");
  backdrop.className = "bookinfo-backdrop";

  panel = document.createElement("aside");
  panel.className = "bookinfo-panel";
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = `
    <section class="bookinfo-hero">
      <div class="bookinfo-cover" id="bookinfo-cover"></div>
      <div class="bookinfo-header">
        <h2 class="bookinfo-title" id="bookinfo-title"></h2>
        <div class="bookinfo-authorline" id="bookinfo-authorline"></div>
        <div class="bookinfo-tags" id="bookinfo-tags"></div>
        <div class="bookinfo-actions">
          <button class="bookinfo-btn bookinfo-btn-primary" id="bookinfo-continue">Continue reading</button>
          <button class="bookinfo-btn bookinfo-btn-icon" id="bookinfo-edit" title="Edit book details" aria-label="Edit book details">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
            </svg>
          </button>
          <button class="bookinfo-btn bookinfo-btn-secondary" id="bookinfo-close-main" title="Close" aria-label="Close">
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
              <line x1="3" y1="3" x2="11" y2="11"></line>
              <line x1="11" y1="3" x2="3" y2="11"></line>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <section class="bookinfo-stats">
      <div class="bookinfo-stat">
        <div class="bookinfo-stat-value" id="stat-progress">0%</div>
        <div class="bookinfo-stat-label">Progress</div>
      </div>
      <div class="bookinfo-stat">
        <div class="bookinfo-stat-value" id="stat-pages">0</div>
        <div class="bookinfo-stat-label">Sections</div>
      </div>
      <div class="bookinfo-stat">
        <div class="bookinfo-stat-value" id="stat-annotations">0</div>
        <div class="bookinfo-stat-label">Annotations</div>
      </div>
      <div class="bookinfo-stat">
        <div class="bookinfo-stat-value" id="stat-time">-</div>
        <div class="bookinfo-stat-label">Time read</div>
      </div>
    </section>

    <nav class="bookinfo-tabs" aria-label="Book info tabs">
      <button class="bookinfo-tab-btn active" data-tab="overview">Overview</button>
      <button class="bookinfo-tab-btn" data-tab="chapters">Sections</button>
      <button class="bookinfo-tab-btn" data-tab="annotations">Annotations</button>
    </nav>

    <section class="bookinfo-content">
      <div class="bookinfo-tab-pane active" data-tab="overview">
        <div class="bookinfo-overview-title">Reading progress</div>
        <div class="progress-bar-large">
          <div class="progress-fill-large" id="overview-progress-fill"></div>
        </div>
        <div class="bookinfo-overview-progress-row">
          <div class="bookinfo-last-read" id="last-read"></div>
          <div class="bookinfo-progress-pct" id="overview-progress-text"></div>
        </div>

        <div class="bookinfo-overview-title">About this book</div>
        <div class="description" id="description"></div>

        <div class="bookinfo-overview-title">Book details</div>
        <table class="details-table">
          <tr><td>Publisher</td><td id="detail-publisher">-</td></tr>
          <tr><td>Published</td><td id="detail-published">-</td></tr>
          <tr><td>Language</td><td id="detail-language">-</td></tr>
          <tr><td>File size</td><td id="detail-filesize">-</td></tr>
          <tr><td>Added</td><td id="detail-dateadded">-</td></tr>
        </table>
      </div>

      <div class="bookinfo-tab-pane" data-tab="chapters">
        <div class="chapters-list" id="chapters-list"></div>
      </div>

      <div class="bookinfo-tab-pane" data-tab="annotations">
        <div class="annotations-list" id="annotations-list"></div>
      </div>
    </section>
  `;

  content.appendChild(backdrop);
  content.appendChild(panel);

  backdrop.addEventListener("click", close);
  panel.querySelector("#bookinfo-close-main").addEventListener("click", close);
  panel.querySelector("#bookinfo-continue").addEventListener("click", () => {
    if (typeof onContinue === "function") onContinue();
    close();
  });
  panel.querySelector("#bookinfo-edit").addEventListener("click", () => {
    toast("Edit details coming soon");
  });

  panel.querySelectorAll(".bookinfo-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) close();
  });
}

/** Populate and open panel. */
export function show(book, toc = [], annotations = [], progress = {}, options = {}) {
  if (!panel) init();
  if (!panel) return;

  progress = progress || {};
  onContinue = options.onContinue;

  const progressChapter = Number.isFinite(progress.chapter_idx)
    ? progress.chapter_idx
    : Number.isFinite(book.progress_chapter)
      ? book.progress_chapter
      : 0;
  const progressPct = Number.isFinite(book.progress_pct)
    ? Math.max(0, Math.min(100, Math.round(book.progress_pct)))
    : format.estimateProgress(progressChapter, toc.length || book.chapter_count || 1);

  renderHero(book);
  renderStats(book, toc, annotations, progressPct);
  renderOverview(book, toc, progressChapter, progressPct);
  renderChapters(toc, progressChapter);
  renderAnnotations(annotations, toc);
  switchTab("overview");

  panel.classList.add("open");
  backdrop.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
}

/** Close panel. */
export function close() {
  if (!panel || !backdrop) return;
  panel.classList.remove("open");
  backdrop.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
}

function switchTab(tab) {
  panel.querySelectorAll(".bookinfo-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  panel.querySelectorAll(".bookinfo-tab-pane").forEach((pane) => {
    pane.classList.toggle("active", pane.dataset.tab === tab);
  });
}

function renderHero(book) {
  const cover = panel.querySelector("#bookinfo-cover");
  cover.innerHTML = book.cover_b64
    ? `<img src="${book.cover_b64}" alt="${esc(book.title || "Book cover")}" decoding="sync" />`
    : fallbackCover(book.title || "Untitled");

  panel.querySelector("#bookinfo-title").textContent = book.title || "Untitled";

  const year = format.extractYear(book.published_at || book.added_at);
  const author = book.author || "Unknown author";
  panel.querySelector("#bookinfo-authorline").textContent = year ? `${author} · ${year}` : author;

  const tags = panel.querySelector("#bookinfo-tags");
  const genreTags = format.toTagList(book.genre);
  tags.innerHTML = (genreTags.length ? genreTags : ["EPUB"]).slice(0, 3)
    .map((tag) => `<span class="bookinfo-tag">${esc(tag)}</span>`)
    .join("");
}

function renderStats(book, toc, annotations, progressPct) {
  panel.querySelector("#stat-progress").textContent = `${progressPct}%`;
  panel.querySelector("#stat-pages").textContent = String(book.chapter_count || toc.length || 0);
  panel.querySelector("#stat-annotations").textContent = String(annotations.length || 0);
  panel.querySelector("#stat-time").textContent = format.formatTimeRead(book);
}

function renderOverview(book, toc, progressChapter, progressPct) {
  panel.querySelector("#overview-progress-fill").style.width = `${progressPct}%`;
  panel.querySelector("#overview-progress-text").textContent = `${progressPct}%`;

  const current = toc.find((t) => Number(t.chapter_idx) === Number(progressChapter));
  const currentLabel = current?.label || current?.title || `Sec ${Number(progressChapter) + 1}`;
  const when = format.formatRelativeDate(book.last_opened || book.added_at);
  panel.querySelector("#last-read").textContent = `Last read · ${currentLabel}${when ? ` · ${when}` : ""}`;

  const description = panel.querySelector("#description");
  description.innerHTML = format.formatDescriptionHtml(book.description);

  panel.querySelector("#detail-publisher").textContent = book.publisher || "-";
  panel.querySelector("#detail-published").textContent = format.formatDate(book.published_at) || "-";
  panel.querySelector("#detail-language").textContent = book.language || "-";
  panel.querySelector("#detail-filesize").textContent = Number.isFinite(book.file_size)
    ? format.formatFileSize(book.file_size)
    : "-";
  panel.querySelector("#detail-dateadded").textContent = format.formatDate(book.added_at) || "-";
}

function renderChapters(toc, progressChapter) {
  const list = panel.querySelector("#chapters-list");
  const flat = flattenToc(toc);

  if (!flat.length) {
    list.innerHTML = "<p><em>No sections available.</em></p>";
    return;
  }

  list.innerHTML = flat.map((entry, idx) => {
    const chapterIdx = Number.isFinite(entry.chapter_idx) ? entry.chapter_idx : idx;
    const read = chapterIdx <= progressChapter;
    const current = chapterIdx === progressChapter;
    const label = entry.label || entry.title || `Section ${chapterIdx + 1}`;
    const displayIndex = chapterIdx + 1;
    return `
      <div class="chapter-item ${read ? "read" : "unread"} ${current ? "current" : ""}" data-depth="${entry.depth}">
        <span class="chapter-index">${displayIndex}</span>
        <span class="chapter-title">${esc(label)}</span>
        <span class="chapter-dot"></span>
      </div>
    `;
  }).join("");
}

function renderAnnotations(annotations, toc = []) {
  const list = panel.querySelector("#annotations-list");
  if (!annotations?.length) {
    list.innerHTML = "<p><em>No annotations yet.</em></p>";
    return;
  }

  const chapterTitleByIdx = new Map();
  flattenToc(toc).forEach((entry, idx) => {
    const chapterIdx = Number.isFinite(entry.chapter_idx) ? entry.chapter_idx : idx;
    const label = entry.label || entry.title || "";
    if (label && !chapterTitleByIdx.has(chapterIdx)) chapterTitleByIdx.set(chapterIdx, label);
  });

  const count = annotations.length;
  const summary = `${count} annotation${count === 1 ? "" : "s"}`;

  list.innerHTML = `
    <div class="annotations-summary">${summary}</div>
    ${annotations.map((ann) => {
    const rawLabel = chapterTitleByIdx.get(ann.chapter_idx) || "";
    const isFallback = /^Section \d+$/.test(rawLabel);
    const chapterLabel = Number.isFinite(ann.chapter_idx)
      ? `Sec ${ann.chapter_idx + 1}${(rawLabel && !isFallback) ? `: ${rawLabel}` : ""}`
      : "Section";
    return `
      <article class="annotation-item">
        <div class="annotation-bar"></div>
        <div class="annotation-content">
          <blockquote class="annotation-quote">"${esc(ann.quote || "")}"</blockquote>
          ${ann.note ? `<div class="annotation-note">${esc(ann.note)}</div>` : ""}
          <div class="annotation-meta">${esc(chapterLabel)}</div>
        </div>
      </article>
    `;
  }).join("")}
  `;
}

function flattenToc(entries, depth = 0, out = []) {
  if (!Array.isArray(entries)) return out;
  for (const item of entries) {
    out.push({ ...item, depth });
    if (Array.isArray(item.children) && item.children.length) {
      flattenToc(item.children, depth + 1, out);
    }
  }
  return out;
}
