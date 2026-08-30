import { describe, expect, it } from "vitest";
import { dataUrlBytes } from "./clientPhoto";

describe("clientPhoto helpers", () => {
  it("estimates decoded byte length from a data URL", () => {
    // "AAAA" base64 → 3 bytes
    expect(dataUrlBytes("data:image/jpeg;base64,AAAA")).toBe(3);
  });
});
