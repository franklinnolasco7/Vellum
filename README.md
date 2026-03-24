## Requirements

- Node.js 18+
- npm
- Rust stable
- WebKitGTK 4.1 dev packages

```bash
# Arch
sudo pacman -S rustup nodejs npm webkit2gtk-4.1 base-devel

# Fedora
sudo dnf install rust cargo nodejs npm webkit2gtk4.1-devel

# Debian / Ubuntu
sudo apt install rustup nodejs npm libwebkit2gtk-4.1-dev

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

If rendering is unstable on your system:

```bash
export WEBKIT_DISABLE_COMPOSITING_MODE=1
export GDK_BACKEND=wayland
```

## License

MIT. See [LICENSE](LICENSE).
