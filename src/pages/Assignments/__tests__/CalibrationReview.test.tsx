import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CalibrationReview from "../CalibrationReview";

const sendRequestMock = vi.fn();
const sendBeginMock = vi.fn();

vi.mock("../../../hooks/useAPI", () => ({
  default: vi.fn(),
}));

import useAPI from "../../../hooks/useAPI";

const mockUseAPI = vi.mocked(useAPI);

describe("CalibrationReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let invocation = 0;
    mockUseAPI.mockImplementation(() => {
      const slot = invocation++;
      if (slot % 2 === 0) {
        return {
          data: {
            data: {
              assignment_id: 1,
              response_map_id: 9,
              team_id: null,
              team_name: "Team A",
              participant_name: "student1",
              rubric: [{ id: 10, txt: "Q1", weight: 1, seq: 1, question_type: "scale" }],
              instructor_response: {
                response_id: 1,
                additional_comment: "",
                answers: [{ item_id: 10, answer: 4, comments: "" }],
              },
              student_responses: [],
              per_item_summary: [
                {
                  item_id: 10,
                  seq: 1,
                  txt: "Q1",
                  question_type: "scale",
                  agree: 2,
                  near: 1,
                  disagree: 0,
                  distribution: { "4": 2, "3": 1 },
                  instructor_score: 4,
                },
              ],
              submitted_content: { hyperlinks: [], files: [] },
            },
          },
          sendRequest: sendRequestMock,
          isLoading: false,
          error: null,
          reset: vi.fn(),
        } as any;
      }
      return {
        data: null,
        sendRequest: sendBeginMock,
        isLoading: false,
        error: null,
        reset: vi.fn(),
      } as any;
    });
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
    expect(screen.getByText(/Calibration:/i)).toBeInTheDocument();
  });
});
