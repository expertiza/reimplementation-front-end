import React from "react";
import { render, screen, within, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { vi, beforeEach, describe, expect, it } from "vitest";
import AssignmentEditor from "./AssignmentEditor";
import { transformAssignmentRequest, IAssignmentFormValues } from "./AssignmentUtil";
import Table from "../../components/Table/Table";
import type { ColumnDef } from "@tanstack/react-table";

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
    useParams: () => ({ id: "1" }),
  };
});

// Mock heavy sub-tabs so they don't pull in unrelated deps
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

// ---------------------------------------------------------------------------
// Rubrics tab (original tests)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Rendering modes & navigation tabs
// ---------------------------------------------------------------------------
describe("AssignmentEditor – rendering modes", () => {
  beforeEach(() => {
    loaderData = { ...baseAssignment };
    sendRequestMock.mockClear();
    dispatchMock.mockClear();
  });

  it("shows 'Creating Assignment' heading in create mode", () => {
    render(<AssignmentEditor mode="create" />);
    expect(screen.getByRole("heading", { name: /creating assignment/i })).toBeInTheDocument();
  });

  it("shows 'Editing Assignment' heading in update mode", () => {
    render(<AssignmentEditor mode="update" />);
    expect(screen.getByRole("heading", { name: /editing assignment/i })).toBeInTheDocument();
  });

  it("renders all expected navigation tabs", () => {
    render(<AssignmentEditor mode="update" />);
    const tabNames = ["General", "Topics", "Rubrics", "Review strategy", "Due dates", "Calibration", "Etc."];
    for (const name of tabNames) {
      expect(screen.getByRole("tab", { name })).toBeInTheDocument();
    }
  });

  it("renders the Save button and Back link", () => {
    render(<AssignmentEditor mode="create" />);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("link",   { name: /back/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// General tab – field presence & conditional rendering
// ---------------------------------------------------------------------------
describe("AssignmentEditor – General tab fields", () => {
  beforeEach(() => {
    loaderData = { ...baseAssignment };
    sendRequestMock.mockClear();
    dispatchMock.mockClear();
  });

  it("renders Assignment Name input (empty in create mode)", () => {
    render(<AssignmentEditor mode="create" />);
    const nameInput = document.getElementById("assignment-name") as HTMLInputElement;
    expect(nameInput).not.toBeNull();
    expect(nameInput.value).toBe("");
  });

  it("pre-fills Assignment Name from loader data in update mode", () => {
    render(<AssignmentEditor mode="update" />);
    const nameInput = document.getElementById("assignment-name") as HTMLInputElement;
    expect(nameInput?.value).toBe("Test Assignment");
  });

  it("renders Private Assignment checkbox (unchecked by default in create mode)", () => {
    render(<AssignmentEditor mode="create" />);
    const cb = document.getElementById("assignment-private") as HTMLInputElement;
    expect(cb).not.toBeNull();
    expect(cb.type).toBe("checkbox");
    expect(cb.checked).toBe(false);
  });

  it("hides Max Team Size input by default when has_teams is unchecked", () => {
    render(<AssignmentEditor mode="create" />);
    expect(document.getElementById("assignment-max_team_size")).toBeNull();
  });

  it("reveals Max Team Size input when Has Teams? is checked", async () => {
    render(<AssignmentEditor mode="create" />);
    const hasTeamsCb = document.getElementById("assignment-has_teams") as HTMLInputElement;
    expect(hasTeamsCb).not.toBeNull();
    fireEvent.click(hasTeamsCb);
    await waitFor(() => {
      expect(document.getElementById("assignment-max_team_size")).not.toBeNull();
    });
  });

  it("renders the Calibration for training checkbox", () => {
    render(<AssignmentEditor mode="create" />);
    expect(document.getElementById("assignment-calibration_for_training")).not.toBeNull();
  });

  it("renders the Allow tag prompts checkbox", () => {
    render(<AssignmentEditor mode="create" />);
    expect(document.getElementById("assignment-allow_tag_prompts")).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Calibration tab – username search & Add button behaviour
// ---------------------------------------------------------------------------
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

  it("shows the calibration participants section heading", () => {
    goToCalibrationTab();
    expect(
      screen.getByRole("heading", { name: /select participants for submitting calibration artifacts/i })
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// getInitialValues – null / undefined merge with defaults
// ---------------------------------------------------------------------------
describe("AssignmentEditor – initial value merging (null fields)", () => {
  beforeEach(() => {
    sendRequestMock.mockClear();
    dispatchMock.mockClear();
  });

  it("uses form defaults when backend returns null for a field", () => {
    loaderData = { ...baseAssignment, has_teams: null, max_team_size: null };
    render(<AssignmentEditor mode="update" />);
    // has_teams falls back to false → conditional block should be hidden
    expect(document.getElementById("assignment-max_team_size")).toBeNull();
  });

  it("preserves non-null backend values over form defaults", () => {
    loaderData = { ...baseAssignment, private: true };
    render(<AssignmentEditor mode="update" />);
    const privCb = document.getElementById("assignment-private") as HTMLInputElement;
    expect(privCb.checked).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// transformAssignmentRequest – utility function tests
// ---------------------------------------------------------------------------
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

  it("defaults boolean flags to false when omitted", () => {
    const values: IAssignmentFormValues = {
      name: "Minimal",
      directory_path: "",
      spec_location: "",
      private: false,
      show_template_review: false,
      require_quiz: false,
      has_badge: false,
      staggered_deadline: false,
      is_calibrated: false,
    };
    const payload = JSON.parse(transformAssignmentRequest(values));
    const a = payload.assignment;
    expect(a.has_teams).toBe(false);
    expect(a.has_mentors).toBe(false);
    expect(a.allow_self_reviews).toBe(false);
    expect(a.is_review_anonymous).toBe(false);
  });

  it("defaults array fields to empty arrays when omitted", () => {
    const values: IAssignmentFormValues = {
      name: "Minimal",
      directory_path: "",
      spec_location: "",
      private: false,
      show_template_review: false,
      require_quiz: false,
      has_badge: false,
      staggered_deadline: false,
      is_calibrated: false,
    };
    const payload = JSON.parse(transformAssignmentRequest(values));
    const a = payload.assignment;
    expect(a.weights).toEqual([]);
    expect(a.notification_limits).toEqual([]);
    expect(a.reminder).toEqual([]);
    expect(a.submission_allowed).toEqual([]);
  });

  it("passes through explicitly supplied weights array", () => {
    const values: IAssignmentFormValues = {
      name: "Weighted",
      directory_path: "",
      spec_location: "",
      private: false,
      show_template_review: false,
      require_quiz: false,
      has_badge: false,
      staggered_deadline: false,
      is_calibrated: false,
      weights: [60, 40],
    };
    const payload = JSON.parse(transformAssignmentRequest(values));
    expect(payload.assignment.weights).toEqual([60, 40]);
  });

  it("produces empty assignment_questionnaires_attributes when no rounds configured", () => {
    const values: IAssignmentFormValues = {
      name: "No rounds",
      directory_path: "",
      spec_location: "",
      private: false,
      show_template_review: false,
      require_quiz: false,
      has_badge: false,
      staggered_deadline: false,
      is_calibrated: false,
    };
    const payload = JSON.parse(transformAssignmentRequest(values));
    expect(payload.assignment.assignment_questionnaires_attributes).toEqual([]);
  });

  it("skips rounds where questionnaire id is falsy (0 / undefined)", () => {
    const values: IAssignmentFormValues = {
      name: "Skip round",
      directory_path: "",
      spec_location: "",
      private: false,
      show_template_review: false,
      require_quiz: false,
      has_badge: false,
      staggered_deadline: false,
      is_calibrated: false,
      number_of_review_rounds: 2,
      questionnaire_round_1: 0,   // falsy – skip
      questionnaire_round_2: 5,
    };
    const payload = JSON.parse(transformAssignmentRequest(values));
    const attrs = payload.assignment.assignment_questionnaires_attributes;
    expect(attrs).toHaveLength(1);
    expect(attrs[0].questionnaire_id).toBe(5);
  });

  it("includes course_id when provided", () => {
    const values: IAssignmentFormValues = {
      name: "Course test",
      directory_path: "",
      spec_location: "",
      private: false,
      show_template_review: false,
      require_quiz: false,
      has_badge: false,
      staggered_deadline: false,
      is_calibrated: false,
      course_id: 42,
    };
    const payload = JSON.parse(transformAssignmentRequest(values));
    expect(payload.assignment.course_id).toBe(42);
  });
});

// =============================================================================
// Table component tests
// =============================================================================

const tableColumns: ColumnDef<any, any>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "age",  header: "Age"  },
];

const tableData = [
  { name: "Alice",   age: 30 },
  { name: "Bob",     age: 25 },
  { name: "Charlie", age: 35 },
];

// ---------------------------------------------------------------------------
// Rendering basics
// ---------------------------------------------------------------------------
describe("Table – basic rendering", () => {
  it("renders a <table> element", () => {
    const { container } = render(<Table data={tableData} columns={tableColumns} />);
    expect(container.querySelector("table")).not.toBeNull();
  });

  it("renders column headers", () => {
    render(<Table data={tableData} columns={tableColumns} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
  });

  it("renders all data rows", () => {
    render(<Table data={tableData} columns={tableColumns} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("renders an empty tbody when data is empty", () => {
    const { container } = render(<Table data={[]} columns={tableColumns} />);
    expect(container.querySelector("tbody")?.children.length).toBe(0);
  });

  it("renders the correct number of body rows", () => {
    const { container } = render(
      <Table data={tableData} columns={tableColumns} showPagination={false} />
    );
    expect(container.querySelectorAll("tbody tr").length).toBe(tableData.length);
  });
});

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
describe("Table – pagination", () => {
  it("shows pagination when data exceeds the default page size (10)", () => {
    const bigData = Array.from({ length: 15 }, (_, i) => ({ name: `User ${i}`, age: 20 + i }));
    const { container } = render(
      <Table data={bigData} columns={tableColumns} showPagination={true} />
    );
    expect(container.querySelector("ul.pagination")).not.toBeNull();
  });

  it("hides pagination when showPagination={false}", () => {
    const bigData = Array.from({ length: 20 }, (_, i) => ({ name: `User ${i}`, age: 20 + i }));
    const { container } = render(
      <Table data={bigData} columns={tableColumns} showPagination={false} />
    );
    expect(container.querySelector("nav")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Global filter
// ---------------------------------------------------------------------------
describe("Table – global filter", () => {
  it("renders the global filter container when showGlobalFilter={true}", () => {
    const { container } = render(
      <Table data={tableData} columns={tableColumns} showGlobalFilter={true} />
    );
    // Outer .mb-md-2 row is present when showGlobalFilter is true
    expect(container.querySelector(".mb-md-2")).not.toBeNull();
  });

  it("does not render a text input when showGlobalFilter={false}", () => {
    render(<Table data={tableData} columns={tableColumns} showGlobalFilter={false} />);
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Column visibility
// ---------------------------------------------------------------------------
describe("Table – columnVisibility prop", () => {
  it("hides a column set to false", () => {
    render(
      <Table data={tableData} columns={tableColumns} showPagination={false} columnVisibility={{ age: false }} />
    );
    expect(screen.queryByText("Age")).toBeNull();
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("shows all columns when no visibility override is given", () => {
    render(<Table data={tableData} columns={tableColumns} showPagination={false} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Row click callback
// ---------------------------------------------------------------------------
describe("Table – onRowClick", () => {
  it("calls onRowClick with the row data when a row is clicked", () => {
    const handleClick = vi.fn();
    render(
      <Table data={tableData} columns={tableColumns} showPagination={false} onRowClick={handleClick} />
    );
    fireEvent.click(screen.getByText("Alice").closest("tr")!);
    expect(handleClick).toHaveBeenCalledOnce();
    expect(handleClick).toHaveBeenCalledWith(expect.objectContaining({ name: "Alice", age: 30 }));
  });

  it("sets cursor:pointer when onRowClick is provided", () => {
    const { container } = render(
      <Table data={tableData} columns={tableColumns} showPagination={false} onRowClick={vi.fn()} />
    );
    expect((container.querySelector("tbody tr") as HTMLElement).style.cursor).toBe("pointer");
  });

  it("sets cursor:default when no onRowClick is provided", () => {
    const { container } = render(
      <Table data={tableData} columns={tableColumns} showPagination={false} />
    );
    expect((container.querySelector("tbody tr") as HTMLElement).style.cursor).toBe("default");
  });

  it("does not throw when a row is clicked without onRowClick", () => {
    render(<Table data={tableData} columns={tableColumns} showPagination={false} />);
    expect(() => fireEvent.click(screen.getByText("Bob").closest("tr")!)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Selected row highlighting
// ---------------------------------------------------------------------------
describe("Table – selected row highlight", () => {
  it("applies highlighted background when isSelected is true on a row", () => {
    const data = [
      { name: "Alice", age: 30, isSelected: true },
      { name: "Bob",   age: 25, isSelected: false },
    ];
    const { container } = render(
      <Table data={data} columns={tableColumns} showPagination={false} />
    );
    const rows = container.querySelectorAll("tbody tr");
    expect((rows[0] as HTMLElement).style.backgroundColor).toBe("rgb(255, 243, 205)");
    expect((rows[1] as HTMLElement).style.backgroundColor).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Expandable sub-rows
// ---------------------------------------------------------------------------
describe("Table – expandable rows", () => {
  const renderSubComponent = ({ row }: { row: any }) => (
    <div data-testid="sub-content">Details for {row.original.name}</div>
  );
  const getRowCanExpand = () => true;

  it("renders an expand chevron button per row when renderSubComponent is provided", () => {
    const { container } = render(
      <Table
        data={tableData}
        columns={tableColumns}
        showPagination={false}
        renderSubComponent={renderSubComponent}
        getRowCanExpand={getRowCanExpand}
      />
    );
    expect(container.querySelectorAll("button.btn-link").length).toBe(tableData.length);
  });

  it("reveals the sub-component row after clicking an expand button", () => {
    const { container } = render(
      <Table
        data={tableData}
        columns={tableColumns}
        showPagination={false}
        renderSubComponent={renderSubComponent}
        getRowCanExpand={getRowCanExpand}
      />
    );
    expect(screen.queryAllByTestId("sub-content")).toHaveLength(0);
    fireEvent.click(container.querySelectorAll("button.btn-link")[0]!);
    expect(screen.queryAllByTestId("sub-content")).toHaveLength(1);
  });

  it("collapses sub-row when the expand button is clicked a second time", () => {
    const { container } = render(
      <Table
        data={tableData}
        columns={tableColumns}
        showPagination={false}
        renderSubComponent={renderSubComponent}
        getRowCanExpand={getRowCanExpand}
      />
    );
    const btn = container.querySelectorAll("button.btn-link")[0]!;
    fireEvent.click(btn);
    expect(screen.queryAllByTestId("sub-content")).toHaveLength(1);
    fireEvent.click(btn);
    expect(screen.queryAllByTestId("sub-content")).toHaveLength(0);
  });

  it("does not render expand buttons when renderSubComponent is absent", () => {
    const { container } = render(
      <Table data={tableData} columns={tableColumns} showPagination={false} />
    );
    expect(container.querySelectorAll("button.btn-link")).toHaveLength(0);
  });
});

