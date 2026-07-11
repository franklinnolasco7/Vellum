//! Shared test helpers keep database setup consistent across test modules.

#[cfg(test)]
pub mod helpers {
    use crate::db::{self, DbPool};
    use r2d2::Pool;
    use r2d2_sqlite::SqliteConnectionManager;

    /// In-memory pools keep tests isolated without filesystem cleanup.
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
