<p align="center">
  <img src="src-tauri/icons/vivant.svg" width="120px" alt="Vivant logo" />
</p>

<h1 align="center">Vivant</h1>
<p align="center">Read more. Live more.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL%20v3-teal.svg?style=flat-square" alt="License" /></a>
  <img src="https://img.shields.io/badge/Platforms-Linux%20%7C%20Windows-2f7d73?style=flat-square" alt="Platforms: Linux and Windows" />
  <a href="https://github.com/franklinnolasco7/Vivant/releases"><img src="https://img.shields.io/badge/Status-Beta-orange?style=flat-square" alt="Status: Beta" /></a>
</p>

---

Vivant is a desktop EPUB reader for Linux and Windows built with Tauri. It stores your library data locally.

## Install

Download current packages from the [GitHub Releases](https://github.com/franklinnolasco7/Vivant/releases) page. Beta releases are intended for testing before stable promotion.

### Debian / Ubuntu

Download the `.deb` package from the latest release, then run:

```bash
sudo apt install ./Vivant-*.deb
```

If your system reports missing dependencies, run:

```bash
sudo apt-get install -f
```

### Fedora

Download the `.rpm` package from the latest release, then run:

```bash
sudo dnf install ./Vivant-*.rpm
```

### Windows 10 / 11

Download the x64 NSIS installer (`.exe`) from the latest release and run it.

The initial Windows builds are unsigned. Microsoft Defender SmartScreen may show an
"unknown publisher" warning; choose **More info**, verify that the installer came
from the Vivant GitHub release, and then choose **Run anyway**.

The beta does not register `.epub` file associations yet. Import books through
Vivant's file picker or drag-and-drop.

### Other Linux distributions

There are no packages for every distro yet. For source builds, see [Development](DEVELOPMENT.md).

## Privacy and data

Vivant does not need an account and has no telemetry.

Your library database is stored in the platform app-data directory:

```text
Linux:   ~/.local/share/dev.vivant.reader/vivant.db
Windows: %APPDATA%\dev.vivant.reader\vivant.db
```

Back up this file if you want to keep your library state.

## Links

- [Development notes](DEVELOPMENT.md)
- [Docker notes](DOCKER.md)
- [Contributing guide](.github/CONTRIBUTING.md)
- [Security policy](.github/SECURITY.md)
- [Changelog](CHANGELOG.md)

## License

GPL-3.0. See [LICENSE](LICENSE).
