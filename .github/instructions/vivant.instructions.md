---
description: Vivant project rules
applyTo: "**"
---

Vivant — GPL-3.0 Linux EPUB reader. Tauri (Rust backend) + vanilla JS frontend.

## Hard rules

- All `invoke()` calls go in `src/api.js` only. Never scatter across other files.
- New Tauri commands → `src-tauri/src/commands.rs`, register in `lib.rs`.
- Commands return `Result<T, String>`. Names snake_case.
- Parameterized SQL only. No string interpolation from input.
- No network calls or telemetry without explicit decision.
- GPL-3.0 only. Verify license before adding any dependency.

## Before finishing

Run: `npm run test`, `cargo test --manifest-path src-tauri/Cargo.toml`, `npm run build`
State what wasn't run and why.
