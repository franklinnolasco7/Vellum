#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const version = pkg.version;
if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error(`Invalid version in package.json: "${version}"`);
  process.exit(1);
}

const tauriConfPath = resolve(root, "src-tauri/tauri.conf.json");
const tauriConf = JSON.parse(readFileSync(tauriConfPath, "utf8"));
const prevTauri = tauriConf.version;
tauriConf.version = version;
writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + "\n");
console.log(`tauri.conf.json: ${prevTauri} → ${version}`);

const cargoPath = resolve(root, "src-tauri/Cargo.toml");
let cargo = readFileSync(cargoPath, "utf8");
const updated = cargo.replace(
  /^(version\s*=\s*)"[^"]*"/m,
  `$1"${version}"`
);
if (updated === cargo) {
  console.log("Cargo.toml: already up to date");
} else {
  const prev = cargo.match(/^version\s*=\s*"([^"]*)"/m)?.[1] ?? "?";
  writeFileSync(cargoPath, updated);
  console.log(`Cargo.toml: ${prev} → ${version}`);
}

console.log(`\nAll files synced to v${version}`);
