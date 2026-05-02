import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { courseColumns } from "./CourseColumns";

const mockRow = {
  original: {
    id: 15,
    name: "CSC 517",
    institution: { id: 1, name: "NCSU" },
    instructor: { id: 2, name: "Prof. Lane" },
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-02T00:00:00.000Z",
  },
} as any;

describe("courseColumns report action", () => {
  const handleEdit = vi.fn();
  const handleDelete = vi.fn();
  const handleTA = vi.fn();
  const handleCopy = vi.fn();
  const handleReport = vi.fn();

  const renderActionsCell = () => {
    const columns = courseColumns(
      handleEdit,
      handleDelete,
      handleTA,
      handleCopy,
      handleReport
    );
    const actionsColumn = columns.find((column: any) => column.id === "actions") as any;

    return render(actionsColumn.cell({ row: mockRow }));
  };

  beforeEach(() => {
    handleEdit.mockReset();
    handleDelete.mockReset();
    handleTA.mockReset();
    handleCopy.mockReset();
    handleReport.mockReset();
  });

  it("renders the report action with the existing tooltip text", async () => {
    const user = userEvent.setup();

    renderActionsCell();
    const reportButton = screen.getByRole("button", { name: "View Course Report" });

    await user.hover(reportButton);

    expect(await screen.findByText("View Course Report")).toBeInTheDocument();
  });

  it("calls handleReport with the clicked row", async () => {
    const user = userEvent.setup();

    renderActionsCell();
    await user.click(screen.getByRole("button", { name: "View Course Report" }));

    expect(handleReport).toHaveBeenCalledWith(mockRow);
  });

  it("renders the report action as a brown rectangular button instead of a link-style icon button", () => {
    renderActionsCell();
    const reportButton = screen.getByRole("button", { name: "View Course Report" });

    expect(reportButton).toHaveStyle({
      backgroundColor: "#8B4513",
      borderColor: "#8B4513",
      width: "25px",
      height: "25px",
    });
    expect(reportButton).not.toHaveClass("btn-link");
  });
});
