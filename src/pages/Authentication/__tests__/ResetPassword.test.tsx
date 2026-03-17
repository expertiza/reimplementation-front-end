import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPassword from "../ResetPassword";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import alertReducer from "store/slices/alertSlice";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import axios from "axios";
import { AxiosError } from "axios";

vi.mock("axios");

beforeEach(() => {
  vi.clearAllMocks();
});

// Simulate arriving from a password-reset email link.
const mockStore = configureStore({
  reducer: {
    alert: alertReducer,
  },
});

// Renders ResetPassword inside the required Provider + Router context.
const renderComponent = (token: string | null = "valid-token") => {
  const search = token ? `?token=${token}` : "";
  return render(
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={[`/reset-password${search}`]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Provide a /login route so navigate('/login') doesn't throw */}
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

// Test for password reset form rendering and validation
describe("Test Reset Password Displays Correctly", () => {
  it("renders the component correctly", () => {
    renderComponent();

    // The page heading should be present
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      /reset your password/i
    );

    // Both password fields must be in the document
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    // The submit button must be present
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("submit button is disabled when fields are empty", () => {
    renderComponent();

    // Formik's `disabled={!(formik.isValid && formik.dirty)}` means the button
    // should be disabled on initial render before the user touches anything.
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeDisabled();
  });
});

