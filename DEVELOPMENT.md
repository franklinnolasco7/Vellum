# Development

Notes for working on Vivant or building it from source. If you only want to install the app, start with the [README](README.md).

## Tech stack

- **Desktop app:** Tauri 2
- **Backend:** Rust 2021
- **Frontend:** Vite with vanilla JavaScript
- **Database:** SQLite through `rusqlite`
- **App platforms:** Linux and Windows 10/11 x64
- **Package targets:** Linux `.deb`/`.rpm` and Windows NSIS `.exe`

## Prerequisites

| Tool | Version |
| --- | --- |
| Node.js | 18+ |
| npm | 9+ |
| Rust | stable |
| Linux WebKitGTK | 6.0 development packages |
| Windows build tools | Microsoft C++ Build Tools and WebView2 |

### Linux prerequisites

Install system dependencies for your distribution:

```bash
# Arch
sudo pacman -S rustup nodejs npm webkitgtk-6.0 base-devel

# Fedora
sudo dnf install rust cargo nodejs npm webkitgtk6.0-devel

# Debian / Ubuntu
sudo apt install rustup nodejs npm libwebkitgtk-6.0-dev
```

### Windows prerequisites

Install the following on a 64-bit Windows 10/11 machine:

- Microsoft C++ Build Tools with the **Desktop development with C++** workload
- Microsoft Edge WebView2 Runtime
- Node.js 18 or newer
- Rust using the MSVC toolchain (`rustup default stable-msvc`)

Windows builds must be produced on Windows. The GitHub Actions release workflow
uses a native `windows-latest` runner rather than cross-compiling from Linux.

Then install and select stable Rust:

```bash
rustup toolchain install stable
rustup default stable
```

## Local setup

```bash
git clone https://github.com/franklinnolasco7/Vivant.git
cd Vivant
npm install
npm run tauri:dev
```

This starts Vite and opens the desktop app.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite frontend server |
| `npm run build` | Build the frontend into `dist/` |
| `npm run preview` | Preview the built frontend |
| `npm run test` | Run the Vitest test suite |
| `npm run tauri:dev` | Launch the full Tauri app in development |
| `npm run tauri:build:linux` | Build Linux `.deb` and `.rpm` packages |
| `npm run tauri:build:windows` | Build a Windows x64 NSIS `.exe` installer (run on Windows) |
| `npm run build:release` | Build frontend and Rust release binary |
| `npm run run:release` | Run the release binary |
| `npm run start:arch` | Build and run the release binary |
| `npm run version:sync` | Sync package version metadata |

## Release channels

- `beta` publishes prerelease versions such as `v1.1.0-beta.1` after native Linux
  and Windows validation succeeds.
- `main` publishes stable versions after the same validation gates succeed.
- Use a `feat:` conventional commit for the initial Windows beta so semantic-release
  selects the next minor version. Do not manually edit version fields.
- After the Windows smoke-test checklist passes, merge `beta` into `main` to promote
  the feature set to the stable channel.

Semantic-release passes the calculated version to `npm run version:sync`, which
updates the npm, Tauri, and Cargo manifests before tagging and packaging.

## Docker

Docker is optional. Use it if you want Node.js and Rust in a container.

```bash
./scripts/docker-shell.sh
```

For Docker Compose and plain Docker commands, see [DOCKER.md](DOCKER.md).

## Tests and checks

Run the frontend tests:

```bash
npm run test
```

Run the Rust tests:

```bash
cargo test --manifest-path src-tauri/Cargo.toml
```

Build the frontend:

```bash
npm run build
```

Before opening a pull request, run the checks that match your change. CI runs the
frontend and Rust suites on both Linux and Windows. If you skipped a local check,
say so in the PR.

For Windows release changes, also smoke-test the installed NSIS build: native file
dialogs, EPUB import and drag-and-drop, reading/search/annotations/progress,
external links, image export, title-bar dragging and window controls, DPI scaling,
and persistence after relaunch.

The first Windows beta is unsigned and will trigger SmartScreen. Code signing,
ARM64, MSI, automatic updates, and `.epub` file association are intentionally
deferred.

## Project layout

```text
src/              Frontend JavaScript, styles, and reader UI
src-tauri/        Tauri application, Rust commands, EPUB parsing, SQLite storage
scripts/          Helper scripts
DOCKER.md         Docker setup details
.github/          Contribution, security, and pull request docs
```

## Architecture notes

- All frontend calls into Tauri commands go through `src/api.js`.
- Tauri commands live in `src-tauri/src/commands.rs`.
- New commands must be registered in `src-tauri/src/lib.rs`.
- Library data is stored in SQLite in the app data directory.
- EPUB files are not copied into a managed library folder; Vivant stores the original file path.
- Use parameterized SQL for all database queries.
- Do not add telemetry or network calls without maintainer approval.

## Local data

Development builds use the same app id as normal builds:

```text
dev.vivant.reader
```

The database is usually stored here:

```text
Linux:   ~/.local/share/dev.vivant.reader/vivant.db
Windows: %APPDATA%\dev.vivant.reader\vivant.db
```

For a clean dev state, close the app and move or remove that database file.

## Contributing

Read the [contribution guide](.github/CONTRIBUTING.md) before opening a pull request. Short version:

- Keep pull requests focused.
- Keep `invoke()` calls inside `src/api.js`.
- Keep Tauri command names in `snake_case`.
- Return `Result<T, String>` from Tauri commands.
- Run the relevant tests before submitting.
- Verify new dependencies are GPL-3.0 compatible.
