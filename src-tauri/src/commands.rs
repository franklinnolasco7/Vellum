use crate::db::DbPool;
use crate::error::{Error, Result};
use crate::{epub, library};
use serde::Deserialize;
use tauri::{AppHandle, Manager, State};

// ── Import ────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn import_epub(
    app: AppHandle,
    pool: State<'_, DbPool>,
    path: String,
) -> Result<library::Book> {
    let p = std::path::Path::new(&path);
    if !p.exists() {
        return Err(Error::NotFound(format!("file not found: {path}")));
    }

    let cache_root = app
        .path()
        .app_cache_dir()
        .map_err(|e| Error::Io(e.to_string()))?;

    epub::ensure_extracted(p, &cache_root)?;

    let meta = epub::parse_meta(p)?;
    let id = library::add_book(
        &pool,
        &meta.title,
        &meta.author,
        meta.genre.as_deref(),
        meta.description.as_deref(),
        meta.publisher.as_deref(),
        meta.language.as_deref(),
        meta.published_at.as_deref(),
        meta.file_size,
        &path,
        meta.chapter_count,
        meta.cover_data,
    )?;
    library::all_books(&pool)?
        .into_iter()
        .find(|b| b.id == id)
        .ok_or_else(|| Error::NotFound("book after import".into()))
}

// ── Library ───────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn get_library(pool: State<'_, DbPool>) -> Result<Vec<library::Book>> {
    library::backfill_chapter_counts(&pool).ok();
    library::backfill_book_metadata(&pool).ok();
    library::all_books(&pool)
}

#[tauri::command]
#[allow(dead_code)]
pub async fn delete_book(
    pool: State<'_, DbPool>,
    book_id: String,
) -> Result<()> {
    library::delete_book(&pool, &book_id)
}

// ── Reading ───────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn get_toc(file_path: String) -> Result<Vec<epub::TocEntry>> {
    epub::parse_toc(std::path::Path::new(&file_path))
}

#[tauri::command]
pub async fn get_chapter(
    app: AppHandle,
    file_path: String,
    chapter_idx: usize,
) -> Result<epub::ChapterContent> {
    let cache_root = app
        .path()
        .app_cache_dir()
        .map_err(|e| Error::Io(e.to_string()))?;
    epub::get_chapter_html_with_cache(std::path::Path::new(&file_path), chapter_idx, &cache_root)
}

// ── Progress ──────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn save_progress(
    pool: State<'_, DbPool>,
    book_id: String,
    chapter_idx: usize,
    scroll_pct: f64,
) -> Result<()> {
    library::touch_book(&pool, &book_id).ok();
    library::save_progress(&pool, &book_id, chapter_idx, scroll_pct)
}

#[tauri::command]
pub async fn get_progress(
    pool: State<'_, DbPool>,
    book_id: String,
) -> Result<Option<library::Progress>> {
    library::get_progress(&pool, &book_id)
}

#[tauri::command]
pub async fn add_reading_time(
    pool: State<'_, DbPool>,
    book_id: String,
    seconds: u64,
) -> Result<()> {
    library::add_reading_time(&pool, &book_id, seconds)
}

// ── Annotations ───────────────────────────────────────────────────────────────

#[derive(Deserialize)]
pub struct NewAnnotation {
    pub book_id:     String,
    pub chapter_idx: usize,
    pub quote:       String,
    pub note:        Option<String>,
    pub color:       Option<String>,
}

#[tauri::command]
pub async fn add_annotation(
    pool: State<'_, DbPool>,
    ann: NewAnnotation,
) -> Result<library::Annotation> {
    if ann.quote.trim().is_empty() {
        return Err(Error::InvalidInput("quote cannot be empty".into()));
    }
    library::add_annotation(
        &pool, &ann.book_id, ann.chapter_idx,
        &ann.quote, ann.note.as_deref(),
        ann.color.as_deref().unwrap_or("amber"),
    )
}

#[tauri::command]
pub async fn get_annotations(
    pool: State<'_, DbPool>,
    book_id: String,
) -> Result<Vec<library::Annotation>> {
    library::get_annotations(&pool, &book_id)
}

#[tauri::command]
pub async fn delete_annotation(
    pool: State<'_, DbPool>,
    annotation_id: String,
) -> Result<()> {
    library::delete_annotation(&pool, &annotation_id)
}

// ── Search ────────────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn search_book(file_path: String, query: String) -> Result<Vec<epub::SearchResult>> {
    if query.trim().is_empty() {
        return Err(Error::InvalidInput("search query cannot be empty".into()));
    }
    epub::search(std::path::Path::new(&file_path), &query)
}

// ── Window controls — needs `use tauri::Manager` for get_webview_window ───────

#[tauri::command]
pub async fn window_minimize(app: AppHandle) -> Result<()> {
    app.get_webview_window("main")
        .ok_or_else(|| Error::NotFound("main window".into()))?
        .minimize()
        .map_err(|e| Error::Io(e.to_string()))
}

#[tauri::command]
pub async fn window_maximize(app: AppHandle) -> Result<()> {
    let w = app
        .get_webview_window("main")
        .ok_or_else(|| Error::NotFound("main window".into()))?;
    if w.is_maximized().unwrap_or(false) { w.unmaximize() } else { w.maximize() }
        .map_err(|e| Error::Io(e.to_string()))
}

#[tauri::command]
pub async fn window_close(app: AppHandle) -> Result<()> {
    app.get_webview_window("main")
        .ok_or_else(|| Error::NotFound("main window".into()))?
        .close()
        .map_err(|e| Error::Io(e.to_string()))
}
