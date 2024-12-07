import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Row } from "@tanstack/react-table";
import { TAColumns } from "./TAColumns";

// Mock the ColumnButton component
jest.mock("../../components/ColumnButton", () => ({ id, ...props }: any) => (
  <button data-testid={id} {...props}></button>
));

describe("TAColumns", () => {
  const mockHandleDelete = jest.fn();
  const mockRow: Partial<Row<any>> = { original: { id: "123", name: "Test TA" } };

  test("should define all required columns", () => {
    const columns = TAColumns(mockHandleDelete);
    expect(columns).toHaveLength(5);

    // Check each column's header
    expect(columns[0].header).toBe("Id");
    expect(columns[1].header).toBe("TA Name");
    expect(columns[2].header).toBe("Full Name");
    expect(columns[3].header).toBe("Email");
    expect(columns[4].header).toBe("Actions");
  });

  test("should correctly render the actions column", () => {
    const actionsColumn = TAColumns(mockHandleDelete).find((col) => col.id === "actions");
    expect(actionsColumn).toBeDefined();
    const CellComponent = actionsColumn?.cell as React.FC<{ row: Row<any> }>;

    render(<CellComponent row={mockRow as Row<any>} />);
    const deleteButton = screen.getByTestId("delete-ta");
    expect(deleteButton).toBeTruthy();
  });

  test("should call handleDelete when delete button is clicked", async () => {
    const actionsColumn = TAColumns(mockHandleDelete).find((col) => col.id === "actions");
    const CellComponent = actionsColumn?.cell as React.FC<{ row: Row<any> }>;

    render(<CellComponent row={mockRow as Row<any>} />);
    const deleteButton = screen.getByTestId("delete-ta");

    await userEvent.click(deleteButton);
    expect(mockHandleDelete).toHaveBeenCalledTimes(1);
    expect(mockHandleDelete).toHaveBeenCalledWith(mockRow);
  });
});
