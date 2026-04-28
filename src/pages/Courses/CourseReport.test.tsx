import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CourseReport from "./CourseReport";

const mockUseParams = vi.fn();
const mockSendRequest = vi.fn();
const mockTable = vi.fn();
const mockUseAPI = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useParams: () => mockUseParams(),
}));

vi.mock("../../hooks/useAPI", () => ({
  default: () => mockUseAPI(),
}));

vi.mock("../../components/Table/Table", () => ({
  default: (props: any) => {
    mockTable(props);
    return (
      <div data-testid="mock-table">
        {Array.isArray(props.data) ? props.data.map((row: any) => row.studentName).join(", ") : ""}
      </div>
    );
  },
}));

const reportResponse = {
  course_id: 44,
  course_name: "CSC 517",
  assignments: [
    {
      assignment_id: 3,
      assignment_name: "Project 1",
      has_topics: true,
    },
    {
      assignment_id: 5,
      assignment_name: "Project 2",
      has_topics: false,
    },
  ],
  students: [
    {
      user_id: 1,
      user_name: "Alice",
      assignments: {
        "3": {
          participant_id: 101,
          peer_grade: 88,
          instructor_grade: 91,
          avg_teammate_score: 77,
          topic: "Topic A",
        },
        "5": null,
      },
    },
    {
      user_id: 2,
      user_name: "Bob",
      assignments: {
        "3": {
          participant_id: 102,
          peer_grade: 92,
          instructor_grade: null,
          avg_teammate_score: 73,
        },
        "5": {
          participant_id: 202,
          peer_grade: 81,
          instructor_grade: 84,
          avg_teammate_score: 79,
        },
      },
    },
  ],
};

const setUseApiState = ({
  data = { data: reportResponse },
  error = "",
  isLoading = false,
} = {}) => {
  mockUseAPI.mockReturnValue({
    data,
    error,
    isLoading,
    sendRequest: mockSendRequest,
  });
};

describe("CourseReport", () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ courseId: "44" });
    mockSendRequest.mockReset();
    mockTable.mockReset();
    mockUseAPI.mockReset();
    setUseApiState();
  });

  it("requests assignment records for the current course id", async () => {
    render(<CourseReport />);

    await waitFor(() =>
      expect(mockSendRequest).toHaveBeenCalledWith({
        url: "/assignment_records?course_id=44",
      })
    );
  });

  it("does not request data when the course id is missing", async () => {
    mockUseParams.mockReturnValue({});

    render(<CourseReport />);

    await waitFor(() => expect(mockSendRequest).not.toHaveBeenCalled());
  });

  it("shows a spinner while the page is loading", () => {
    setUseApiState({ isLoading: true, data: undefined });

    render(<CourseReport />);

    expect(document.querySelector(".spinner-border")).toBeInTheDocument();
    expect(mockTable).not.toHaveBeenCalled();
  });

  it("shows an error alert when the request fails", () => {
    setUseApiState({ error: "Unable to load report", data: undefined });

    render(<CourseReport />);

    expect(screen.getByText("Unable to load report")).toBeInTheDocument();
    expect(mockTable).not.toHaveBeenCalled();
  });

  it("renders the course report title with the course name", () => {
    render(<CourseReport />);

    expect(screen.getByRole("heading", { name: "Course Report — CSC 517" })).toBeInTheDocument();
  });

  it("renders all report field checkboxes checked by default", () => {
    render(<CourseReport />);

    expect(screen.getByRole("checkbox", { name: "Topic" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Peer Grade" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Instructor Grade" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Avg. Teammate Score" })).toBeChecked();
  });

  it("passes the class average row to the first table and student rows to the second table", () => {
    render(<CourseReport />);

    expect(mockTable).toHaveBeenCalledTimes(2);
    expect(mockTable.mock.calls[0][0].data).toHaveLength(1);
    expect(mockTable.mock.calls[0][0].data[0].studentName).toBe("Class Average");
    expect(mockTable.mock.calls[1][0].data.map((row: any) => row.studentName)).toEqual([
      "Alice",
      "Bob",
    ]);
  });

  it("disables pagination and global filtering on both tables", () => {
    render(<CourseReport />);

    expect(mockTable).toHaveBeenCalledTimes(2);
    mockTable.mock.calls.forEach(([props]: any[]) => {
      expect(props.showPagination).toBe(false);
      expect(props.showGlobalFilter).toBe(false);
      expect(props.disablePaginationRowModel).toBe(true);
    });
  });

  it("updates topic column visibility when the Topic checkbox is toggled off", async () => {
    const user = userEvent.setup();

    render(<CourseReport />);
    mockTable.mockClear();

    await user.click(screen.getByRole("checkbox", { name: "Topic" }));

    await waitFor(() => expect(mockTable).toHaveBeenCalledTimes(2));
    expect(mockTable.mock.calls[0][0].columnVisibility.a3_topic).toBe(false);
    expect(mockTable.mock.calls[1][0].columnVisibility.a3_topic).toBe(false);
  });

  it("updates peer, instructor, and teammate column visibility when their checkboxes are toggled", async () => {
    const user = userEvent.setup();

    render(<CourseReport />);
    mockTable.mockClear();

    await user.click(screen.getByRole("checkbox", { name: "Peer Grade" }));
    await user.click(screen.getByRole("checkbox", { name: "Instructor Grade" }));
    await user.click(screen.getByRole("checkbox", { name: "Avg. Teammate Score" }));

    await waitFor(() => expect(mockTable).toHaveBeenCalled());
    const latestProps = mockTable.mock.calls.at(-1)?.[0];

    expect(latestProps.columnVisibility.a3_peerGrade).toBe(false);
    expect(latestProps.columnVisibility.a3_instructorGrade).toBe(false);
    expect(latestProps.columnVisibility.a3_avgTeammateScore).toBe(false);
    expect(latestProps.columnVisibility.a5_peerGrade).toBe(false);
    expect(latestProps.columnVisibility.a5_instructorGrade).toBe(false);
    expect(latestProps.columnVisibility.a5_avgTeammateScore).toBe(false);
  });
});
