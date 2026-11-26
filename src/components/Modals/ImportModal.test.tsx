// src/components/Modals/ImportModal.test.tsx
import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
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
  available_actions_on_dup: ["SkipRecordAction", "UpdateExistingRecordAction"],
};

describe("ImportModal", () => {
  const onHide = vi.fn();

  beforeEach(() => {
    mockUseAPI.mockReset();
    onHide.mockReset();
  });

  it("shows loading state when isLoading is true", async () => {
    // Both useAPI calls return loading=true
    mockUseAPI.mockReturnValue(makeUseAPIResult({ isLoading: true }));

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="User" />);
    });

    expect(screen.getByText(/Loading…/i)).toBeInTheDocument();
  });

  it("renders field summary and duplicate options from metadata", async () => {
    // First and second useAPI calls can share the same mock result
    mockUseAPI.mockReturnValue(makeUseAPIResult({ data: { data: IMPORT_METADATA } }));

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="Item" />);
    });

    // Section labels
    const line = (label: RegExp) => screen.getByText(label).parentElement;
    await screen.findByText(/Required columns/i);
    expect(line(/Required columns/i)).toHaveTextContent("Required columns: Email");
    expect(line(/Optional columns/i)).toHaveTextContent("Optional columns: Name");
    expect(line(/External columns/i)).toHaveTextContent("External columns: External id");
    expect(screen.getByText("Turn off to match columns yourself.")).toBeInTheDocument();

    // Duplicate handling radios
    expect(screen.getByText("SkipRecordAction")).toBeInTheDocument();
    expect(screen.getByText("UpdateExistingRecordAction")).toBeInTheDocument();
    const [skipRadio, overwriteRadio] = screen.getAllByRole("radio") as HTMLInputElement[];

    expect(skipRadio).toBeInTheDocument();
    expect(overwriteRadio).toBeInTheDocument();
    // First option should be selected by default
    expect(skipRadio.checked).toBe(true);

    // Switching duplicate option should update selection
    await act(async () => {
      overwriteRadio.click();
    });

    expect(overwriteRadio.checked).toBe(true);
    expect(skipRadio.checked).toBe(false);
  });

  it("shows status when importing with no file selected", async () => {
    const user = userEvent.setup();

    // No metadata needed here; just a basic hook result
    mockUseAPI.mockReturnValue(makeUseAPIResult());

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="Team" />);
    });

    const importButton = screen.getByRole("button", { name: /import/i });

    await act(async () => {
      await user.click(importButton);
    });

    expect(await screen.findByText(/Please select a CSV file/i)).toBeInTheDocument();
  });

  it("shows preview values when importing with header mode off", async () => {
    const user = userEvent.setup();

    mockUseAPI.mockReturnValue(makeUseAPIResult({ data: { data: IMPORT_METADATA } }));

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="Item" />);
    });

    // Wait for metadata to populate
    await screen.findByText(/Required columns/i);

    const fileInput = screen.getByLabelText(/CSV file/i) as HTMLInputElement;

    // Fake "File" object with a .text() method
    const fakeFile = {
      name: "test.csv",
      text: vi.fn().mockResolvedValue("email,name\nuser@example.com,Test User"),
    };

    await act(async () => {
      fireEvent.change(fileInput, {
        target: { files: [fakeFile] as any },
      });
    });

    // Turn OFF header mode so column mapping UI appears
    const headerSwitch = screen.getByLabelText(/First row contains headers/i) as HTMLInputElement;

    await act(async () => {
      await user.click(headerSwitch);
    });

    expect(headerSwitch.checked).toBe(false);

    // Import now opens a preview/confirmation modal
    const importButton = screen.getByRole("button", { name: /^Import$/i });
    await act(async () => {
      await user.click(importButton);
    });

    await screen.findByText(/Confirm Import - Item/i);
    await screen.findByText("user@example.com");
    await screen.findByText("Test User");
  });

  it("calls sendImport when import is valid", async () => {
    const user = userEvent.setup();
    const sendImportSpy = vi.fn();

    // Single hook result used for both fetchImports and sendImport.
    // sendRequest will act as sendImport here.
    mockUseAPI.mockReturnValue(
      makeUseAPIResult({
        data: { data: IMPORT_METADATA },
        sendRequest: sendImportSpy,
      })
    );

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="Team" />);
    });

    await screen.findByText(/Required columns/i);

    const fileInput = screen.getByLabelText(/CSV file/i) as HTMLInputElement;

    // CSV where the header is "email" (the only mandatory field)
    // so selectedFields will all be "email" and mandatoryFieldsIncluded() will pass.
    const fakeFile = {
      name: "test.csv",
      text: vi.fn().mockResolvedValue("email\nuser1@example.com"),
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

    // fetchConfig also calls sendRequest once; we only care that it was called at least once for import.
    expect(sendImportSpy).toHaveBeenCalled();
  });

  it("calls onHide when cancel is clicked", async () => {
    mockUseAPI.mockReturnValue(makeUseAPIResult({ data: { data: IMPORT_METADATA } }));

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="Team" />);
    });

    await screen.findByText(/Required columns/i);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    await act(async () => {
      cancelButton.click();
    });

    await waitFor(() => {
      expect(onHide).toHaveBeenCalled();
    });
  });

  const chooseFile = async (text: string) => {
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/CSV file/i), {
        target: { files: [{ name: "t.csv", text: vi.fn().mockResolvedValue(text) }] },
      });
    });
  };

  const NO_DUPLICATE_ACTIONS = { ...IMPORT_METADATA, available_actions_on_dup: [] };

  it("hides a column list that has nothing in it", async () => {
    const data = { data: { ...IMPORT_METADATA, external_fields: [] } };
    const sendRequest = vi.fn();
    mockUseAPI.mockReturnValue(makeUseAPIResult({ data, sendRequest }));

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="ProjectTopic" />);
    });

    expect(screen.getByText(/Required columns/)).toBeInTheDocument();
    expect(screen.queryByText(/External columns/)).not.toBeInTheDocument();
  });

  it("uses the readable title in the heading", async () => {
    mockUseAPI.mockReturnValue(makeUseAPIResult({ data: undefined }));
    await act(async () => {
      render(
        <ImportModal
          show
          onHide={onHide}
          modelClass="ProjectTopic"
          title="Topics"
          assignmentId="7"
        />
      );
    });
    expect(screen.getByText("Import Topics")).toBeInTheDocument();
  });

  it("uploads with assignment_id after the preview is confirmed", async () => {
    const user = userEvent.setup();
    const sendRequest = vi.fn();
    const metadata = { data: NO_DUPLICATE_ACTIONS };
    let call = 0;
    // The component calls useAPI twice per render: metadata first, then the upload.
    mockUseAPI.mockImplementation(() =>
      makeUseAPIResult({ data: call++ % 2 === 0 ? metadata : undefined, sendRequest })
    );

    await act(async () => {
      render(<ImportModal show onHide={onHide} modelClass="ProjectTopic" assignmentId="7" />);
    });
    expect(screen.queryByText("Duplicate handling")).not.toBeInTheDocument();

    await chooseFile('topic_name,topic_identifier\n"Design, build",T1');
    await user.click(screen.getByRole("button", { name: /^Import$/ }));
    expect(await screen.findByText("Design, build")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Confirm & Import/ }));

    const upload = sendRequest.mock.calls.map(([c]) => c).find((c) => c.method === "POST");
    expect(upload.url).toBe("/import/ProjectTopic");
    expect(upload.data.get("assignment_id")).toBe("7");
  });

  it("calls onImported on success", async () => {
    const onImported = vi.fn();
    const success = { data: { message: "Topics imported" } };
    let call = 0;
    mockUseAPI.mockImplementation(() =>
      makeUseAPIResult({ data: call++ % 2 === 0 ? undefined : success })
    );

    await act(async () => {
      render(
        <ImportModal show onHide={onHide} modelClass="ProjectTopic" onImported={onImported} />
      );
    });

    expect(onImported).toHaveBeenCalledTimes(1);
  });

  it("shows the error, not an earlier success, and stays open", async () => {
    const onImported = vi.fn();
    const stale = { data: { message: "Topics imported" } };
    let call = 0;
    // Stable like the real hook; a new function per render would keep resetting the status.
    const sendRequest = vi.fn();
    mockUseAPI.mockImplementation(() =>
      call++ % 2 === 0
        ? makeUseAPIResult({ data: undefined, sendRequest })
        : makeUseAPIResult({ data: stale, error: "Nothing was imported. Row 2: bad.", sendRequest })
    );

    await act(async () => {
      render(
        <ImportModal show onHide={onHide} modelClass="ProjectTopic" onImported={onImported} />
      );
    });

    expect(screen.getByText(/Nothing was imported/)).toBeInTheDocument();
    expect(onImported).not.toHaveBeenCalled();
    expect(onHide).not.toHaveBeenCalled();
  });
});
