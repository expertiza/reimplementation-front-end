import React from "react";
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { vi, beforeEach, describe, expect, it } from "vitest";
import AssignmentEditor from "./AssignmentEditor";
import {
  transformAssignmentRequest,
  transformAssignmentResponse,
  normalizeReviewStrategyForSelect,
  IAssignmentFormValues,
} from "./AssignmentUtil";

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

const dispatchMock = vi.fn();
vi.mock("react-redux", () => ({
  useDispatch: () => dispatchMock,
  useSelector: (selector: any) => selector({ authentication: { isAuthenticated: true } }),
}));

let loaderData: any;
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useLoaderData: () => loaderData,
    useLocation: () => ({ state: {} }),
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: "1" }),
  };
});

vi.mock("./tabs/TopicsTab", () => ({ default: () => <div data-testid="topics-tab-stub" /> }));
vi.mock("./tabs/EtcTab",    () => ({ default: () => <div data-testid="etc-tab-stub" /> }));

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

describe("AssignmentEditor – Calibration tab", () => {
  beforeEach(() => {
    loaderData = { ...baseAssignment };
    sendRequestMock.mockClear();
    dispatchMock.mockClear();
  });

  const goToCalibrationTab = () => {
    render(<AssignmentEditor mode="update" />);
    fireEvent.click(screen.getByRole("tab", { name: /calibration/i }));
  };

  it("renders the username search input on the Calibration tab", () => {
    goToCalibrationTab();
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
  });

  it("Add button is disabled when the username field is empty", () => {
    goToCalibrationTab();
    expect(
      screen.getByRole("button", { name: /add calibration participant/i })
    ).toBeDisabled();
  });

  it("Add button becomes enabled once a username is typed", async () => {
    goToCalibrationTab();
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), "johndoe");
    expect(
      screen.getByRole("button", { name: /add calibration participant/i })
    ).not.toBeDisabled();
  });

  it("Add button is disabled again after the input is cleared", async () => {
    goToCalibrationTab();
    const input = screen.getByPlaceholderText(/enter username/i);
    await userEvent.type(input, "johndoe");
    await userEvent.clear(input);
    expect(
      screen.getByRole("button", { name: /add calibration participant/i })
    ).toBeDisabled();
  });

  it("calls sendRequest when Add is clicked with a non-empty username", async () => {
    goToCalibrationTab();
    await userEvent.type(screen.getByPlaceholderText(/enter username/i), "johndoe");
    fireEvent.click(screen.getByRole("button", { name: /add calibration participant/i }));
    await waitFor(() => expect(sendRequestMock).toHaveBeenCalled());
  });
});

