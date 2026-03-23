//! Test helpers shared across unit and integration tests.
//!
//! Import with `use crate::tests::*;` inside any `#[cfg(test)]` block.

#[cfg(test)]
pub mod helpers {
    use crate::db::{self, DbPool};
    use r2d2::Pool;
    use r2d2_sqlite::SqliteConnectionManager;

    /// Create a temporary in-memory connection pool and run migrations.
    /// Every test gets a fresh, isolated database — no file cleanup needed.
    pub fn mem_pool() -> DbPool {
        let manager = SqliteConnectionManager::memory().with_init(|conn| {
            conn.execute_batch("
                PRAGMA foreign_keys = ON;
                PRAGMA journal_mode = WAL;
            ")
        });
        let pool = Pool::builder()
            .max_size(2)
            .build(manager)
            .expect("failed to build test pool");
        db::migrate(&pool).expect("migrations failed");
        pool
    }
}
