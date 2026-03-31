import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
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

describe("AssignmentEditor review strategy calibration behavior", () => {
  beforeEach(() => {
    loaderData = { ...baseAssignment, calibration_for_training: false, is_calibrated: false };
    sendRequestMock.mockClear();
    dispatchMock.mockClear();
  });

  it("shows uncalibrated label and calibrated field in Static strategy when calibration is enabled", () => {
    render(<AssignmentEditor mode="update" />);

    fireEvent.click(screen.getByRole("tab", { name: /Review strategy/i }));
    expect(
      screen.getByText("Number of reviews each reviewer is required to do")
    ).toBeInTheDocument();
    expect(screen.queryByText("Number of calibrated reviews")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /General/i }));
    fireEvent.click(screen.getByLabelText("Calibration for training?"));

    fireEvent.click(screen.getByRole("tab", { name: /Review strategy/i }));
    expect(
      screen.getByText("Number of uncalibrated reviews each reviewer is required to do")
    ).toBeInTheDocument();
    expect(screen.getByText("Number of calibrated reviews")).toBeInTheDocument();
  });

  it("keeps calibrated field hidden in Static strategy when calibration is disabled", () => {
    render(<AssignmentEditor mode="update" />);

    fireEvent.click(screen.getByRole("tab", { name: /Review strategy/i }));

    expect(
      screen.getByText("Number of reviews each reviewer is required to do")
    ).toBeInTheDocument();
    expect(screen.queryByText("Number of uncalibrated reviews each reviewer is required to do")).not.toBeInTheDocument();
    expect(screen.queryByText("Number of calibrated reviews")).not.toBeInTheDocument();
  });
});

describe("AssignmentEditor review mapping strategy behavior", () => {
  beforeEach(() => {
    loaderData = {
      ...baseAssignment,
      calibration_for_training: false,
      is_calibrated: false,
      has_topics: false,
    };
    sendRequestMock.mockClear();
    dispatchMock.mockClear();
  });

  it("maps legacy Auto-Selected strategy to Dynamic UI fields", () => {
    loaderData = { ...loaderData, review_strategy: "Auto-Selected" };
    render(<AssignmentEditor mode="update" />);

    fireEvent.click(screen.getByRole("tab", { name: /Review strategy/i }));

    expect(screen.getByText("Number of reviews each reviewer is required to do")).toBeInTheDocument();
    expect(screen.getByText("Max. number of reviews each reviewer is allowed to do")).toBeInTheDocument();
    expect(screen.queryByText("Round Robin Assignment")).not.toBeInTheDocument();
  });

  it("maps legacy Instructor-Selected strategy to Static UI fields", () => {
    loaderData = { ...loaderData, review_strategy: "Instructor-Selected" };
    render(<AssignmentEditor mode="update" />);

    fireEvent.click(screen.getByRole("tab", { name: /Review strategy/i }));

    expect(screen.getByText("Round Robin Assignment")).toBeInTheDocument();
    expect(screen.getByText("Random Assignment")).toBeInTheDocument();
    expect(screen.getByText("Upload Spreadsheet Assignment")).toBeInTheDocument();
  });

  it("shows upload input and hides required-review fields when static upload strategy is selected", () => {
    render(<AssignmentEditor mode="update" />);

    fireEvent.click(screen.getByRole("tab", { name: /Review strategy/i }));
    fireEvent.click(screen.getByLabelText("Upload Spreadsheet Assignment"));

    const uploadInput = document.querySelector('input[name="spreadsheetFile"]');
    expect(uploadInput).toBeInTheDocument();
    expect(screen.queryByText("Number of reviews each reviewer is required to do")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Assign reviewers to review projects that have not yet been submitted")
    ).not.toBeInTheDocument();
  });

  it("shows review topic threshold only for Dynamic strategy when assignment has topics", () => {
    loaderData = { ...loaderData, review_strategy: "Dynamic", has_topics: true };
    render(<AssignmentEditor mode="update" />);

    fireEvent.click(screen.getByRole("tab", { name: /Review strategy/i }));

    expect(screen.getByText("Review topic threshold (k):")).toBeInTheDocument();
  });

  it("shows team-based review controls in Dynamic strategy only when has teams is enabled", () => {
    loaderData = { ...loaderData, review_strategy: "Dynamic", has_teams: false };
    render(<AssignmentEditor mode="update" />);

    fireEvent.click(screen.getByRole("tab", { name: /Review strategy/i }));
    expect(screen.queryByText("Is reviewing role based?")).not.toBeInTheDocument();
    expect(screen.queryByText("Are reviews to be done by teams?")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /General/i }));
    fireEvent.click(screen.getByLabelText("Has teams?"));

    fireEvent.click(screen.getByRole("tab", { name: /Review strategy/i }));
    expect(screen.getByText("Is reviewing role based?")).toBeInTheDocument();
    expect(screen.getByText("Are reviews to be done by teams?")).toBeInTheDocument();
  });
});

describe("transformAssignmentRequest", () => {
  it("does not include unsupported questionnaire nested attributes", () => {
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

    expect(payload.assignment.assignment_questionnaires_attributes).toBeUndefined();
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

    expect(payload.assignment.assignment_questionnaires_attributes).toBeUndefined();
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
