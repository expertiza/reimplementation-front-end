import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import Courses from "./Course";

const mockUseLocation = vi.fn();
const mockNavigate = vi.fn();
const mockDispatch = vi.fn();
const mockUseAPI = vi.fn();
const mockTable = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
  Outlet: () => <div data-testid="courses-outlet" />,
}));

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) =>
    selector({
      authentication: {
        isAuthenticated: true,
        user: {
          id: 7,
          full_name: "Taylor Teach",
          role: "Instructor",
        },
      },
    }),
}));

vi.mock("../../hooks/useAPI", () => ({
  default: () => mockUseAPI(),
}));

vi.mock("components/Table/Table", () => ({
  default: (props: any) => {
    mockTable(props);
    return <div data-testid="courses-table" />;
  },
}));

vi.mock("./CourseDelete", () => ({
  default: () => <div>Delete Course Modal</div>,
}));

vi.mock("./CourseCopy", () => ({
  default: () => <div>Copy Course Modal</div>,
}));

vi.mock("./CourseAssignments", () => ({
  default: () => <div>Course Assignments</div>,
}));

const setUseApiSequence = () => {
  mockUseAPI
    .mockReturnValueOnce({
      error: "",
      isLoading: false,
      data: {
        data: [
          {
            id: 1,
            name: "CSC 517",
            directory_path: "csc517",
            info: "Course info",
            private: true,
            created_at: "2024-01-01T00:00:00.000Z",
            updated_at: "2024-01-02T00:00:00.000Z",
            institution_id: 1,
            instructor_id: 7,
            institution: { id: 1, name: "NCSU" },
            instructor: { id: 7, name: "Taylor Teach" },
            date_format_pref: "MM/DD/YYYY",
          },
        ],
      },
      sendRequest: vi.fn(),
    })
    .mockReturnValueOnce({
      data: { data: [{ id: 1, name: "NCSU" }] },
      sendRequest: vi.fn(),
    })
    .mockReturnValueOnce({
      data: { data: [{ id: 7, name: "Taylor Teach" }] },
      sendRequest: vi.fn(),
    })
    .mockReturnValueOnce({
      data: { data: [{ course_id: 1 }] },
      sendRequest: vi.fn(),
    });
};

describe("Courses report route behavior", () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({
      pathname: "/courses",
      search: "",
      hash: "",
    });
    mockUseAPI.mockReset();
    mockTable.mockReset();
    setUseApiSequence();
  });

  it("renders only the outlet when the current path is the course report page", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/courses/1/class_assignment_overview",
      search: "",
      hash: "",
    });

    render(<Courses />);

    expect(screen.getByTestId("courses-outlet")).toBeInTheDocument();
    expect(screen.queryByTestId("courses-table")).not.toBeInTheDocument();
    expect(screen.queryByText(/Manage Courses/i)).not.toBeInTheDocument();
  });

  it("renders the normal courses page when the current path is not the report page", () => {
    render(<Courses />);

    expect(screen.getByTestId("courses-outlet")).toBeInTheDocument();
    expect(screen.getByTestId("courses-table")).toBeInTheDocument();
    expect(screen.getByText("Instructed by: Taylor Teach")).toBeInTheDocument();
  });

  it("passes course rows to the shared table on the normal courses page", async () => {
    render(<Courses />);

    await waitFor(() => expect(mockTable).toHaveBeenCalledTimes(1));
    expect(mockTable.mock.calls[0][0].data).toHaveLength(1);
    expect(mockTable.mock.calls[0][0].data[0].name).toBe("CSC 517");
  });
});
