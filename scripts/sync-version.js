#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export function syncVersion(root, version, log = () => {}) {
  if (!VERSION_PATTERN.test(version)) {
    throw new Error(`Invalid version: "${version}"`);
  }

  const packagePath = resolve(root, "package.json");
  const pkg = readJson(packagePath);
  const previousPackageVersion = pkg.version;
  pkg.version = version;
  writeJson(packagePath, pkg);
  log(`package.json: ${previousPackageVersion} → ${version}`);

  const packageLockPath = resolve(root, "package-lock.json");
  if (existsSync(packageLockPath)) {
    const packageLock = readJson(packageLockPath);
    const previousLockVersion = packageLock.version;
    packageLock.version = version;
    if (packageLock.packages?.[""]) {
      packageLock.packages[""].version = version;
    }
    writeJson(packageLockPath, packageLock);
    log(`package-lock.json: ${previousLockVersion} → ${version}`);
  }

  const tauriConfPath = resolve(root, "src-tauri", "tauri.conf.json");
  const tauriConf = readJson(tauriConfPath);
  const previousTauriVersion = tauriConf.version;
  tauriConf.version = version;
  writeJson(tauriConfPath, tauriConf);
  log(`tauri.conf.json: ${previousTauriVersion} → ${version}`);

  const cargoPath = resolve(root, "src-tauri", "Cargo.toml");
  const cargo = readFileSync(cargoPath, "utf8");
  const updatedCargo = cargo.replace(
    /^(version\s*=\s*)"[^"]*"/m,
    `$1"${version}"`,
  );
  if (updatedCargo === cargo && !cargo.includes(`version = "${version}"`)) {
    throw new Error("Could not find the package version in Cargo.toml");
  }
  writeFileSync(cargoPath, updatedCargo);
  log(`Cargo.toml: ${cargo.match(/^version\s*=\s*"([^"]*)"/m)?.[1] ?? "?"} → ${version}`);

  const cargoLockPath = resolve(root, "src-tauri", "Cargo.lock");
  if (existsSync(cargoLockPath)) {
    const cargoLock = readFileSync(cargoLockPath, "utf8");
    const updatedCargoLock = cargoLock.replace(
      /(\[\[package\]\]\s*\nname\s*=\s*"Vivant"\s*\nversion\s*=\s*")[^"]*"/,
      `$1${version}"`,
    );
    if (updatedCargoLock === cargoLock && !cargoLock.includes(`name = "Vivant"\nversion = "${version}"`)) {
      throw new Error("Could not find the Vivant package version in Cargo.lock");
    }
    writeFileSync(cargoLockPath, updatedCargoLock);
    log(`Cargo.lock: synchronized to ${version}`);
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  const root = resolve(dirname(scriptPath), "..");
  const requestedVersion = process.argv[2] ?? readJson(resolve(root, "package.json")).version;

  try {
    syncVersion(root, requestedVersion, console.log);
    console.log(`\nAll files synced to v${requestedVersion}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
