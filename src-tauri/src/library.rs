use crate::db::DbPool;
use crate::epub;
use crate::error::{Error, Result};
use chrono::Utc;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ── Public types ──────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Book {
    pub id: String,
    pub title: String,
    pub author: String,
    pub file_path: String,
    pub chapter_count: usize,
    /// `data:image/jpeg;base64,…` or None
    pub cover_b64: Option<String>,
    pub added_at: String,
    pub last_opened: Option<String>,
    pub progress_chapter: usize,
    pub progress_pct: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Progress {
    pub book_id: String,
    pub chapter_idx: usize,
    pub scroll_pct: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Annotation {
    pub id: String,
    pub book_id: String,
    pub chapter_idx: usize,
    pub quote: String,
    pub note: Option<String>,
    pub color: String,
    pub created_at: String,
}

// ── Books ─────────────────────────────────────────────────────────────────────

pub fn add_book(
    pool: &DbPool,
    title: &str,
    author: &str,
    file_path: &str,
    chapter_count: usize,
    cover_data: Option<Vec<u8>>,
) -> Result<String> {
    let conn = pool.get().map_err(|e| Error::Db(e.to_string()))?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    conn.execute(
                "INSERT INTO books (id, title, author, file_path, chapter_count, cover_data, added_at)
                 VALUES (?1,?2,?3,?4,?5,?6,?7)
         ON CONFLICT(file_path) DO UPDATE SET
           title=excluded.title,
           author=excluded.author,
                     chapter_count=excluded.chapter_count,
           cover_data=excluded.cover_data",
                params![id, title, author, file_path, chapter_count as i64, cover_data, now],
    )?;
    // Return the actual id (may differ on conflict update)
    let actual_id: String = conn.query_row(
        "SELECT id FROM books WHERE file_path = ?1",
        params![file_path],
        |r| r.get(0),
    )?;
    Ok(actual_id)
}

pub fn all_books(pool: &DbPool) -> Result<Vec<Book>> {
    let conn = pool.get().map_err(|e| Error::Db(e.to_string()))?;
    let mut stmt = conn.prepare(
        "SELECT b.id, b.title, b.author, b.file_path, b.cover_data,
                b.chapter_count,
                b.added_at, b.last_opened,
                COALESCE(p.chapter_idx, 0),
                COALESCE(
                    CASE
                        WHEN p.book_id IS NULL THEN 0
                        WHEN b.chapter_count <= 1 THEN MIN(100, MAX(0, p.scroll_pct * 100.0))
                        ELSE MIN(100, MAX(0, ((p.chapter_idx + p.scroll_pct) * 100.0) / (b.chapter_count - 1)))
                    END,
                    0
                )
         FROM books b
         LEFT JOIN progress p ON p.book_id = b.id
         ORDER BY b.last_opened DESC, b.added_at DESC",
    )?;

    let rows = stmt.query_map([], |r| {
        let raw: Option<Vec<u8>> = r.get(4)?;
        let cover_b64 = raw.map(|d: Vec<u8>| {
            let mime = detect_mime(&d);
            let mut s = format!("data:{};base64,", mime);
            b64_push(&d, &mut s);
            s
        });
        Ok(Book {
            id:               r.get(0)?,
            title:            r.get(1)?,
            author:           r.get(2)?,
            file_path:        r.get(3)?,
            chapter_count:    r.get::<_, i64>(5)? as usize,
            cover_b64,
            added_at:         r.get(6)?,
            last_opened:      r.get(7)?,
            progress_chapter: r.get::<_, i64>(8)? as usize,
            progress_pct:     r.get(9)?,
        })
    })?;

    Ok(rows.collect::<rusqlite::Result<_>>()?)
}

pub fn backfill_chapter_counts(pool: &DbPool) -> Result<()> {
    let conn = pool.get().map_err(|e| Error::Db(e.to_string()))?;

    let mut stmt = conn.prepare(
        "SELECT id, file_path, chapter_count FROM books WHERE chapter_count <= 1",
    )?;
    let rows = stmt.query_map([], |r| {
        Ok((
            r.get::<_, String>(0)?,
            r.get::<_, String>(1)?,
            r.get::<_, i64>(2)? as usize,
        ))
    })?;

    let items = rows.collect::<rusqlite::Result<Vec<_>>>()?;
    drop(stmt);

    for (id, file_path, old_count) in items {
        let path = std::path::Path::new(&file_path);
        if !path.exists() {
            continue;
        }
        let Ok(meta) = epub::parse_meta(path) else {
            continue;
        };
        if meta.chapter_count > old_count {
            let _ = conn.execute(
                "UPDATE books SET chapter_count = ?1 WHERE id = ?2",
                params![meta.chapter_count as i64, id],
            );
        }
    }

    Ok(())
}

pub fn touch_book(pool: &DbPool, id: &str) -> Result<()> {
    let conn = pool.get().map_err(|e| Error::Db(e.to_string()))?;
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE books SET last_opened = ?1 WHERE id = ?2",
        params![now, id],
    )?;
    Ok(())
}

// ── Progress ──────────────────────────────────────────────────────────────────

pub fn save_progress(
    pool: &DbPool,
    book_id: &str,
    chapter_idx: usize,
    scroll_pct: f64,
) -> Result<()> {
    let conn = pool.get().map_err(|e| Error::Db(e.to_string()))?;
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO progress (book_id, chapter_idx, scroll_pct, updated_at)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(book_id) DO UPDATE SET
           chapter_idx = excluded.chapter_idx,
           scroll_pct  = excluded.scroll_pct,
           updated_at  = excluded.updated_at",
        params![book_id, chapter_idx as i64, scroll_pct, now],
    )?;
    Ok(())
}

