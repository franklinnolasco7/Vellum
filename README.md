## Requirements

- Node.js 18+
- npm
- Rust stable
- WebKitGTK 6.0 dev packages

```bash
# Arch
sudo pacman -S rustup nodejs npm webkitgtk-6.0 base-devel

# Fedora
sudo dnf install rust cargo nodejs npm webkitgtk6.0-devel

# Debian / Ubuntu
sudo apt install rustup nodejs npm libwebkitgtk-6.0-dev

rustup toolchain install stable
rustup default stable
```

## Quick Start

```bash
git clone https://github.com/yourname/vellum
cd vellum
npm install
npm run tauri dev
```

## Scripts

```bash
npm run dev
npm run build
npm run test
npm run tauri dev
npm run tauri build
```

## Project Layout

```text
src/                frontend modules
src-tauri/src/      rust backend and commands
```

## Data

```text
~/.local/share/dev.vellum.reader/vellum.db
```

## Notes (Wayland)

Vellum targets native Wayland launch without environment-variable workarounds.

## License

MIT. See [LICENSE](LICENSE).
