import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv";

describe("parseCsv", () => {
  it("handles a BOM, CRLF, blank lines, quoted commas, quotes and line breaks", () => {
    expect(parseCsv('﻿a,b\r\n\r\n"x, y","say ""hi""\nagain"\r\n')).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"\nagain'],
    ]);
  });

  it("returns no rows for an empty file", () => {
    expect(parseCsv("\n \n")).toEqual([]);
  });
});
