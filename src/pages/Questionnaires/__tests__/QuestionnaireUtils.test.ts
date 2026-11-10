import { describe, expect, it } from "vitest";
import {
  BackendItem,
  getItemTypeHandler,
  textAreaNeededOnUI,
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

describe("item type handlers", () => {
  it("flags only Text area and Criterion as needing the text-area UI", () => {
    expect(textAreaNeededOnUI("Text area")).toBe(true);
    expect(textAreaNeededOnUI("Criterion")).toBe(true);
    for (const type of ["Text field", "Grid", "Dropdown", "Section header", ""]) {
      expect(textAreaNeededOnUI(type)).toBe(false);
    }
  });

  it("round-trips Grid labels and dimensions", () => {
    const handler = getItemTypeHandler("Grid");
    const form = handler.fromBackend("3,2", "A,B,C|First,Second");
    expect(form).toEqual({ column_names: "A,B,C", row_names: "First,Second", columns: 3, rows: 2 });
    expect(handler.toBackend({ txt: "", seq: 1, item_type: "Grid", ...form })).toEqual({
      size: "3,2",
      alternatives: "A,B,C|First,Second",
    });
  });

  it("treats invalid Grid dimensions as empty and keeps size blank on save", () => {
    const handler = getItemTypeHandler("Grid");
    const form = handler.fromBackend("x,0", "");
    expect(form).toMatchObject({ columns: "", rows: "" });
    expect(handler.toBackend({ txt: "", seq: 1, item_type: "Grid", ...form }).size).toBe(",");
  });

  it("leaves types without a handler untouched", () => {
    const handler = getItemTypeHandler("Dropdown");
    expect(handler.fromBackend("5", "a,b")).toEqual({});
    expect(handler.toBackend({ txt: "", seq: 1, item_type: "Dropdown", size: "5", alternatives: "a,b" }))
      .toEqual({ size: "5", alternatives: "a,b" });
  });
});
