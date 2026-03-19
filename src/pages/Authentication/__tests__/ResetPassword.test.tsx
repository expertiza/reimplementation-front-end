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

const makeMockStore = () =>
  configureStore({
    reducer: {
      alert: alertReducer,
    },
  });

// Renders ResetPassword inside the required Provider + Router context.
// Returns the store so each test can inspect its own isolated alert state.
const renderComponent = (token: string | null = "valid-token") => {
  const store = makeMockStore();
  const search = token ? `?token=${token}` : "";
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/reset-password${search}`]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Provide a /login route so navigate('/login') doesn't throw */}
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return store;
};

describe("Test Reset Password Missing Token", () => {
  it("redirects to login and shows error when token is missing", async () => {
    const store = renderComponent(null);

    await waitFor(() => {
      const state = store.getState();
      expect(state.alert.variant).toBe("danger");
      expect(state.alert.message).toBe("Invalid or missing token.");
    });

    // The component should have navigated away — login page is rendered instead
    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });
});

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

const validPassword = "validpassword";

describe("Test Reset Password Form Validations", () => {
  it("does not submit form when password is too short", async () => {
    const user = userEvent.setup();
    renderComponent();

    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    await user.type(passwordInput, "abc");
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();
    expect(axios.put).not.toHaveBeenCalled();
  });

  it("does not submit form when passwords do not match", async () => {
    const user = userEvent.setup();
    renderComponent();

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    await user.type(passwordInput, validPassword);
    await user.type(confirmInput, "differentpassword");
    await user.tab(); // Simulates pressing tab to trigger validation with both fields filled

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();
    expect(axios.put).not.toHaveBeenCalled();
  });
});

describe("Test Successful Password Reset", () => {
  it("submits form successfully", async () => {
    const user = userEvent.setup();
    (axios.put as any).mockResolvedValue({
      status: 200,
      data: { message: "Password Successfully Updated" },
    });

    const store = renderComponent();

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    await user.type(passwordInput, validPassword);
    await user.type(confirmInput, validPassword);
    await user.tab(); // simulates pressing tab to trigger validation with both fields filled
    await user.click(submitButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining("/password_resets/valid-token"),
        { user: { password: validPassword } }
      );
      const state = store.getState();
      expect(state.alert.variant).toBe("success");
      expect(state.alert.message).toBe("Password Successfully Updated");
    });
  });
});

describe("Test Reset Password Api Error", () => {
  it("handles API unavailable", async () => {
    const user = userEvent.setup();
    (axios.put as any).mockRejectedValue(
      new AxiosError("Network Error", "ERR_NETWORK")
    );

    const store = renderComponent();

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    await user.type(passwordInput, validPassword);
    await user.type(confirmInput, validPassword);
    await user.tab(); // Simulates pressing tab to trigger validation with both fields filled
    await user.click(submitButton);

    await waitFor(() => {
      const state = store.getState();
      expect(state.alert.message).toBe("An error occurred. Please try again.");
      expect(state.alert.variant).toBe("danger");
    });

    expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining("/password_resets/valid-token"),
      { user: { password: validPassword } }
    );
  });

  it("shows server error message when API returns one", async () => {
    const user = userEvent.setup();
    const serverError = new AxiosError("Token has expired.", "ERR_BAD_REQUEST");
    (serverError as any).response = {
      status: 422,
      statusText: "Unprocessable Entity",
      data: { error: "Token has expired." },
      headers: {},
      config: {} as any,
    };
    (axios.put as any).mockRejectedValue(serverError);

    const store = renderComponent();

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /reset password/i });

    await user.type(passwordInput, validPassword);
    await user.type(confirmInput, validPassword);
    await user.tab();
    await user.click(submitButton);

    await waitFor(() => {
      const state = store.getState();
      expect(state.alert.message).toBe("Token has expired.");
      expect(state.alert.variant).toBe("danger");
    });
  });
});
