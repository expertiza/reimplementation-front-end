import { describe, expect, it } from "vitest";

import { QuestionnaireTypes, transformQuestionnaireRequest } from "./QuestionnaireUtils";

describe("Questionnaire type mappings", () => {
  it("includes Review in the questionnaire type list", () => {
    expect(QuestionnaireTypes).toContain("Review");
  });

  it("builds create payloads with backend questionnaire types", () => {
    const payload = transformQuestionnaireRequest({
      name: "Security Review Rubric",
      questionnaire_type: "Review",
      private: false,
      min_question_score: 0,
      max_question_score: 5,
      items: [],
    });

    expect(payload.questionnaire.questionnaire_type).toBe("ReviewQuestionnaire");
  });
});
