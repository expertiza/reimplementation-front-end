import { describe, expect, it } from "vitest";
import {
  BackendItem,
  mapItemToFormField,
  transformQuestionnaireRequest,
  transformQuestionnaireResponse,
} from "../QuestionnaireUtils";

describe("item dimensions across load and save", () => {
  it.each([
    ["TextArea", "Text area", "60,8"],
    ["TextField", "Text field", "40"],
    ["Criterion", "Criterion", "50,3"],
    ["Grid", "Grid", "3,2"],
  ])("preserves %s dimensions through both loading paths", (alias, label, size) => {
    const item: BackendItem = {
      id: 7, txt: "Prompt", seq: 1, item_type: alias,
      question_type: "Other", size, alternatives: "A,B,C|First,Second",
    };
    const response = transformQuestionnaireResponse({
      name: "Dimensions", private: false, questionnaire_type: "ReviewQuestionnaire",
      items: [item], min_item_score: 0, max_item_score: 5,
    });
    // The editor remaps loader items, while the fallback maps raw API items.
    const loaded = mapItemToFormField(response.items![0]);
    const fallback = mapItemToFormField(item);
    for (const mapped of [loaded, fallback]) {
      expect(mapped.item_type).toBe(label);
      const request = transformQuestionnaireRequest({ ...response, items: [mapped] });
      expect(request.questionnaire.items_attributes[0]).toMatchObject({
        id: 7, item_type: label, size,
      });
    }
  });

  it("supports legacy-only types and prefers item_type when both are supplied", () => {
    expect(mapItemToFormField({ question_type: "TextArea", size: "45,6" })).toMatchObject({
      item_type: "Text area", textarea_width: "45", textarea_height: "6",
    });
    expect(mapItemToFormField({ item_type: "TextField", question_type: "TextArea", size: "45" }))
      .toMatchObject({ item_type: "Text field", textbox_width: "45" });
  });
});