describe("transformAssignmentRequest due dates", () => {
  it("includes due_dates_attributes for round rows with dates and permission columns", () => {
    const feb = new Date("2026-02-15T12:00:00.000Z");
    const values = {
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
      date_time: { 0: feb, 1: new Date("2026-02-20T12:00:00.000Z") },
      due_date_id_0: 100,
      submission_allowed: { 0: "yes", 1: "no" },
      review_allowed: { 0: "yes", 1: "yes" },
      teammate_allowed: { 0: "yes", 1: "yes" },
      metareview_allowed: { 0: "no", 1: "yes" },
      reminder: { 0: "2", 1: "3" },
      weights: [],
      notification_limits: [],
      use_date_updater: [],
    } as unknown as IAssignmentFormValues;

    const payload = JSON.parse(transformAssignmentRequest(values));
    const attrs = payload.assignment.due_dates_attributes;
    expect(attrs).toBeDefined();
    const rows = Object.values(attrs) as Record<string, unknown>[];
    const submission = rows.find((r) => r.deadline_type_id === 1);
    const review = rows.find((r) => r.deadline_type_id === 2);
    expect(submission).toMatchObject({
      id: 100,
      round: 1,
      submission_allowed_id: 3,
      review_allowed_id: 3,
      review_of_review_allowed_id: 1,
      threshold: 2,
      type: "AssignmentDueDate",
    });
    expect(submission?.due_at).toBe(feb.toISOString());
    expect(review).toMatchObject({
      round: 1,
      submission_allowed_id: 1,
      review_allowed_id: 3,
      review_of_review_allowed_id: 3,
      threshold: 3,
    });
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
    expect(payload.assignment.assignment_questionnaires_attributes).toEqual({
      "0": { id: 10, questionnaire_id: 101, used_in_round: 1 },
      "1": { questionnaire_id: 102, used_in_round: 2 },
    });
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
    expect(payload.assignment.assignment_questionnaires_attributes).toEqual({
      "0": { id: 99, questionnaire_id: 201, used_in_round: 1, questionnaire_weight: 100 },
    });
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

  it("always sends review_assignment_strategy (defaults to 1 when review_strategy is unset)", () => {
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
    expect(payload.assignment.review_assignment_strategy).toBe("1");
  });

  it("maps review-strategy tab fields to num_reviews_* , is_selfreview_enabled, and review_assignment_strategy", () => {
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
      review_strategy: "2",
      set_allowed_number_of_reviews_per_reviewer: 5,
      set_required_number_of_reviews_per_reviewer: 2,
      allow_self_reviews: true,
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
    expect(payload.assignment.review_assignment_strategy).toBe("2");
    expect(payload.assignment.num_reviews_allowed).toBe(5);
    expect(payload.assignment.num_reviews_required).toBe(2);
    expect(payload.assignment.is_selfreview_enabled).toBe(true);
  });

  it("sends review_assignment_strategy matching the strategy select value", () => {
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
      review_strategy: "3",
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
    expect(payload.assignment.review_assignment_strategy).toBe("3");
  });
});

describe("normalizeReviewStrategyForSelect / transformAssignmentResponse", () => {
  it("normalizes null, empty, and legacy strings to a valid select value", () => {
    expect(normalizeReviewStrategyForSelect(null)).toBe("1");
    expect(normalizeReviewStrategyForSelect("")).toBe("1");
    expect(normalizeReviewStrategyForSelect("Auto-Selected")).toBe("1");
    expect(normalizeReviewStrategyForSelect(2)).toBe("2");
    expect(normalizeReviewStrategyForSelect("3")).toBe("3");
  });

  it("maps API assignment JSON to review_strategy the select can display", () => {
    const form = transformAssignmentResponse({
      id: 1,
      name: "A",
      directory_path: "d",
      review_assignment_strategy: null,
      due_dates: [],
    } as unknown as Record<string, unknown>);
    expect(form.review_strategy).toBe("1");
  });

  it("maps num_reviews_* and is_selfreview_enabled into form fields", () => {
    const form = transformAssignmentResponse({
      id: 1,
      name: "A",
      directory_path: "d",
      num_reviews_allowed: 4,
      num_reviews_required: 3,
      is_selfreview_enabled: true,
      due_dates: [],
    } as unknown as Record<string, unknown>);
    expect(form.set_allowed_number_of_reviews_per_reviewer).toBe(4);
    expect(form.set_required_number_of_reviews_per_reviewer).toBe(3);
    expect(form.allow_self_reviews).toBe(true);
  });

  it("reads strategy from nested assignment or camelCase keys", () => {
    const nested = transformAssignmentResponse({
      assignment: { id: 1, name: "N", directory_path: "d", review_assignment_strategy: "2", due_dates: [] },
    } as unknown as Record<string, unknown>);
    expect(nested.review_strategy).toBe("2");

    const camel = transformAssignmentResponse({
      id: 1,
      name: "C",
      directory_path: "d",
      reviewAssignmentStrategy: "3",
      due_dates: [],
    } as unknown as Record<string, unknown>);
    expect(camel.review_strategy).toBe("3");
  });
});
