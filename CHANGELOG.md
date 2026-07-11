# [1.1.0-beta.1](https://github.com/franklinnolasco7/Vivant/compare/v1.0.0...v1.1.0-beta.1) (2026-07-11)


### Bug Fixes

* isolate version sync from CLI entrypoint ([54b1e3b](https://github.com/franklinnolasco7/Vivant/commit/54b1e3b9585e91894011ffb38d61aaaa7c44a9cf))


### Features

* add Windows prerelease support ([2ccfd37](https://github.com/franklinnolasco7/Vivant/commit/2ccfd379a4e107714967886575fb3f5dad3af343))

# 1.0.0 (2026-07-11)


### Bug Fixes

* add explicit esbuild dependency and bump safari target ([1e59e46](https://github.com/franklinnolasco7/Vivant/commit/1e59e46c842ad7db9d43916632bf6f638dd455a6))
* **annotations:** replace emoji with semantic icon reference ([37c9962](https://github.com/franklinnolasco7/Vivant/commit/37c9962d517622df67e3d05087d3711716d53d3f))
* close search and remove delay on library switch ([fda57e5](https://github.com/franklinnolasco7/Vivant/commit/fda57e5a28235801a85be013e217fdb95f3ff821))
* correct linux desktop file path ([2ae05e2](https://github.com/franklinnolasco7/Vivant/commit/2ae05e2c1d0cf36cd3423e25517685d3491dc049))
* **docker:** correct cargo volume mount and add X11 display forwarding ([a0c47f5](https://github.com/franklinnolasco7/Vivant/commit/a0c47f55ca2e68a10789efdf3bd19e9b39038014))
* **epub:** stabilize search matching and spacing ([51843e7](https://github.com/franklinnolasco7/Vivant/commit/51843e7c8ad7396833477dd79619759183963497))
* isolate the reader stacking context ([75660aa](https://github.com/franklinnolasco7/Vivant/commit/75660aa1b0d92a549b087e964c67007af9f14131))
* linux desktop destination path must start with slash ([f50571e](https://github.com/franklinnolasco7/Vivant/commit/f50571ef5c6ecb0d6ac666df79f026c7450758a4))
* load the app version in settings ([5e96cb2](https://github.com/franklinnolasco7/Vivant/commit/5e96cb2ef4bf2768e2008240ea8327227814976c))
* prevent TOC overwrite, remove title tag extraction, and improve path decoding for chapter assets ([3adc49c](https://github.com/franklinnolasco7/Vivant/commit/3adc49c6df64e81855399cb53c0e3a3bff7cd50a))
* **reader:** overhaul search hit logic and anchor validation ([a0ed488](https://github.com/franklinnolasco7/Vivant/commit/a0ed4880ad79cf381acd05406fbfec9c0b894a5c))
* remove 50 result limit for in-book search ([065b417](https://github.com/franklinnolasco7/Vivant/commit/065b4173550cdc3398e6cd3ca99c956163800f16))
* remove appimage build target ([0df7d0f](https://github.com/franklinnolasco7/Vivant/commit/0df7d0ff457b0677b8c06bfd754116e53855b7a2))
* **style:** box artifact on the corner of reading panel ([f430404](https://github.com/franklinnolasco7/Vivant/commit/f4304046b92174febf8e450f2ee49c69e25bb4e3))


### Features

* add About tab to settings panel with project details and external links ([399d01c](https://github.com/franklinnolasco7/Vivant/commit/399d01c94544d4ec457eec6dc187b08e4c0c34f5))
* add book metadata editing functionality ([b1244d1](https://github.com/franklinnolasco7/Vivant/commit/b1244d106cbd30817c507c5d2888a7a771d51265))
* add chunked infinite scroll ([8ab1977](https://github.com/franklinnolasco7/Vivant/commit/8ab1977b15a9d6431f0f0c50d2c575152911f3a8))
* add keybind to select all books on library ([6281313](https://github.com/franklinnolasco7/Vivant/commit/628131392f31b20c265e1cc4ee36257695dd6cc4))
* **api:** add add_reading_time command and import metadata fields ([b4c8809](https://github.com/franklinnolasco7/Vivant/commit/b4c88098a29bd8f9f4a4208474502025e88744be))
* **api:** add addReadingTime call and Book metadata JSDoc type ([d755c2f](https://github.com/franklinnolasco7/Vivant/commit/d755c2f71fee97b295b1bb6bce5df172001cc832))
* **bookinfo:** add right-side book details panel with metadata display ([4184a18](https://github.com/franklinnolasco7/Vivant/commit/4184a18862f8dc40279c75e2a5f01c70f6ba3cc6))
* **db:** add schema migrations for book metadata and reading time tracking ([ed14e6b](https://github.com/franklinnolasco7/Vivant/commit/ed14e6bd2b86c6972c4400e658da99c69d799546))
* **docker:** introduce docker-compose development environment ([cb14031](https://github.com/franklinnolasco7/Vivant/commit/cb140314a5d82c9ee262ad1767148800b1fb95b6))
* enhance annotation features and add image viewer ([5d00dd3](https://github.com/franklinnolasco7/Vivant/commit/5d00dd3cea209312c78a55c1b1b7632613b3d107))
* **epub:** extract comprehensive metadata from EPUB files ([ce13c3b](https://github.com/franklinnolasco7/Vivant/commit/ce13c3b1826dfb01214ae8aeee87b1fa0d125a67))
* extend image path rewriting to support additional tags and attributes including href and xlink:href ([7569b9c](https://github.com/franklinnolasco7/Vivant/commit/7569b9c0309601d706bbd86bdd61d3a4cc4dddad))
* implement comprehensive responsive design updates across reader, library, settings, and components. ([df0bad9](https://github.com/franklinnolasco7/Vivant/commit/df0bad995da0dc5a869f0690295f8f3e203c802f))
* implement cover image resizing and optimize library import performance with concurrent processing ([5953a51](https://github.com/franklinnolasco7/Vivant/commit/5953a5102a034a94100414f3a0248ffe26ca0d9a))
* implement library bulk selection and deletion mode ([c5bc2f7](https://github.com/franklinnolasco7/Vivant/commit/c5bc2f7034885585944cce2049c55920297b7fc0))
* implement shift-select range functionality and standardize escape key handling across UI components ([e32a7c1](https://github.com/franklinnolasco7/Vivant/commit/e32a7c1e26840984e926cf6c713d2724206a4804))
* improve chapter labeling by parsing HTML headings and expand fallback ID patterns ([53bca0f](https://github.com/franklinnolasco7/Vivant/commit/53bca0fce6f1abb01860c498fbe97faf65f92a3e))
* **library:** add book info panel integration and drag-drop enhancements ([e5d0cae](https://github.com/franklinnolasco7/Vivant/commit/e5d0cae970f88f6a5de04efb52ffcf6e4dbd24c6))
* **library:** add search and custom delete confirmation dialog ([4c9dadb](https://github.com/franklinnolasco7/Vivant/commit/4c9dadb411cdc28115638869a52e19a6106df293))
* **library:** track reading time and enrich book metadata ([95550db](https://github.com/franklinnolasco7/Vivant/commit/95550db3beef46623b8b5edf984524dab33652f7))
* **reader:** handle internal/external links and progress tooltip interactions ([7155531](https://github.com/franklinnolasco7/Vivant/commit/7155531bc94f4e73e6677851b5acd8d0a9a9bea2))
* **reader:** implement reading time tracking and edge-page intent logic ([25d4c61](https://github.com/franklinnolasco7/Vivant/commit/25d4c612881e65d9fc63122f351bf2a7c312c8c9))
* redesign library interface with new action buttons and updated search styling ([c6bd6df](https://github.com/franklinnolasco7/Vivant/commit/c6bd6dff00ec1fc94f0f4cb84eaf313e5a4252f7))
* show tooltip for truncated book title ([6cc1f31](https://github.com/franklinnolasco7/Vivant/commit/6cc1f31916438efeb8a03f1c329956c1ea3f7808))
* **tauri:** add safe external link opening and internal link resolution ([428450c](https://github.com/franklinnolasco7/Vivant/commit/428450cd369f15789a0059a7b862d500ffbddc3c))
* **tauri:** register add_reading_time command handler ([c2f5c9c](https://github.com/franklinnolasco7/Vivant/commit/c2f5c9c24210cd63b29d41f580b91735a1e37029))
* **tauri:** register add_reading_time command in main handler ([59bce86](https://github.com/franklinnolasco7/Vivant/commit/59bce86c15f9cfcd2d2c70ba6b4a037e41a5b8fa))
* **ui:** restructure title bar with SVG buttons and book info integration ([c801e56](https://github.com/franklinnolasco7/Vivant/commit/c801e56af48e819b5a7f04c79baa1c74fc1e777a))

# Changelog

All notable changes to this project will be documented in this file.
