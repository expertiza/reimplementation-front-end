import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import CalibrationInstructorReview from "../CalibrationInstructorReview";

const sendRequestMock = vi.fn();
const sendSaveMock = vi.fn();

vi.mock("../../../hooks/useAPI", () => ({
  default: vi.fn(),
}));

import useAPI from "../../../hooks/useAPI";

const mockUseAPI = vi.mocked(useAPI);

describe("CalibrationInstructorReview", () => {
  it("treats Criterion/Scale rubric types as scorable", async () => {
    mockUseAPI.mockImplementation((options?: { initialLoading?: boolean }) => {
      if (options?.initialLoading === false) {
        return {
          data: undefined,
          sendRequest: sendSaveMock,
          isLoading: false,
          error: null,
          reset: vi.fn(),
        } as any;
      }
      return {
        data: {
          data: {
            assignment_id: 1,
            response_map_id: 9,
            team_id: null,
            team_name: "Team A",
            participant_name: "student1",
            rubric: [
              { id: 10, txt: "Criterion row", weight: 1, seq: 1, question_type: "Criterion" },
              { id: 11, txt: "Scale row", weight: 1, seq: 2, question_type: "Scale" },
            ],
            instructor_response: { response_id: 1, additional_comment: "", is_submitted: false, answers: [] },
            student_responses: [],
            per_item_summary: [],
            submitted_content: { hyperlinks: [], files: [] },
            score_scale: { min: 0, max: 5 },
          },
          status: 200,
        },
        sendRequest: sendRequestMock,
        isLoading: false,
        error: null,
        reset: vi.fn(),
      } as any;
    });

    render(
      <MemoryRouter initialEntries={["/assignments/edit/1/calibration/9/review"]}>
        <Routes>
          <Route
            path="/assignments/edit/:id/calibration/:responseMapId/review"
            element={<CalibrationInstructorReview />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Criterion row/i)).toBeInTheDocument();
      expect(screen.getByText(/Scale row/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/No scored rubric items found/i)).not.toBeInTheDocument();
  });
});

