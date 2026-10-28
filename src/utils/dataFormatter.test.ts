import { capitalizeFirstWord, formatDate } from "./dataFormatter";

describe("capitalizeFirstWord", () => {
  test.each([undefined, null, ""])("returns an empty string for %s", (input) => {
    expect(capitalizeFirstWord(input)).toBe("");
  });

  test("capitalizes the first character and lowercases the rest", () => {
    expect(capitalizeFirstWord("hELLO WORLD")).toBe("Hello world");
  });

  test("preserves a single capitalized character", () => {
    expect(capitalizeFirstWord("A")).toBe("A");
  });
});

describe("formatDate", () => {
  test.each([undefined, null, ""])("returns an empty string for %s", (input) => {
    expect(formatDate(input)).toBe("");
  });

  test("returns an empty string for an invalid date", () => {
    expect(formatDate("not-a-date")).toBe("");
  });

  test("formats a valid local date in a readable US format", () => {
    expect(formatDate("2023-10-12T15:45:00")).toBe("Oct 12, 2023, 3:45 PM");
  });
});
