// src/components/Modals/OidcModal.test.tsx
import React from "react";
import {
  render,
  screen,
  act,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

import OidcModal from "./OidcModal";
import axiosClient from "../../utils/axios_client";

vi.mock("../../utils/axios_client");

// Test data constants
const MOCK_PROVIDERS = [
  { id: "google", name: "Google" },
  { id: "github", name: "GitHub" },
];

const MOCK_GOOGLE_PROVIDER = [{ id: "google", name: "Google" }];

const MOCK_OAUTH_RESPONSE = {
  data: { redirect_uri: "https://oauth.example.com/callback" }
};

describe("OidcModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.location.href to prevent navigation errors in tests
    delete (window as any).location;
    window.location = { href: "" } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = async (providers: any = MOCK_PROVIDERS) => {
    vi.mocked(axiosClient).get.mockResolvedValueOnce({ data: providers });

    await act(async () => {
      render(<OidcModal />);
    });
  };

  it("fetches providers on mount and displays the SSO button", async () => {
    await renderModal(MOCK_PROVIDERS);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Sign in with SSO/i })).toBeInTheDocument();
    });

    expect(vi.mocked(axiosClient).get).toHaveBeenCalledWith(
      "/auth/providers",
      { skipAuth: true }
    );
  });

  it("displays providers in the modal when opened", async () => {
    const user = userEvent.setup();
    
    await renderModal(MOCK_PROVIDERS);

    // Click the SSO button to open the modal
    await user.click(screen.getByRole("button", { name: /Sign in with SSO/i }));

    await waitFor(() => {
      expect(screen.getByText("Google")).toBeInTheDocument();
      expect(screen.getByText("GitHub")).toBeInTheDocument();
    });
  });

  it("handles provider selection and form submission", async () => {
    const user = userEvent.setup();
    
    vi.mocked(axiosClient).get.mockResolvedValueOnce({ data: MOCK_GOOGLE_PROVIDER });
    vi.mocked(axiosClient).post.mockResolvedValueOnce(MOCK_OAUTH_RESPONSE);

    await renderModal(MOCK_GOOGLE_PROVIDER);

    // Click the SSO button to open the modal
    await user.click(screen.getByRole("button", { name: /Sign in with SSO/i }));

    await waitFor(() => {
      expect(screen.getByText("Google")).toBeInTheDocument();
    });

    // Fill in the form
    await user.type(screen.getByLabelText(/User Name/i), "testuser");
    await user.selectOptions(screen.getByLabelText(/Select a provider/i), "google");
    
    // Submit the form
    await user.click(screen.getByRole("button", { name: /Continue with SSO/i }));

    await waitFor(() => {
      expect(vi.mocked(axiosClient).post).toHaveBeenCalledWith(
        "/auth/client-select",
        { username: "testuser", provider: "google" },
        { skipAuth: true }
      );
      // Verify that window.location.href was set to the redirect URI
      expect(window.location.href).toBe("https://oauth.example.com/callback");
    });
  });

  it("shows loading state when no providers are available", async () => {
    // Ensure fresh mock setup for this test
    vi.mocked(axiosClient).get.mockReset();
    const networkError = new Error("Network error");
    vi.mocked(axiosClient).get.mockRejectedValueOnce(networkError);

    await act(async () => {
      render(<OidcModal />);
    });

    // Wait a bit for the useEffect to execute and state to update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // The button should not appear if fetch failed
    expect(screen.queryByRole("button", { name: /Sign in with SSO/i })).not.toBeInTheDocument();
  });

  it("handles network timeout gracefully", async () => {
    const timeoutError = new Error("Request timeout");
    timeoutError.name = "TimeoutError";
    vi.mocked(axiosClient).get.mockRejectedValueOnce(timeoutError);

    await act(async () => {
      render(<OidcModal />);
    });

    expect(screen.queryByRole("button", { name: /Sign in with SSO/i })).not.toBeInTheDocument();
  });

  it("handles network unavailable (no internet connection)", async () => {
    const networkError = new Error("Network request failed");
    networkError.name = "NetworkError";
    vi.mocked(axiosClient).get.mockRejectedValueOnce(networkError);

    await act(async () => {
      render(<OidcModal />);
    });

    expect(screen.queryByRole("button", { name: /Sign in with SSO/i })).not.toBeInTheDocument();
  });

  it("handles 503 Service Unavailable error", async () => {
    const error = new Error("Service Unavailable");
    (error as any).response = { status: 503 };
    vi.mocked(axiosClient).get.mockRejectedValueOnce(error);

    await act(async () => {
      render(<OidcModal />);
    });

    expect(screen.queryByRole("button", { name: /Sign in with SSO/i })).not.toBeInTheDocument();
  });

  it("handles 500 Internal Server Error", async () => {
    const error = new Error("Internal Server Error");
    (error as any).response = { status: 500 };
    vi.mocked(axiosClient).get.mockRejectedValueOnce(error);

    await act(async () => {
      render(<OidcModal />);
    });

    expect(screen.queryByRole("button", { name: /Sign in with SSO/i })).not.toBeInTheDocument();
  });

  it("does not render SSO button when empty providers array is returned", async () => {
    await renderModal([]);

    expect(screen.queryByRole("button", { name: /Sign in with SSO/i })).not.toBeInTheDocument();
  });
});