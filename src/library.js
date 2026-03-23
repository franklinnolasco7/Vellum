/** Manages library state, rendering, import, deletion, and sort behavior. */
import * as api from "./api.js";
import { esc, emptyState, fallbackCover, toast } from "./ui.js";

let books = [];
let onOpenBook = (_book) => {};

const SORT_OPTIONS = [
  {
    label: "Recent",
    compare: (a, b) => cmpDateDesc(a.last_opened, b.last_opened) || cmpDateDesc(a.added_at, b.added_at),
  },
  {
    label: "Title",
    compare: (a, b) => cmpText(a.title, b.title) || cmpDateDesc(a.added_at, b.added_at),
  },
  {
    label: "Author",
    compare: (a, b) => cmpText(a.author, b.author) || cmpText(a.title, b.title),
  },
  {
    label: "Progress",
    compare: (a, b) => (b.progress_pct - a.progress_pct) || cmpText(a.title, b.title),
  },
];

let sortIndex = 0;

/** Initialize library interactions and handlers. */
export function init({ onOpen }) {
  onOpenBook = onOpen;

  updateSortButtonLabel(document.getElementById("btn-sort"));

  const dropZone = document.getElementById("drop-zone");

  // Use the native picker to avoid hidden file input complexity in Tauri.
  dropZone.addEventListener("click", openFilePicker);

  // Keep drag-and-drop import for quick batch imports from file managers.
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    const paths = [...e.dataTransfer.files]
      .filter((f) => f.name.endsWith(".epub"))
      .map((f) => f.path)
      .filter(Boolean);
    importPaths(paths);
  });
}

let _picking = false;
async function openFilePicker(e) {
  e.stopPropagation();
  if (_picking) return;
  _picking = true;
  try {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({
      multiple: true,
      filters: [{ name: "EPUB", extensions: ["epub"] }],
    });
    if (!selected) {
      _picking = false;
      return;
    }
    const paths = Array.isArray(selected) ? selected : [selected];
    await importPaths(paths);
  } catch (err) {
    toast(`Could not open file picker: ${err.message}`);
  } finally {
    _picking = false;
  }
}

/** Load books from the backend and render the current library view. */
export async function load() {
  try {
    books = await api.getLibrary();
  } catch (err) {
    toast(`Library error: ${err.message}`);
    books = [];
  }
  render();
}

/** Render the library grid and metadata using current state and sort mode. */
export function render() {
  const grid = document.getElementById("book-grid");
  const meta = document.getElementById("library-meta");
  const sortBtn = document.getElementById("btn-sort");

  updateSortButtonLabel(sortBtn);
  applySort();

  const inprog = books.filter((b) => b.progress_pct > 0 && b.progress_pct < 100).length;
  meta.textContent = `${books.length} book${books.length !== 1 ? "s" : ""} · ${inprog} in progress`;

  if (!books.length) {
    grid.innerHTML = emptyState("📖", "No books yet", "Import an EPUB to get started");
    return;
  }

  grid.innerHTML = books.map((b, i) => `
    <div class="book-card" data-index="${i}">
      <div class="book-cover">
        ${b.cover_b64
          ? `<img src="${b.cover_b64}" alt="${esc(b.title)}" loading="lazy"/>`
          : fallbackCover(b.title)}
      </div>
      <div class="book-title">${esc(b.title)}</div>
      <div class="book-author">${esc(b.author)}</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${b.progress_pct}%"></div>
      </div>
      <div class="progress-label">${progressLabel(b)}</div>
      <button class="delete-btn" data-book-id="${esc(b.id)}" title="Delete book">×</button>
    </div>`).join("");

  grid.querySelectorAll(".book-card").forEach((card) =>
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("delete-btn")) {
        onOpenBook(books[+card.dataset.index]);
      }
    })
  );

  // Use event-level stopPropagation so delete does not open the book.
  grid.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const bookId = btn.dataset.bookId;
      if (await confirmDeleteBook()) {
        deleteBookItem(bookId);
      }
    })
  );
}

/** Cycle the active sort mode and re-render the grid. */
export function toggleSort() {
  sortIndex = (sortIndex + 1) % SORT_OPTIONS.length;
  render();
}

function applySort() {
  const option = SORT_OPTIONS[sortIndex] || SORT_OPTIONS[0];
  books.sort(option.compare);
}

function updateSortButtonLabel(sortBtn) {
  if (!sortBtn) return;
  const option = SORT_OPTIONS[sortIndex] || SORT_OPTIONS[0];
  sortBtn.textContent = `↕ ${option.label}`;
  sortBtn.title = `Sort: ${option.label} (click to change)`;
}

function cmpText(a, b) {
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { sensitivity: "base" });
}

function cmpDateDesc(a, b) {
  return toMillis(b) - toMillis(a);
}

function toMillis(value) {
  const n = Date.parse(value || "");
  return Number.isNaN(n) ? 0 : n;
}

async function confirmDeleteBook() {
  try {
    const { confirm } = await import("@tauri-apps/plugin-dialog");
    return await confirm("Delete this book from your library?", {
      title: "Delete Book",
      kind: "warning",
      okLabel: "Delete",
      cancelLabel: "Cancel",
    });
  } catch (_err) {
    return window.confirm("Delete this book from your library?");
  }
}

async function importPaths(paths) {
  for (const path of paths) {
    try {
      const book = await api.importEpub(path);
      upsert(book);
      toast(`"${book.title}" imported`);
    } catch (err) {
      toast(`Import failed: ${err.message}`);
    }
  }
  render();
}

function upsert(book) {
  const idx = books.findIndex((b) => b.file_path === book.file_path);
  if (idx >= 0) books[idx] = book;
  else books.unshift(book);
}

function progressLabel(b) {
  if (b.progress_pct <= 0)   return "Not started";
  if (b.progress_pct >= 100) return "✓ Finished";
  return `${Math.round(b.progress_pct)}% read`;
}
async function deleteBookItem(bookId) {
  try {
    await api.deleteBook(bookId);
    books = books.filter((b) => b.id !== bookId);
    render();
    toast("Book deleted");
  } catch (err) {
    toast(`Delete failed: ${err.message}`);
  }
}