pub fn get_progress(pool: &DbPool, book_id: &str) -> Result<Option<Progress>> {
    let conn = pool.get().map_err(|e| Error::Db(e.to_string()))?;
    let mut stmt = conn.prepare(
        "SELECT chapter_idx, scroll_pct FROM progress WHERE book_id = ?1",
    )?;
    let mut rows = stmt.query(params![book_id])?;
    Ok(rows.next()?.map(|r| Progress {
        book_id:     book_id.to_owned(),
        chapter_idx: r.get::<_, i64>(0).unwrap_or(0) as usize,
        scroll_pct:  r.get(1).unwrap_or(0.0),
    }))
}

// ── Annotations ───────────────────────────────────────────────────────────────

pub fn add_annotation(
    pool: &DbPool,
    book_id: &str,
    chapter_idx: usize,
    quote: &str,
    note: Option<&str>,
    color: &str,
) -> Result<Annotation> {
    let conn = pool.get().map_err(|e| Error::Db(e.to_string()))?;
    let id  = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO annotations
         (id, book_id, chapter_idx, quote, note, color, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7)",
        params![id, book_id, chapter_idx as i64, quote, note, color, now],
    )?;
    Ok(Annotation {
        id,
        book_id:     book_id.to_owned(),
        chapter_idx,
        quote:       quote.to_owned(),
        note:        note.map(str::to_owned),
        color:       color.to_owned(),
        created_at:  now,
    })
}

pub fn get_annotations(pool: &DbPool, book_id: &str) -> Result<Vec<Annotation>> {
    let conn = pool.get().map_err(|e| Error::Db(e.to_string()))?;
    let mut stmt = conn.prepare(
        "SELECT id, chapter_idx, quote, note, color, created_at
         FROM annotations
         WHERE book_id = ?1
         ORDER BY chapter_idx, created_at",
    )?;
    let rows = stmt.query_map(params![book_id], |r| {
        Ok(Annotation {
            id:          r.get(0)?,
            book_id:     book_id.to_owned(),
            chapter_idx: r.get::<_, i64>(1)? as usize,
            quote:       r.get(2)?,
            note:        r.get(3)?,
            color:       r.get(4)?,
            created_at:  r.get(5)?,
        })
    })?;
    Ok(rows.collect::<rusqlite::Result<_>>()?)
}

