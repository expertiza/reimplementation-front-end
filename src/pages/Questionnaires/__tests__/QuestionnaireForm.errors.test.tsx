import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import QuestionnaireForm from "../QuestionnaireForm";

vi.mock("hooks/useAPI", () => ({
  default: () => ({
    data: { data: ["Criterion", "Scale"] },
    sendRequest: vi.fn(),
  }),
}));

describe("QuestionnaireForm", () => {
  it("does not crash when items validation error is nested object/array", async () => {
    const onSubmit = vi.fn();
    const initialValues = {
      name: "q1",
      questionnaire_type: "Review rubric",
      private: false,
      min_question_score: 0,
      max_question_score: 10,
      // One row with missing txt should create nested item-level error, not string at errors.items
      items: [
        {
          id: undefined,
          txt: "",
          question_type: "Criterion",
          weight: 1,
          alternatives: "",
          min_label: "Strongly disagree",
          max_label: "Strongly agree",
          seq: 1,
          break_before: true,
        },
      ],
    };

    render(<QuestionnaireForm initialValues={initialValues} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    // Form remains rendered (no React crash due to object child)
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });
});

