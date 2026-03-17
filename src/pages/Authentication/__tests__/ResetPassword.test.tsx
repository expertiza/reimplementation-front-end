import React from "react";
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

beforeEach(() => {
  vi.clearAllMocks();
});

const makeMockStore = () => configureStore({
  reducer: {
    alert: alertReducer,
  },
});

const validEmail = 'test@example.com';
const submitText = /request password reset/i;

describe('Test Forgot Password Displays Correctly', () => {
  it('Renders the component correctly', () => {
    const store = makeMockStore();
    render(
      <Provider store={store}>
        <ForgotPassword />
      </Provider>
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/forgotten your password\?/i);
    expect(screen.getByText(/enter the email associated with your account/i)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: submitText})).toBeInTheDocument();
  });

  it('Renders email input field', () => {
    const store = makeMockStore();
    render(
      <Provider store={store}>
        <ForgotPassword />
      </Provider>
    );
    const emailInput = screen.getByRole('textbox', {name: /email address/i});
    expect(emailInput).toBeInTheDocument();
  });
});