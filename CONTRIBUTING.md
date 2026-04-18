# Contributing to Vivant

Vivant is a GPL-3.0 Linux EPUB reader built with Tauri (Rust) and vanilla JavaScript. We welcome contributions.

## Hard Rules

- **Tauri APIs:** All `invoke()` calls stay exclusively inside `src/api.js`. Never scatter them.
- **Commands:** Add new Tauri commands to `src-tauri/src/commands.rs`. Register them in `src-tauri/src/lib.rs`.
- **Return Types:** Commands must return `Result<T, String>`.
- **Naming:** Use `snake_case` for all commands.
- **Security:** Use parameterized SQL only. No string interpolation from user input.
- **Privacy:** No network calls or telemetry without explicit project maintainer decision.
- **Licensing:** Verify all new dependencies are fully GPL-3.0 compatible.

## Development Environment

We use Docker to ensure a consistent environment. See [DOCKER.md](DOCKER.md) for basic setup.

### Troubleshooting Docker

**Permission denied (os error 13) or npm EACCES**
Caused by running Docker commands with `sudo`. Creates root-owned files in volumes. Fix via host machine clean build:

```bash
sudo docker compose down -v
sudo rm -rf node_modules src-tauri/target
```

Rebuild image without cache. **Do not use `sudo`**:

```bash
docker compose build --no-cache
docker compose up -d
```

## Code Comments

Follow the commenting guidelines in [.github/instructions/commenting.instructions.md](.github/instructions/commenting.instructions.md):

1. **Explain Why, Not What** — provide context behind implementation decisions
2. **Be Non-duplicative** — avoid restating what the code obviously does
3. **Clarify, Do Not Confuse** — use clear, precise language
4. **Keep Comments Brief** — if extensive, refactor the code instead
5. **Explain Non-obvious Code** — focus on edge cases, workarounds, and business logic

## Before Submitting a PR

Run tests and builds before making a PR. State what wasn't run and why in the PR description.

```bash
npm run test
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
```
