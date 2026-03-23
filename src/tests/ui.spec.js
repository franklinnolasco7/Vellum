import { describe, expect, it } from "vitest";
import { esc, coverColor } from "../ui.js";

describe("ui helpers", () => {
  it("escapes html-sensitive characters", () => {
    expect(esc('<div class="x">A&B</div>')).toBe("&lt;div class=&quot;x&quot;&gt;A&amp;B&lt;/div&gt;");
  });

  it("returns deterministic cover colors for the same title", () => {
    const a = coverColor("The Hobbit");
    const b = coverColor("The Hobbit");

    expect(a).toEqual(b);
    expect(a).toHaveProperty("bg");
    expect(a).toHaveProperty("ac");
  });
});
