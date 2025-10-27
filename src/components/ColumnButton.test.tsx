import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ColumnButton from "./ColumnButton";

// Mock React-Bootstrap components
jest.mock("react-bootstrap", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Tooltip: ({ id, children }: any) => <div id={id}>{children}</div>,
  OverlayTrigger: ({ children, overlay }: any) => (
    <div>
      {overlay}
      {children}
    </div>
  ),
}));

describe("ColumnButton", () => {
  const mockOnClick = jest.fn();

  const baseProps = {
    id: "test-button",
    label: "Test Button",
    tooltip: "This is a test tooltip",
    variant: "primary",
    size: "sm" as const,
    className: "custom-class",
    onClick: mockOnClick,
    icon: <span data-testid="icon">Icon</span>,
  };

  test("should call onClick when the button is clicked", async () => {
    render(<ColumnButton {...baseProps} tooltip={undefined} />);
    const button = screen.getByRole("button", { name: "Test Button" });

    userEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test("should render a tooltip when tooltip is provided", () => {
    render(<ColumnButton {...baseProps} />);
    const tooltip = screen.getByText("This is a test tooltip");

    // Vanilla assertion to check if tooltip is rendered
    expect(tooltip).not.toBeNull();
    const button = screen.getByRole("button", { name: "Test Button" });
    expect(button).not.toBeNull(); // Ensure the button is still present
  });

  test("should not render a tooltip when tooltip is not provided", () => {
    render(<ColumnButton {...baseProps} tooltip={undefined} />);
    const tooltip = screen.queryByText("This is a test tooltip");

    // Vanilla assertion to check if tooltip is not rendered
    expect(tooltip).toBeNull();
  });
});
