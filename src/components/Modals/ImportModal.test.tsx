import React, { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";

import ImportModal from "./ImportModal";

const mockUseAPI = vi.fn();

vi.mock("../../hooks/useAPI", () => ({
  __esModule: true,
  default: (...args: any[]) => mockUseAPI(...args),
}));

type UseAPIResult = {
  error: unknown;
  isLoading: boolean;
  data: any;
  sendRequest: ReturnType<typeof vi.fn>;
};

const makeUseAPIResult = (overrides: Partial<UseAPIResult> = {}): UseAPIResult => ({
  error: null,
  isLoading: false,
  data: null,
  sendRequest: vi.fn(),
  ...overrides,
});

const IMPORT_METADATA = {
  mandatory_fields: ["email"],
  optional_fields: ["name"],
  external_fields: ["external_id"],
  available_actions_on_dup: ["skip", "overwrite"],
};

describe("ImportModal", () => {
  const onHide = vi.fn();

  beforeEach(() => {
    mockUseAPI.mockReset();
    onHide.mockReset();
  });

  it("shows loading state when isLoading is true", async () => {
    // All useAPI calls in this render return loading=true
    mockUseAPI.mockReturnValue(
      makeUseAPIResult({ isLoading: true })
    );

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="User" />);
    });

    expect(screen.getByText(/Loading…/i)).toBeInTheDocument();
  });

  it("renders field summary and duplicate options from metadata", async () => {
    mockUseAPI.mockReturnValue(
      makeUseAPIResult({ data: { data: IMPORT_METADATA } })
    );

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="Team" />);
    });

    // Just assert the section labels exist
    await screen.findByText(/Mandatory fields:/i);
    await screen.findByText(/Optional fields:/i);
    await screen.findByText(/External fields:/i);

    // And separately assert the field names are rendered somewhere
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("external_id")).toBeInTheDocument();

    const skipRadio = screen.getByLabelText("skip") as HTMLInputElement;
    const overwriteRadio = screen.getByLabelText("overwrite") as HTMLInputElement;

    expect(skipRadio).toBeInTheDocument();
    expect(overwriteRadio).toBeInTheDocument();
    expect(skipRadio.checked).toBe(true);
  });


  it("shows status when importing with no file selected", async () => {
    const user = userEvent.setup();

    mockUseAPI.mockReturnValue(
      makeUseAPIResult({ data: { data: IMPORT_METADATA } })
    );

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="Team" />);
    });

    await screen.findByText(/Mandatory fields:/i);

    const importButton = screen.getByRole("button", { name: /import/i });

    await act(async () => {
      await user.click(importButton);
    });

    expect(
      await screen.findByText(/Please select a CSV file/i)
    ).toBeInTheDocument();
  });

  it("shows column mapping and first-row values when header mode is off", async () => {
    const user = userEvent.setup();

    mockUseAPI.mockReturnValue(
      makeUseAPIResult({ data: { data: IMPORT_METADATA } })
    );

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="Team" />);
    });

    await screen.findByText(/Mandatory fields:/i);

    const fileInput = screen.getByLabelText(/CSV file/i) as HTMLInputElement;

    // Fake "File" object with a .text() method so ImportModal's on_file_changed works
    const fakeFile = {
      name: "test.csv",
      text: vi.fn().mockResolvedValue(
        "email,name\nuser@example.com,Test User"
      ),
    };

    await act(async () => {
      fireEvent.change(fileInput, {
        target: { files: [fakeFile] as any },
      });
    });

    // Turn off header mode
    const headerSwitch = screen.getByLabelText(
      /First row contains headers/i
    ) as HTMLInputElement;

    await act(async () => {
      await user.click(headerSwitch);
    });

    expect(headerSwitch.checked).toBe(false);

    const columnOrderLabel = await screen.findByText(/Column order/i);
    expect(columnOrderLabel).toBeInTheDocument();

    // First-row preview text
    await screen.findByText(/First Row Value: user@example\.com/i);
    await screen.findByText(/First Row Value: Test User/i);
  });

  it("calls sendImport when import is valid", async () => {
    const user = userEvent.setup();
    const sendImportSpy = vi.fn();

    mockUseAPI.mockReturnValue(
      makeUseAPIResult({
        data: { data: IMPORT_METADATA },
        sendRequest: sendImportSpy,
      })
    );

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="Team" />);
    });

    await screen.findByText(/Mandatory fields:/i);

    const fileInput = screen.getByLabelText(/CSV file/i) as HTMLInputElement;

    const fakeFile = {
      name: "test.csv",
      text: vi.fn().mockResolvedValue(
        "email,email\nuser1@example.com,user2@example.com"
      ),
    };

    await act(async () => {
      fireEvent.change(fileInput, {
        target: { files: [fakeFile] as any },
      });
    });

    const importButton = screen.getByRole("button", { name: /import/i });

    await act(async () => {
      await user.click(importButton);
    });

    // Don't rely on exact call count; just ensure it was called
    expect(sendImportSpy).toHaveBeenCalled();
  });

  it("calls onHide when cancel is clicked", async () => {
    mockUseAPI.mockReturnValue(
      makeUseAPIResult({ data: { data: IMPORT_METADATA } })
    );

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="Team" />);
    });

    await screen.findByText(/Mandatory fields:/i);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    await act(async () => {
      cancelButton.click();
    });

    expect(onHide).toHaveBeenCalled();
  });
});
