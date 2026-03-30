import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CalibrationReview from "../CalibrationReview";

const sendRequestMock = vi.fn();

vi.mock("../../../hooks/useAPI", () => ({
  default: vi.fn(),
}));

import useAPI from "../../../hooks/useAPI";

const mockUseAPI = vi.mocked(useAPI);

describe("CalibrationReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    /** Stable return: Strict Mode mounts twice; alternating mocks would clear `report` on the 2nd call. */
    mockUseAPI.mockImplementation(() => ({
      data: {
        data: {
          assignment_id: 1,
          response_map_id: 9,
          team_id: null,
          team_name: "Team A",
          participant_name: "student1",
          rubric: [{ id: 10, txt: "Q1", weight: 1, seq: 1, question_type: "CriterionItem" }],
          instructor_response: {
            response_id: 1,
            additional_comment: "",
            is_submitted: false,
            answers: [{ item_id: 10, answer: 4, comments: "" }],
          },
          student_responses: [],
          per_item_summary: [
            {
              item_id: 10,
              seq: 1,
              txt: "Q1",
              question_type: "CriterionItem",
              agree: 2,
              near: 1,
              disagree: 0,
              distribution: { "4": 2, "3": 1 },
              instructor_score: 4,
            },
          ],
          submitted_content: { hyperlinks: [], files: [] },
          score_scale: { min: 0, max: 5 },
        },
        status: 200,
      },
      sendRequest: sendRequestMock,
      isLoading: false,
      error: null,
      reset: vi.fn(),
    }) as any);
  });

  it("loads report and renders stacked chart region", async () => {
    render(
      <MemoryRouter initialEntries={["/assignments/edit/1/calibration/9"]}>
        <Routes>
          <Route path="/assignments/edit/:id/calibration/:responseMapId" element={<CalibrationReview />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("calibration-stacked-chart")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Enter \/ edit instructor review/i })).toBeInTheDocument();
    expect(screen.getByText(/Review questionnaire \(rubric source\)/i)).toBeInTheDocument();
  });
});
