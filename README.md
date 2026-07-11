<p align="center">
  <img src="src-tauri/icons/vivant.svg" width="120px" alt="Vivant logo" />
</p>

<h1 align="center">Vivant</h1>
<p align="center">Read more. Live more.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL%20v3-teal.svg?style=flat-square" alt="License" /></a>
  <a href="https://www.linux.org/pages/download/"><img src="https://img.shields.io/badge/Platform-Linux-FCC624?style=flat-square&logo=linux&logoColor=black" alt="Platform" /></a>
  <a href="https://github.com/franklinnolasco7/Vivant/releases"><img src="https://img.shields.io/badge/Status-Pre--release-lightgrey?style=flat-square" alt="Status" /></a>
</p>

---

Vivant is a Linux EPUB reader built with Tauri. It stores your library data locally.

## Install

Vivant is not released yet. Packages will be posted on the [GitHub Releases](https://github.com/franklinnolasco7/Vivant/releases) page.

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

### Other Linux distributions

There are no packages for every distro yet. For source builds, see [Development](DEVELOPMENT.md).

## Privacy and data

Vivant does not need an account and has no telemetry.

Your library database lives here:

```text
~/.local/share/dev.vivant.reader/vivant.db
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
