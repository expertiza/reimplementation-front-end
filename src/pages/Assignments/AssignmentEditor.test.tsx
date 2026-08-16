import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, beforeEach, describe, expect, it } from "vitest";
import AssignmentEditor from "./AssignmentEditor";
import {
  AUTHOR_FEEDBACK_ASSIGNMENT_QUESTIONNAIRE_ID_FIELD,
  AUTHOR_FEEDBACK_QUESTIONNAIRE_FIELD,
  AUTHOR_FEEDBACK_RUBRIC_ROW_KEY,
  IAssignmentFormValues,
  TEAMMATE_REVIEW_ASSIGNMENT_QUESTIONNAIRE_ID_FIELD,
  TEAMMATE_REVIEW_QUESTIONNAIRE_FIELD,
  TEAMMATE_REVIEW_RUBRIC_ROW_KEY,
  transformAssignmentRequest,
  transformAssignmentResponse,
} from "./AssignmentUtil";

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

  it("uses distinct row keys for special rubric field names and control ids", () => {
    render(<AssignmentEditor mode="update" />);

    const getRow = (label: string) => {
      const row = screen.getByText(label).closest("tr");
      expect(row).not.toBeNull();
      return row as HTMLElement;
    };

    const expectRubricFields = (
      row: HTMLElement,
      questionnaireName: string,
      rowKey: number
    ) => {
      const questionnaire = within(row).getByRole("combobox") as HTMLSelectElement;
      const numericInputs = within(row).getAllByRole("spinbutton") as HTMLInputElement[];

      expect(questionnaire.name).toBe(questionnaireName);
      expect(questionnaire.id).toBe(`assignment-questionnaire_${rowKey}`);
      expect(numericInputs.map((input) => input.name)).toEqual([
        `weights[${rowKey}]`,
        `notification_limits[${rowKey}]`,
      ]);
      expect(numericInputs.map((input) => input.id)).toEqual([
        `assignment-weight_${rowKey}`,
        `assignment-notification_limit_${rowKey}`,
      ]);
    };

    expectRubricFields(getRow("Review round 2:"), "questionnaire_round_2", 2);
    expectRubricFields(getRow("Author feedback:"), AUTHOR_FEEDBACK_QUESTIONNAIRE_FIELD, AUTHOR_FEEDBACK_RUBRIC_ROW_KEY);
    expectRubricFields(getRow("Teammate review:"), TEAMMATE_REVIEW_QUESTIONNAIRE_FIELD, TEAMMATE_REVIEW_RUBRIC_ROW_KEY);
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

  it("serializes special rubric questionnaire fields", () => {
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
      [AUTHOR_FEEDBACK_QUESTIONNAIRE_FIELD]: 301,
      [AUTHOR_FEEDBACK_ASSIGNMENT_QUESTIONNAIRE_ID_FIELD]: 30,
      [TEAMMATE_REVIEW_QUESTIONNAIRE_FIELD]: 401,
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
      { questionnaire_id: 101, used_in_round: 1 },
      {
        id: 30,
        questionnaire_id: 301,
        used_in_round: AUTHOR_FEEDBACK_RUBRIC_ROW_KEY,
      },
      {
        questionnaire_id: 401,
        used_in_round: TEAMMATE_REVIEW_RUBRIC_ROW_KEY,
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

    expect(payload.assignment.vary_by_round).toBe(false);
  });

  it("maps topic rubric variation to vary_by_topic", () => {
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
      review_rubric_varies_by_topic: true,
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

    expect(payload.assignment.vary_by_topic).toBe(true);
  });
});

describe("transformAssignmentResponse", () => {
  it("prefills topic rubric variation from vary_by_topic", () => {
    const assignment = {
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
      vary_by_topic: true,
      num_review_rounds: 1,
      due_dates: [],
      assignment_questionnaires: [],
    };

    const values = transformAssignmentResponse(JSON.stringify(assignment));

    expect(values.review_rubric_varies_by_topic).toBe(true);
  });

  it("prefills special rubric questionnaire fields from assignment questionnaires", () => {
    const assignment = {
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
      vary_by_topic: false,
      num_review_rounds: 1,
      due_dates: [],
      assignment_questionnaires: [
        {
          id: 30,
          questionnaire_id: 301,
          used_in_round: AUTHOR_FEEDBACK_RUBRIC_ROW_KEY,
        },
        {
          id: 40,
          questionnaire_id: 401,
          used_in_round: TEAMMATE_REVIEW_RUBRIC_ROW_KEY,
        },
      ],
    };

    const values = transformAssignmentResponse(JSON.stringify(assignment));

    expect(values[AUTHOR_FEEDBACK_QUESTIONNAIRE_FIELD]).toBe(301);
    expect(values[AUTHOR_FEEDBACK_ASSIGNMENT_QUESTIONNAIRE_ID_FIELD]).toBe(30);
    expect(values[TEAMMATE_REVIEW_QUESTIONNAIRE_FIELD]).toBe(401);
    expect(values[TEAMMATE_REVIEW_ASSIGNMENT_QUESTIONNAIRE_ID_FIELD]).toBe(40);
  });
});
