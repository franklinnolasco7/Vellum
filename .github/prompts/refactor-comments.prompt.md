---
description: Rewrite comments to match project commenting guidelines.
---

Refactor comments in provided files. Match `commenting.instructions.md` rules.

1. Delete obvious line-by-line comments.
2. Keep comments that explain _why_.
3. Add comments for edge cases or weird logic.
4. Keep comments short.
5. Do not change code logic.

When done, run tests and build. Use commands: `npm run test`, `cargo test --manifest-path src-tauri/Cargo.toml`, `npm run build`. State what missed and why.
