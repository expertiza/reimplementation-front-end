import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import CalibrationReview from "../CalibrationReview";

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock("../../../utils/axios_client", () => ({
  default: { get: mockGet },
}));

const mockReport = {
  map_id: 8,
  assignment_id: 1,
  reviewee_id: 5,
  rubric_items: [{ id: 11, txt: "Code quality", seq: 1, min_score: 0, max_score: 5 }],
  instructor_response: {
    id: 21,
    map_id: 8,
    reviewer_id: 15,
    reviewer_name: "instructor",
    is_submitted: true,
    updated_at: "2026-04-23T16:00:00Z",
    answers: [{ item_id: 11, score: 4, comments: "Good code" }],
  },
  student_responses: [
    {
      id: 31,
      map_id: 9,
      reviewer_id: 22,
      reviewer_name: "Student A",
      is_submitted: true,
      updated_at: "2026-04-23T16:00:00Z",
      answers: [{ item_id: 11, score: 3, comments: "Mostly good" }],
    },
  ],
  per_item_summary: [
    {
      item_id: 11,
      item_label: "Code quality",
      item_seq: 1,
      instructor_score: 4,
      instructor_comment: "Good code",
      bucket_counts: { "0": 0, "1": 0, "2": 0, "3": 1, "4": 0, "5": 0 },
      student_response_count: 1,
    },
  ],
  submitted_content: { hyperlinks: [], files: [] },
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/assignments/1/calibration/8"]}>
      <Routes>
        <Route
          path="/assignments/:assignmentId/calibration/:mapId"
          element={<CalibrationReview />}
        />
      </Routes>
    </MemoryRouter>
  );

describe("CalibrationReview page", () => {
  afterEach(() => vi.clearAllMocks());

  test("shows loading spinner then renders report heading and student count on success", async () => {
    mockGet.mockResolvedValueOnce({ data: mockReport } as any);

    renderPage();

    expect(screen.getByText(/loading calibration report/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText(/calibration report/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/1 student response/i)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /class comparison/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /rubric detail/i })).toBeInTheDocument();
  });

  test("shows error alert when the API call fails", async () => {
    mockGet.mockRejectedValueOnce({
      response: { data: { error: "Not authorized" } },
    });

    renderPage();

    await waitFor(() =>
      expect(screen.getByText(/unable to load calibration report/i)).toBeInTheDocument()
    );
    expect(screen.getByText("Not authorized")).toBeInTheDocument();
  });
});
