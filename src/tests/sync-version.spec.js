import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { syncVersion } from "../../scripts/sync-version.js";

const tempRoots = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("syncVersion", () => {
  it("updates every manifest used by the app and release build", () => {
    // Arrange
    const root = mkdtempSync(join(tmpdir(), "vivant-version-"));
    tempRoots.push(root);
    mkdirSync(join(root, "src-tauri"));
    writeJson(join(root, "package.json"), { name: "vivant", version: "0.1.0" });
    writeJson(join(root, "package-lock.json"), {
      name: "vivant",
      version: "0.1.0",
      packages: { "": { name: "vivant", version: "0.1.0" } },
    });
    writeJson(join(root, "src-tauri", "tauri.conf.json"), {
      productName: "Vivant",
      version: "0.1.0",
    });
    writeFileSync(
      join(root, "src-tauri", "Cargo.toml"),
      '[package]\nname = "Vivant"\nversion = "0.1.0"\n',
    );
    writeFileSync(
      join(root, "src-tauri", "Cargo.lock"),
      'version = 4\n\n[[package]]\nname = "Vivant"\nversion = "0.1.0"\n',
    );

    // Act
    syncVersion(root, "1.2.3");

    // Assert
    expect(readJson(join(root, "package.json")).version).toBe("1.2.3");
    expect(readJson(join(root, "package-lock.json")).version).toBe("1.2.3");
    expect(readJson(join(root, "package-lock.json")).packages[""].version).toBe("1.2.3");
    expect(readJson(join(root, "src-tauri", "tauri.conf.json")).version).toBe("1.2.3");
    expect(readFileSync(join(root, "src-tauri", "Cargo.toml"), "utf8"))
      .toContain('version = "1.2.3"');
    expect(readFileSync(join(root, "src-tauri", "Cargo.lock"), "utf8"))
      .toContain('name = "Vivant"\nversion = "1.2.3"');
  });
});

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
