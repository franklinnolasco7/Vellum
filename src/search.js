import * as api from "./api.js";
import { esc } from "./ui.js";

let _filePath = null;
let _toc = [];
let _debounce = null;
let onNavigate = (_chapterIdx) => { };
const SEARCH_DEBOUNCE_MS = 250;
let _searchObserver = null;
let _currentSearchId = 0;

export function init({ onJump }) {
  onNavigate = onJump;

  document.getElementById("search-input").addEventListener("input", (e) => {
    clearTimeout(_debounce);
    _debounce = setTimeout(() => runSearch(e.target.value.trim()), SEARCH_DEBOUNCE_MS);
  });

  document.getElementById("btn-search-close").addEventListener("click", close);

  document.getElementById("search-results").addEventListener("click", (e) => {
    const row = e.target.closest(".search-result");
    if (row) {
      const query = document.getElementById("search-input").value.trim();
      onNavigate(+row.dataset.chapter, { highlightQuery: query });
      close();
    }
  });
}

export function open(filePath, toc) {
  _filePath = filePath;
  _toc = toc;
  document.getElementById("search-overlay").classList.add("open");
  document.getElementById("search-input").focus();
}

export function close() {
  document.getElementById("search-overlay").classList.remove("open");
  document.getElementById("search-input").value = "";
  document.getElementById("search-results").innerHTML = "";
  document.getElementById("search-count").textContent = "";
  if (_searchObserver) {
    _searchObserver.disconnect();
    _searchObserver = null;
  }
}

export function isOpen() {
  return document.getElementById("search-overlay").classList.contains("open");
}

async function runSearch(query) {
  const countEl = document.getElementById("search-count");
  const resultsEl = document.getElementById("search-results");

  if (_searchObserver) {
    _searchObserver.disconnect();
    _searchObserver = null;
  }

  const searchId = ++_currentSearchId;

  if (!query || !_filePath) {
    countEl.textContent = "";
    resultsEl.innerHTML = "";
    return;
  }

  try {
    const results = await api.searchBook(_filePath, query);
    if (searchId !== _currentSearchId) return;

    countEl.textContent = results.length
      ? `${results.length} result${results.length !== 1 ? "s" : ""}`
      : "No results";

    resultsEl.innerHTML = "";
    if (results.length === 0) return;

    let renderedCount = 0;
    const CHUNK_SIZE = 50;

    const sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    resultsEl.appendChild(sentinel);

    const renderNextChunk = () => {
      const chunk = results.slice(renderedCount, renderedCount + CHUNK_SIZE);
      if (chunk.length === 0) return;

      const html = chunk.map((r) => {
        const before = esc(r.snippet.slice(0, r.match_start));
        const match = esc(r.snippet.slice(r.match_start, r.match_start + r.match_len));
        const after = esc(r.snippet.slice(r.match_start + r.match_len));
        const label = _toc[r.chapter_idx]?.label ?? `Chapter ${r.chapter_idx + 1}`;
        return `<div class="search-result" data-chapter="${r.chapter_idx}">
          <div class="search-result-text">…${before}<em>${match}</em>${after}…</div>
          <div class="search-result-loc">${esc(label)}</div>
        </div>`;
      }).join("");

      sentinel.insertAdjacentHTML("beforebegin", html);
      renderedCount += chunk.length;

      if (renderedCount >= results.length) {
        sentinel.remove();
        if (_searchObserver) {
          _searchObserver.disconnect();
          _searchObserver = null;
        }
      }
    };

    _searchObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        renderNextChunk();
      }
    }, { root: resultsEl, rootMargin: "200px" });

    _searchObserver.observe(sentinel);

  } catch (err) {
    if (searchId !== _currentSearchId) return;
    countEl.textContent = `Error: ${err.message}`;
    resultsEl.innerHTML = "";
  }
}
