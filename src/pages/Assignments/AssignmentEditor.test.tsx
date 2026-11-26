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
type AuthFixture = { isAuthenticated: boolean; user: { role: string } | null };
const dispatchMock = vi.fn();
let authState: AuthFixture = { isAuthenticated: true, user: null };
vi.mock("react-redux", () => ({
  useDispatch: () => dispatchMock,
  useSelector: (selector: (s: { authentication: AuthFixture }) => unknown) =>
    selector({ authentication: authState }),
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

// RubricsContent groups its dropdowns by questionnaire_type, and AssignmentUtil
// classifies each assignment_questionnaire by its nested questionnaire's type, so
// both have to carry one or every rubric row comes back empty.
const reviewQuestionnaires = [
  { id: 101, name: "Round 1 Rubric", questionnaire_type: "ReviewQuestionnaire" },
  { id: 102, name: "Round 2 Rubric", questionnaire_type: "ReviewQuestionnaire" },
  { id: 200, name: "Unlinked Rubric", questionnaire_type: "ReviewQuestionnaire" },
];

// AssignmentEditor merges useLoaderData() straight into the form values — it does
// not run AssignmentUtil's transform — so this fixture stands in for that
// transform's OUTPUT, with the per-round fields already flattened.
const baseAssignment = {
  id: 1,
  name: "Test Assignment",
  review_rubric_varies_by_round: true,
  number_of_review_rounds: 2,
  questionnaire_round_1: 101,
  questionnaire_round_2: 102,
  assignment_questionnaires: [
    { id: 10, used_in_round: 1, questionnaire_id: 101, questionnaire: reviewQuestionnaires[0] },
    { id: 11, used_in_round: 2, questionnaire_id: 102, questionnaire: reviewQuestionnaires[1] },
  ],
  questionnaires: reviewQuestionnaires,
  weights: [],
};

describe("AssignmentEditor rubrics tab", () => {
  beforeEach(() => {
    loaderData = { ...baseAssignment };
    sendRequestMock.mockClear();
    dispatchMock.mockClear();
    authState = { isAuthenticated: true, user: null };
  });

  it("shows one row per review round when rubrics vary by round", () => {
    render(<AssignmentEditor mode="update" />);

    expect(screen.getByText("Review Round 1")).toBeInTheDocument();
    expect(screen.getByText("Review Round 2")).toBeInTheDocument();
  });

  it("shows a single rubric row when rubrics do not vary by round", () => {
    loaderData = {
      ...baseAssignment,
      review_rubric_varies_by_round: false,
      number_of_review_rounds: 1,
      review_questionnaire_id: 101,
    };

    render(<AssignmentEditor mode="update" />);

    // Scoped to the label cell: "Review" on its own is the un-rounded row.
    expect(screen.getByText("Review", { selector: "td" })).toBeInTheDocument();
    expect(screen.queryByText("Review Round 2")).not.toBeInTheDocument();
  });

  it("prefills the selected questionnaire per round from loader data", () => {
    render(<AssignmentEditor mode="update" />);

    const round1Row = screen.getByText("Review Round 1").closest("tr");
    expect(round1Row).not.toBeNull();
    // The row also holds the display-style select, so take the first one.
    const [select] = within(round1Row as HTMLElement).getAllByRole("combobox");
    expect((select as HTMLSelectElement).value).toBe("101");
  });

  it("lists all available questionnaires, including unlinked ones", () => {
    render(<AssignmentEditor mode="update" />);

    const allOptions = screen.getAllByRole("option").map((opt) => opt.textContent);
    expect(allOptions).toContain("Unlinked Rubric");
  });
});

describe("AssignmentEditor impersonation gate", () => {
  beforeEach(() => {
    loaderData = { ...baseAssignment };
    sendRequestMock.mockClear();
    dispatchMock.mockClear();
    authState = { isAuthenticated: true, user: null };
  });

  it("shows the form for an instructor (no gate)", () => {
    authState = { isAuthenticated: true, user: { role: "Instructor" } };
    render(<AssignmentEditor mode="update" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Review Round 1")).toBeInTheDocument();
  });

  it("shows impersonation message for Admin in update mode", () => {
    authState = { isAuthenticated: true, user: { role: "Administrator" } };
    render(<AssignmentEditor mode="update" />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/impersonate the instructor/i)).toBeInTheDocument();
    expect(screen.queryByText("Review round 1:")).not.toBeInTheDocument();
  });

  it("shows impersonation message for Super Admin in update mode", () => {
    authState = { isAuthenticated: true, user: { role: "Super Administrator" } };
    render(<AssignmentEditor mode="update" />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/impersonate the instructor/i)).toBeInTheDocument();
    expect(screen.queryByText("Review round 1:")).not.toBeInTheDocument();
  });

  it("does NOT show gate for Admin in create mode", () => {
    authState = { isAuthenticated: true, user: { role: "Administrator" } };
    render(<AssignmentEditor mode="create" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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

    // Each rubric row also carries its weight, notification limit and display style.
    expect(payload.assignment.assignment_questionnaires_attributes).toEqual([
      {
        id: 10,
        questionnaire_id: 101,
        used_in_round: 1,
        questionnaire_weight: 0,
        notification_limit: 0,
        dropdown: false,
      },
      {
        questionnaire_id: 102,
        used_in_round: 2,
        questionnaire_weight: 0,
        notification_limit: 0,
        dropdown: false,
      },
    ]);
    // The payload uses the Rails alias_attribute names, not the raw columns:
    // review_rubric_varies_by_round → vary_by_round, number_of_review_rounds →
    // rounds_of_reviews (see Assignment model and assignment_params).
    expect(payload.assignment.review_rubric_varies_by_round).toBe(true);
    expect(payload.assignment.number_of_review_rounds).toBe(2);
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
      {
        id: 99,
        questionnaire_id: 201,
        used_in_round: 1,
        questionnaire_weight: 0,
        notification_limit: 0,
        dropdown: false,
      },
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

    expect(payload.assignment.review_rubric_varies_by_round).toBe(false);
  });

  it("includes instructor_grade_min_score in the request payload", () => {
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
      instructor_grade_min_score: 0,
      instructor_grade_max_score: 5,
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

    expect(payload.assignment.instructor_grade_min_score).toBe(0);
    expect(payload.assignment.instructor_grade_max_score).toBe(5);
  });

  it("sends null for instructor_grade_min/max when not set", () => {
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

    expect(payload.assignment.instructor_grade_min_score).toBeNull();
    expect(payload.assignment.instructor_grade_max_score).toBeNull();
  });
});
