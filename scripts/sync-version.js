#!/usr/bin/env node
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readJson, syncVersion } from "./version-sync.js";

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), "..");
const requestedVersion = process.argv[2] ?? readJson(resolve(root, "package.json")).version;

try {
  syncVersion(root, requestedVersion, console.log);
  console.log(`\nAll files synced to v${requestedVersion}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
