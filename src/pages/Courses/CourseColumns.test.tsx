import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Row } from "@tanstack/react-table";
import { courseColumns } from "./CourseColumns";

// Mock the ColumnButton component
jest.mock("../../components/ColumnButton", () => ({ id, ...props }: any) => (
  <button data-testid={id} {...props}></button>
));

describe("courseColumns", () => {
  const mockHandleEdit = jest.fn();
  const mockHandleDelete = jest.fn();
  const mockHandleTA = jest.fn();
  const mockHandleCopy = jest.fn();
  const mockRow: Partial<Row<any>> = {
    original: { id: "123", name: "Test Course", institution: { name: "Test Institution" } },
  };

  test("should define all required columns", () => {
    const columns = courseColumns(mockHandleEdit, mockHandleDelete, mockHandleTA, mockHandleCopy);
    expect(columns).toHaveLength(5);

    // Check each column's header
    expect(columns[0].header).toBe("Name");
    expect(columns[1].header).toBe("Institution");
    expect(columns[2].header).toBe("Creation Date");
    expect(columns[3].header).toBe("Updated Date");
    expect(columns[4].header).toBe("Actions");
  });

  test("should call handleEdit when edit button is clicked", async () => {
    const actionsColumn = courseColumns(
      mockHandleEdit,
      mockHandleDelete,
      mockHandleTA,
      mockHandleCopy, 
      //"Super Administrator"
    ).find((col) => col.id === "actions");
    const CellComponent = actionsColumn?.cell as React.FC<{ row: Row<any> }>;

    render(<CellComponent row={mockRow as Row<any>} />);
    const editButton = screen.getByTestId("edit");

    userEvent.click(editButton);
    expect(mockHandleEdit).toHaveBeenCalledTimes(1);
    expect(mockHandleEdit).toHaveBeenCalledWith(mockRow);
  });

  test("should call handleDelete when delete button is clicked", async () => {
    const actionsColumn = courseColumns(
      mockHandleEdit,
      mockHandleDelete,
      mockHandleTA,
      mockHandleCopy,
      //"Super Administrator"
    ).find((col) => col.id === "actions");
    const CellComponent = actionsColumn?.cell as React.FC<{ row: Row<any> }>;

    render(<CellComponent row={mockRow as Row<any>} />);
    const deleteButton = screen.getByTestId("delete");

    userEvent.click(deleteButton);
    expect(mockHandleDelete).toHaveBeenCalledTimes(1);
    expect(mockHandleDelete).toHaveBeenCalledWith(mockRow);
  });

  test("should call handleTA when assign TA button is clicked", async () => {
    const actionsColumn = courseColumns(
      mockHandleEdit,
      mockHandleDelete,
      mockHandleTA,
      mockHandleCopy,
      //"Super Administrator"
    ).find((col) => col.id === "actions");
    const CellComponent = actionsColumn?.cell as React.FC<{ row: Row<any> }>;

    render(<CellComponent row={mockRow as Row<any>} />);
    const assignTAButton = screen.getByTestId("assign-ta");

    userEvent.click(assignTAButton);
    expect(mockHandleTA).toHaveBeenCalledTimes(1);
    expect(mockHandleTA).toHaveBeenCalledWith(mockRow);
  });

  test("should call handleCopy when copy button is clicked", async () => {
    const actionsColumn = courseColumns(
      mockHandleEdit,
      mockHandleDelete,
      mockHandleTA,
      mockHandleCopy,
      //"Super Administrator"
    ).find((col) => col.id === "actions");
    const CellComponent = actionsColumn?.cell as React.FC<{ row: Row<any> }>;

    render(<CellComponent row={mockRow as Row<any>} />);
    const copyButton = screen.getByTestId("copy");

    userEvent.click(copyButton);
    expect(mockHandleCopy).toHaveBeenCalledTimes(1);
    expect(mockHandleCopy).toHaveBeenCalledWith(mockRow);
  });
});
