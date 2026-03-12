import React, { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPassword from "../ForgotPassword";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import alertReducer from "store/slices/alertSlice";
import { vi } from "vitest";
import axios from "axios";
import { AxiosError } from "axios";

vi.mock('axios');

const mockStore = configureStore({
    reducer: {
        alert: alertReducer,
    },
});

const validEmail = 'test@example.com';
const submitText = /request password reset/i;

describe('Test Forgot Password Displays Correctly', () => {
    it('Renders the component correctly', () => {
        render(
            <Provider store={mockStore}>
                <ForgotPassword />
            </Provider>
        );
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/forgotten your password\?/i);
        expect(screen.getByText(/enter the email associated with your account/i)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: submitText})).toBeInTheDocument();
    });

    it('Renders email input field', () => {
        render(
            <Provider store={mockStore}>
                <ForgotPassword />
            </Provider>
        );
        const emailInput = screen.getByRole('textbox', {name: /email address/i});
        expect(emailInput).toBeInTheDocument();
    });
});

describe('Test Forgot Password Form Validations', () => {
  it('Does not submit form with empty email', async () => {
    const user = userEvent.setup();
    render(
        <Provider store={mockStore}>
            <ForgotPassword />
        </Provider>
    );

    let emailInput = screen.getByRole('textbox');
    let submitButton = screen.getByRole('button', {name: submitText});

    await user.click(emailInput);
    await user.tab();
    await user.click(submitButton);

    expect(axios.post).not.toHaveBeenCalled();

    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });

  it('Does not submit form with invalid email', async () => {
    const user = userEvent.setup();
    render(
        <Provider store={mockStore}>
            <ForgotPassword />
        </Provider>
    );

    let emailInput = screen.getByRole('textbox');
    let submitButton = screen.getByRole('button', {name: submitText});

    await user.type(emailInput, 'bademail');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();
    expect(axios.post).not.toHaveBeenCalled();
  });
});

describe('Test Forgot Password Api Error', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Handles API unavailable', async () => {
    const user = userEvent.setup();
    (axios.post as any).mockRejectedValue(
      new AxiosError("Network Error", 'ERR_NETWORK', undefined, undefined, {
        status: 0,
        statusText: 'Network Error',
        data: {},
        headers: {},
        config: {},
      })
    );

    render(
        <Provider store={mockStore}>
            <ForgotPassword />
        </Provider>
    );

    let emailInput = screen.getByRole('textbox');
    let submitButton = screen.getByRole('button', {name: submitText});

    await user.type(emailInput, validEmail);
    await user.click(submitButton);

    await waitFor(() => {
      const state = mockStore.getState();
      expect(state.alert.message).toBe('An error occurred. Please try again.');
      expect(state.alert.variant).toBe('danger');
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/password_resets'), {email: validEmail}
    );
  });
});

describe('Test Successful Password Reset Request', () => {
  it('submit form successfully', async () => {
    const user = userEvent.setup();
    (axios.post as any).mockResolvedValue({
      status: 200,
      data: { message: 'If the email exists, a reset link has been sent.'},
    });

    render(
        <Provider store={mockStore}>
            <ForgotPassword />
        </Provider>
    );
    
    let emailInput = screen.getByRole('textbox');
    let submitButton = screen.getByRole('button', {name: submitText});

    await user.type(emailInput, validEmail);
    await user.click(submitButton);

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/password_resets'), {email: validEmail}
    );

    await waitFor(() => {
      const state = mockStore.getState();
      expect(state.alert.variant).toBe('success');
      expect(state.alert.message).toBe('A link to reset your password has been sent to your e-mail address.');
    });
  });
});
// // Mock the useAPI hook to return mock assignments
// vi.mock("hooks/useAPI", () => ({
//     default: () => ({
//         error: null,
//         isLoading: false,
//         data: {
//             initialUser: userData
//         },
//         sendRequest: vi.fn(),
//     })
// }));
