import { describe, it, expect } from "vitest";
import { coerceQuestionnaireDisplayText, normalizeQuestionnaireItemsResponse } from "../QuestionnaireUtils";

describe("QuestionnaireUtils", () => {
  describe("coerceQuestionnaireDisplayText", () => {
    it("coerces nested { txt } objects into strings", () => {
      expect(coerceQuestionnaireDisplayText({ txt: "Hello" })).toBe("Hello");
    });

    it("returns empty string for unknown objects", () => {
      expect(coerceQuestionnaireDisplayText({ nope: "x" })).toBe("");
    });
  });

  describe("normalizeQuestionnaireItemsResponse", () => {
    it("normalizes item.txt when API returns nested { txt }", () => {
      const rows = normalizeQuestionnaireItemsResponse([{ id: 1, txt: { txt: "Criterion A" }, question_type: "Criterion" }]);
      expect(rows).toHaveLength(1);
      expect(rows[0].txt).toBe("Criterion A");
    });
  });
});

