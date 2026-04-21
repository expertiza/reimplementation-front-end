import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, beforeEach, describe, expect, it } from "vitest";
import AssignmentEditor from "./AssignmentEditor";
import { transformAssignmentRequest, IAssignmentFormValues } from "./AssignmentUtil";

// Mock useAPI to avoid real network calls
const sendRequestMock = vi.fn();
vi.mock("../../hooks/useAPI", () => {
  return {
    __esModule: true,
    default: () => ({
      data: null,
      error: null,
      sendRequest: sendRequestMock,
    }),
  };
});

// Provide minimal redux wiring
const dispatchMock = vi.fn();
vi.mock("react-redux", () => ({
  useDispatch: () => dispatchMock,
  useSelector: (selector: any) => selector({ authentication: { isAuthenticated: true } }),
}));

// Provide router context hooks
let loaderData: any;
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useLoaderData: () => loaderData,
    useLocation: () => ({ state: {} }),
    useNavigate: () => vi.fn(),
  };
});

const baseAssignment = {
  id: 1,
  name: "Test Assignment",
  review_rubric_varies_by_round: true,
  number_of_review_rounds: 2,
  assignment_questionnaires: [
    { id: 10, used_in_round: 1, questionnaire: { id: 101, name: "Round 1 Rubric" } },
    { id: 11, used_in_round: 2, questionnaire: { id: 102, name: "Round 2 Rubric" } },
  ],
  questionnaires: [
    { id: 101, name: "Round 1 Rubric" },
    { id: 102, name: "Round 2 Rubric" },
    { id: 200, name: "Unlinked Rubric" },
  ],
  weights: [],
};

describe("AssignmentEditor rubrics tab", () => {
  beforeEach(() => {
    loaderData = { ...baseAssignment };
    sendRequestMock.mockClear();
    dispatchMock.mockClear();
  });

  it("shows one row per review round when rubrics vary by round", () => {
    render(<AssignmentEditor mode="update" />);

    expect(screen.getByText("Review round 1:")).toBeInTheDocument();
    expect(screen.getByText("Review round 2:")).toBeInTheDocument();
  });

  it("shows a single rubric row when rubrics do not vary by round", () => {
    loaderData = { ...baseAssignment, review_rubric_varies_by_round: false };

    render(<AssignmentEditor mode="update" />);

    expect(screen.getByText("Review rubric:")).toBeInTheDocument();
    expect(screen.queryByText("Review round 2:")).not.toBeInTheDocument();
  });

  it("prefills the selected questionnaire per round from loader data", () => {
    render(<AssignmentEditor mode="update" />);

    const round1Row = screen.getByText("Review round 1:").closest("tr");
    expect(round1Row).not.toBeNull();
    const select = within(round1Row as HTMLElement).getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("101");
  });

  it("lists all available questionnaires, including unlinked ones", () => {
    render(<AssignmentEditor mode="update" />);

    const allOptions = screen.getAllByRole("option").map((opt) => opt.textContent);
    expect(allOptions).toContain("Unlinked Rubric");
  });

});

describe("transformAssignmentRequest", () => {
  it("builds assignment_questionnaires_attributes for selected rounds", () => {
    const values: IAssignmentFormValues = {
      id: 1,
      name: "Test Assignment",
      directory_path: "assignment_1",
      spec_location: "http://example.com",
      private: false,
      show_template_review: false,
      require_quiz: false,
      has_badge: false,
      staggered_deadline: false,
      is_calibrated: false,
      review_rubric_varies_by_round: true,
      number_of_review_rounds: 2,
      questionnaire_round_1: 101,
      assignment_questionnaire_id_1: 10,
      questionnaire_round_2: 102,
      weights: [],
      notification_limits: [],
      use_date_updater: [],
      submission_allowed: [],
      review_allowed: [],
      teammate_allowed: [],
      metareview_allowed: [],
      reminder: [],
    };

    const payload = JSON.parse(transformAssignmentRequest(values));

    expect(payload.assignment.assignment_questionnaires_attributes).toEqual([
      { id: 10, questionnaire_id: 101, used_in_round: 1 },
      { questionnaire_id: 102, used_in_round: 2 },
    ]);
    expect(payload.assignment.vary_by_round).toBe(true);
    expect(payload.assignment.rounds_of_reviews).toBe(2);
  });

  it("includes existing id when present and skips rounds without selection", () => {
    const values: IAssignmentFormValues = {
      id: 1,
      name: "Test Assignment",
      directory_path: "assignment_1",
      spec_location: "http://example.com",
      private: false,
      show_template_review: false,
      require_quiz: false,
      has_badge: false,
      staggered_deadline: false,
      is_calibrated: false,
      review_rubric_varies_by_round: true,
      number_of_review_rounds: 2,
      questionnaire_round_1: 201,
      assignment_questionnaire_id_1: 99,
      weights: [],
      notification_limits: [],
      use_date_updater: [],
      submission_allowed: [],
      review_allowed: [],
      teammate_allowed: [],
      metareview_allowed: [],
      reminder: [],
    };

    const payload = JSON.parse(transformAssignmentRequest(values));

    expect(payload.assignment.assignment_questionnaires_attributes).toEqual([
      { id: 99, questionnaire_id: 201, used_in_round: 1 },
    ]);
  });

  it("sets vary_by_round to false when checkbox is unchecked", () => {
    const values: IAssignmentFormValues = {
      id: 1,
      name: "Test Assignment",
      directory_path: "assignment_1",
      spec_location: "http://example.com",
      private: false,
      show_template_review: false,
      require_quiz: false,
      has_badge: false,
      staggered_deadline: false,
      is_calibrated: false,
      review_rubric_varies_by_round: false,
      number_of_review_rounds: 1,
      weights: [],
      notification_limits: [],
      use_date_updater: [],
      submission_allowed: [],
      review_allowed: [],
      teammate_allowed: [],
      metareview_allowed: [],
      reminder: [],
    };

    const payload = JSON.parse(transformAssignmentRequest(values));

    expect(payload.assignment.vary_by_round).toBe(false);
  });
});
