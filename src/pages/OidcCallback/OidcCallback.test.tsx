// src/pages/OidcCallback/OidcCallback.test.tsx
import React from "react";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import OidcCallback from "./OidcCallback";
import axiosClient from "../../utils/axios_client";
import * as authUtils from "../../utils/auth";
import authenticationReducer from "../../store/slices/authenticationSlice";
import alertReducer from "../../store/slices/alertSlice";

vi.mock("../../utils/axios_client");
vi.mock("../../utils/auth");

// Test data constants
const MOCK_JWT_TOKEN = "fake-jwt-token";
const MOCK_SESSION_TOKEN = "fake-session-token";
const MOCK_USER_ID = "123";
const CALLBACK_ROUTE = "/auth/callback";
const CALLBACK_URL = `${CALLBACK_ROUTE}?code=test-code&state=test-state`;

const MOCK_AUTH_PAYLOAD = {
  exp: Math.floor(Date.now() / 1000) + 3600,
  user_id: MOCK_USER_ID,
};

const MOCK_SUCCESS_RESPONSE = {
  data: {
    token: MOCK_JWT_TOKEN,
    session_token: MOCK_SESSION_TOKEN,
  },
};

const MOCK_ERROR_RESPONSE = {
  error: "access_denied",
};

describe("OidcCallback", () => {
  let store: any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    store = configureStore({
      reducer: {
        authentication: authenticationReducer,
        alert: alertReducer,
      },
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * Renders the OidcCallback component wrapped in Router and Redux Provider
   * @param initialEntry - URL to render at (default: successful callback)
   * @param shouldMockSuccess - Whether to mock successful auth response (default: true)
   */
  const renderCallback = (
    initialEntry: string = CALLBACK_URL,
    shouldMockSuccess: boolean = true
  ) => {
    if (shouldMockSuccess) {
      vi.mocked(authUtils.setAuthToken).mockReturnValueOnce(MOCK_AUTH_PAYLOAD as any);
      vi.mocked(axiosClient).post.mockResolvedValueOnce(MOCK_SUCCESS_RESPONSE);
    }

    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Provider store={store}>
          <Routes>
            <Route path={CALLBACK_ROUTE} element={<OidcCallback />} />
            <Route path="/" element={<div>Home</div>} />
            <Route path="/login" element={<div>Login</div>} />
          </Routes>
        </Provider>
      </MemoryRouter>
    );
  };

  it("displays loading message while processing callback", async () => {
    renderCallback();

    expect(screen.getByText("Completing login...")).toBeInTheDocument();

    await waitFor(() => {
      expect(vi.mocked(axiosClient).post).toHaveBeenCalled();
    });
  });

  it("attempts to exchange code and state for token", async () => {
    renderCallback(CALLBACK_URL);

    await waitFor(() => {
      expect(vi.mocked(axiosClient).post).toHaveBeenCalledWith(
        CALLBACK_ROUTE,
        { code: "test-code", state: "test-state" },
        { skipAuth: true }
      );
    }, { timeout: 3000 });
  });

  it("sets auth token when callback succeeds", async () => {
    renderCallback();

    await waitFor(() => {
      expect(vi.mocked(authUtils.setAuthToken)).toHaveBeenCalledWith(MOCK_JWT_TOKEN);
    }, { timeout: 3000 });

    // localStorage session was persisted
    const session = JSON.parse(localStorage.getItem("session") || "{}");
    expect(session.user).toBeDefined();

    // Redux received the correct token
    expect(store.getState().authentication.authToken).toBe(MOCK_JWT_TOKEN);
    expect(store.getState().authentication.user).toEqual(MOCK_AUTH_PAYLOAD);

    // Navigated to the dashboard
    await waitFor(() => {
      expect(screen.getByText("Home")).toBeInTheDocument();
    });
  });

  it("does not make API call when missing code", async () => {
    renderCallback(`${CALLBACK_ROUTE}?state=test-state`, false);

    await waitFor(() => {
      expect(vi.mocked(axiosClient).post).not.toHaveBeenCalled();
    });
  });

  it("does not make API call when missing state", async () => {
    renderCallback(`${CALLBACK_ROUTE}?code=test-code`, false);

    await waitFor(() => {
      expect(vi.mocked(axiosClient).post).not.toHaveBeenCalled();
    });
  });

  it("handles OIDC callback error gracefully", async () => {
    const errorResponse = new Error("Authentication failed");
    (errorResponse as any).response = { data: MOCK_ERROR_RESPONSE };
    vi.mocked(axiosClient).post.mockRejectedValueOnce(errorResponse);

    renderCallback(CALLBACK_URL, false);

    // Wait for the redirect — confirms the catch block fully ran
    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    // Alert was dispatched with the backend error message
    expect(store.getState().alert.show).toBe(true);
    expect(store.getState().alert.variant).toBe("danger");
    expect(store.getState().alert.message).toBe(MOCK_ERROR_RESPONSE.error);
  });

  it("handles network timeout during callback", async () => {
    const timeoutError = new Error("Request timeout");
    timeoutError.name = "TimeoutError";
    vi.mocked(axiosClient).post.mockRejectedValueOnce(timeoutError);

    renderCallback(CALLBACK_URL, false);

    await waitFor(() => {
      expect(vi.mocked(axiosClient).post).toHaveBeenCalled();
    });
  });

  it("shows error parameter in URL query and does not make API call", async () => {
    renderCallback(`${CALLBACK_ROUTE}?error=access_denied`, false);

    // Wait for the redirect — the real observable side effect in this branch
    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    // After the full useEffect has run, the backend should never have been called
    expect(vi.mocked(axiosClient).post).not.toHaveBeenCalled();

    // Alert was dispatched with the provider error value
    expect(store.getState().alert.show).toBe(true);
    expect(store.getState().alert.variant).toBe("danger");
    expect(store.getState().alert.message).toContain("access_denied");
  });
});