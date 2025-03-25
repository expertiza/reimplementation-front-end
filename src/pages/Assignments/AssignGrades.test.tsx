// src/pages/Assignments/AssignGrades.test.tsx

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
// Import your root reducer (adjust the path as needed)
import rootReducer from "../../store/rootReducer";

// Import the component under test
import AssignGrades from "./AssignGrades";

// Example: Mock window.alert so we can check if it's called
const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

describe("AssignGrades page", () => {
  // Create a single Redux store for all tests in this file
  const store = configureStore({
    reducer: rootReducer,
    // You can optionally add a preloadedState: {...} if needed
  });

  afterAll(() => {
    alertMock.mockRestore();
  });

  // TC001: Verify "Show Submission" toggle
  test("TC001: Verify 'Show Submission' toggle", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <AssignGrades />
        </BrowserRouter>
      </Provider>
    );

    // Initially, "No Submission Available" should NOT be visible
    expect(screen.queryByText("No Submission Available")).not.toBeInTheDocument();

    // Click the toggle button
    const toggleButton = screen.getByText("Show Submission");
    fireEvent.click(toggleButton);

    // Now "No Submission Available" should be visible
    expect(screen.getByText("No Submission Available")).toBeInTheDocument();

    // Click again to hide
    const hideButton = screen.getByText("Hide Submission");
    fireEvent.click(hideButton);

    // It should disappear again
    expect(screen.queryByText("No Submission Available")).not.toBeInTheDocument();
  });

  // TC002: Validate grade input
  test("TC002: Validate grade input (no grade => error alert)", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <AssignGrades />
        </BrowserRouter>
      </Provider>
    );

    // Click 'Save' without entering a grade
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    // Check that the alert was called with "Grade is required!" (per your code)
    expect(alertMock).toHaveBeenCalledWith("Grade is required!");
  });

  // TC003: Test successful save
  test("TC003: Test successful save (valid grade => success alert & navigate)", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <AssignGrades />
        </BrowserRouter>
      </Provider>
    );

    // Enter a valid grade
    const gradeInput = screen.getByLabelText("Grade");
    fireEvent.change(gradeInput, { target: { value: "90" } });

    // Enter a comment (optional)
    const commentInput = screen.getByLabelText("Comments");
    fireEvent.change(commentInput, { target: { value: "Good job!" } });

    // Click Save
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    // Check alert
    expect(alertMock).toHaveBeenCalledWith("Grade and comment saved successfully!");
    // If you mock useNavigate, you can also check it was called with "/"
    // e.g. expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
