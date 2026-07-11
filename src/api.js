import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";

async function call(cmd, args = {}) {
  try {
    return await invoke(cmd, args);
  } catch (err) {
    // Rust commands may reject with structured errors; UI callers expect Error.message.
    if (err && typeof err === "object" && err.message) {
      throw new Error(`[${err.kind ?? "Error"}] ${err.message}`);
    }
    throw err instanceof Error ? err : new Error(String(err));
  }
}

export const getLibrary = () => call("get_library");
export const importEpub = (path) => call("import_epub", { path });
export const deleteBooks = (bookIds) => call("delete_books", { bookIds });
export const updateBookMetadata = (update) => call("update_book_metadata", { update });

export const getToc = (filePath) => call("get_toc", { filePath });
export const getChapter = (filePath, chapterIdx) =>
  call("get_chapter", { filePath, chapterIdx });

export const resolveBookLink = (filePath, currentChapterIdx, href) =>
  call("resolve_book_link", { filePath, currentChapterIdx, href });

export const openExternalUrl = (url) => call("open_external_url", { url });

export const saveProgress = (bookId, chapterIdx, scrollPct) =>
  call("save_progress", { bookId, chapterIdx, scrollPct });

export const getProgress = (bookId) => call("get_progress", { bookId });
export const addReadingTime = (bookId, seconds) => call("add_reading_time", { bookId, seconds });

export const addAnnotation = ({ bookId, chapterIdx, quote, quoteHtml, note, color }) =>
  call("add_annotation", {
    ann: {
      book_id: bookId,
      chapter_idx: chapterIdx,
      quote,
      quote_html: quoteHtml ?? null,
      note,
      color,
    },
  });

export const getAnnotations = (bookId) => call("get_annotations", { bookId });

export const updateAnnotationOrder = (bookId, orders) =>
  call("update_annotation_order", { bookId, orders });

export const deleteAnnotation = (annotationId) =>
  call("delete_annotation", { annotationId });

export const searchBook = (filePath, query) =>
  call("search_book", { filePath, query });

export const windowMinimize = () => call("window_minimize");
export const windowMaximize = () => call("window_maximize");
export const windowClose = () => call("window_close");

export const getAppVersion = () => getVersion();

/**
 * These typedefs keep cross-file JSDoc imports available in plain JavaScript.
 *
 * @typedef {{ id:string, title:string, author:string, file_path:string,
 *             genre?:string|null, description?:string|null, publisher?:string|null,
 *             language?:string|null, published_at?:string|null, file_size?:number|null,
 *             reading_seconds?:number,
 *             cover_b64:string|null, added_at:string, last_opened:string|null,
 *             progress_chapter:number, progress_pct:number }} Book
 *
 * @typedef {{ label:string, chapter_idx:number, depth:number, anchor?:string|null }} TocEntry
 *
 * @typedef {{ index:number, title:string, html:string }} ChapterContent

 * @typedef {{ chapter_idx:number, anchor?:string|null }} LinkTarget
 *
 * @typedef {{ id:string, book_id:string, chapter_idx:number,
 *             quote:string, quote_html:string|null, note:string|null, color:string,
 *             ann_order:number, created_at:string }} Annotation
 *
 * @typedef {{ chapter_idx:number, snippet:string,
 *             match_start:number, match_len:number }} SearchResult
 */
