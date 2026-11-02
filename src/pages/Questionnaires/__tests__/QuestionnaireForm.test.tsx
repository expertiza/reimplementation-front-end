import React from "react";
import { vi, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuestionnaireForm from "../QuestionnaireForm";

const sendRequest = vi.fn();
vi.mock("hooks/useAPI", () => ({ default: () => ({ sendRequest }) }));
vi.mock("../QuestionnaireItemsFieldArray", () => ({ default: () => null }));

it("renders nested item validation errors without rendering objects as React children", async () => {
  render(<QuestionnaireForm initialValues={{
    name: "Invalid item", questionnaire_type: "Review", private: false,
    min_item_score: 0, max_item_score: 5,
    items: [{ txt: "", item_type: "Text area", seq: 1 }],
  }} onSubmit={vi.fn()} />);
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(await screen.findByText("Item #1 (Prompt): Item text is required")).toBeInTheDocument();
});
