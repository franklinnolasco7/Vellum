use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error, Serialize)]
#[serde(tag = "kind", content = "message")]
pub enum Error {
    #[error("database error: {0}")]
    Db(String),
    #[error("EPUB error: {0}")]
    Epub(String),
    #[error("I/O error: {0}")]
    Io(String),
    #[error("not found: {0}")]
    NotFound(String),
    #[error("invalid input: {0}")]
    InvalidInput(String),
}

pub type Result<T> = std::result::Result<T, Error>;

impl From<rusqlite::Error> for Error {
    fn from(e: rusqlite::Error) -> Self { Error::Db(e.to_string()) }
}
impl From<std::io::Error> for Error {
    fn from(e: std::io::Error) -> Self { Error::Io(e.to_string()) }
}
impl From<anyhow::Error> for Error {
    fn from(e: anyhow::Error) -> Self { Error::Epub(format!("{:#}", e)) }
}