pub fn delete_annotation(pool: &DbPool, id: &str) -> Result<()> {
    let conn = pool.get().map_err(|e| Error::Db(e.to_string()))?;
    let deleted = conn.execute("DELETE FROM annotations WHERE id = ?1", params![id])?;
    if deleted == 0 {
        return Err(Error::NotFound(format!("annotation {id}")));
    }
    Ok(())
}

#[allow(dead_code)]
pub fn delete_book(pool: &DbPool, id: &str) -> Result<()> {
    let conn = pool.get().map_err(|e| Error::Db(e.to_string()))?;
    let deleted = conn.execute("DELETE FROM books WHERE id = ?1", params![id])?;
    if deleted == 0 {
        return Err(Error::NotFound(format!("book {id}")));
    }
    // Also delete associated annotations and progress
    let _ = conn.execute("DELETE FROM annotations WHERE book_id = ?1", params![id]);
    let _ = conn.execute("DELETE FROM progress WHERE book_id = ?1", params![id]);
    Ok(())
}

// ── Minimal base-64 encoder ───────────────────────────────────────────────────

fn b64_push(data: &[u8], out: &mut String) {
    const T: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut i = 0;
    while i + 2 < data.len() {
        let n = ((data[i] as u32) << 16)
            | ((data[i + 1] as u32) << 8)
            | data[i + 2] as u32;
        out.push(T[((n >> 18) & 63) as usize] as char);
        out.push(T[((n >> 12) & 63) as usize] as char);
        out.push(T[((n >>  6) & 63) as usize] as char);
        out.push(T[( n        & 63) as usize] as char);
        i += 3;
    }
    if i < data.len() {
        let n = (data[i] as u32) << 16
            | if i + 1 < data.len() { (data[i + 1] as u32) << 8 } else { 0 };
        out.push(T[((n >> 18) & 63) as usize] as char);
        out.push(T[((n >> 12) & 63) as usize] as char);
        if i + 1 < data.len() { out.push(T[((n >> 6) & 63) as usize] as char); }
        else { out.push('='); }
        out.push('=');
    }
}

fn detect_mime(data: &[u8]) -> &'static str {
    if data.starts_with(b"\x89PNG") { "image/png" }
    else if data.starts_with(b"\xff\xd8") { "image/jpeg" }
    else if data.starts_with(b"GIF") { "image/gif" }
    else if data.starts_with(b"RIFF") { "image/webp" }
    else { "image/jpeg" }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db;
    use r2d2::Pool;
    use r2d2_sqlite::SqliteConnectionManager;

    fn mem_pool() -> DbPool {
        let manager = SqliteConnectionManager::memory().with_init(|conn| {
            conn.execute_batch("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;")
        });
        let pool = Pool::builder().max_size(2).build(manager).expect("test pool");
        db::migrate(&pool).expect("migrations");
        pool
    }

    #[test]
    fn add_book_then_list_library() {
        let pool = mem_pool();
        let file_path = "/tmp/vellum-test-book.epub";

        let id = add_book(
            &pool,
            "Test Title",
            "Test Author",
            file_path,
            12,
            None,
        )
        .expect("add book");

        let books = all_books(&pool).expect("list books");
        assert_eq!(books.len(), 1);
        assert_eq!(books[0].id, id);
        assert_eq!(books[0].title, "Test Title");
        assert_eq!(books[0].author, "Test Author");
        assert_eq!(books[0].chapter_count, 12);
        assert_eq!(books[0].progress_pct, 0.0);
    }

    #[test]
    fn save_progress_then_read_progress() {
        let pool = mem_pool();
        let file_path = "/tmp/vellum-progress-book.epub";

        let id = add_book(
            &pool,
            "Progress Book",
            "Author",
            file_path,
            10,
            None,
        )
        .expect("add book");

        save_progress(&pool, &id, 3, 0.5).expect("save progress");
        let progress = get_progress(&pool, &id).expect("get progress").expect("progress row");

        assert_eq!(progress.book_id, id);
        assert_eq!(progress.chapter_idx, 3);
        assert!((progress.scroll_pct - 0.5).abs() < f64::EPSILON);

        let books = all_books(&pool).expect("list books");
        assert_eq!(books.len(), 1);
        assert!(books[0].progress_pct > 0.0);
    }
}
