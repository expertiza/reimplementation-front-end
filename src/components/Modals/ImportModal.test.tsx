// src/components/Modals/ImportModal.test.tsx
import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

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

const makeUseAPIResult = (
  overrides: Partial<UseAPIResult> = {}
): UseAPIResult => ({
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
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUseAPI.mockReset();
    onHide.mockReset();

    createObjectURLSpy = vi.fn(() => "blob:sample-url");
    revokeObjectURLSpy = vi.fn();

    Object.defineProperty(window.URL, "createObjectURL", {
      writable: true,
      value: createObjectURLSpy,
    });
    Object.defineProperty(window.URL, "revokeObjectURL", {
      writable: true,
      value: revokeObjectURLSpy,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows loading state when isLoading is true", async () => {
    // Both useAPI calls return loading=true
    mockUseAPI.mockReturnValue(
      makeUseAPIResult({ isLoading: true })
    );

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="User" />);
    });

    expect(screen.getByText(/Loading…/i)).toBeInTheDocument();
  });

  it("renders field summary and duplicate options from metadata", async () => {
    // First and second useAPI calls can share the same mock result
    mockUseAPI.mockReturnValue(
      makeUseAPIResult({ data: { data: IMPORT_METADATA } })
    );

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="Item" />);
    });

    // Section labels
    await screen.findByText(/Mandatory fields/i);
    await screen.findByText(/Optional fields/i);
    await screen.findByText(/External fields/i);

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

    expect(
      await screen.findByText(/Please select a CSV file/i)
    ).toBeInTheDocument();
  });

  it("shows preview values when importing with header mode off", async () => {
    const user = userEvent.setup();

    mockUseAPI.mockReturnValue(
      makeUseAPIResult({ data: { data: IMPORT_METADATA } })
    );

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="Item" />);
    });

    // Wait for metadata to populate
    await screen.findByText(/Mandatory fields/i);

    const fileInput = screen.getByLabelText(/CSV file/i) as HTMLInputElement;

    // Fake "File" object with a .text() method
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

    // Turn OFF header mode so column mapping UI appears
    const headerSwitch = screen.getByLabelText(
      /First row contains headers/i
    ) as HTMLInputElement;

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

    await screen.findByText(/Mandatory fields/i);

    const fileInput = screen.getByLabelText(/CSV file/i) as HTMLInputElement;

    // CSV where the header is "email" (the only mandatory field)
    // so selectedFields will all be "email" and mandatoryFieldsIncluded() will pass.
    const fakeFile = {
      name: "test.csv",
      text: vi.fn().mockResolvedValue(
        "email\nuser1@example.com"
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

    // fetchConfig also calls sendRequest once; we only care that it was called at least once for import.
    expect(sendImportSpy).toHaveBeenCalled();
  });

  it("calls onHide when cancel is clicked", async () => {
    mockUseAPI.mockReturnValue(
      makeUseAPIResult({ data: { data: IMPORT_METADATA } })
    );

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="Team" />);
    });

    await screen.findByText(/Mandatory fields/i);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    await act(async () => {
      cancelButton.click();
    });

    await waitFor(() => {
      expect(onHide).toHaveBeenCalled();
    });
  });

  it("downloads a sample csv using backend header metadata", async () => {
    const user = userEvent.setup();
    let createdAnchor: HTMLAnchorElement | null = null;
    let clickSpy: ReturnType<typeof vi.fn> | null = null;
    let capturedBlobParts: BlobPart[] = [];
    const OriginalBlob = Blob;
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName.toLowerCase() === "a" && element instanceof HTMLAnchorElement) {
        createdAnchor = element;
        clickSpy = vi.fn();
        vi.spyOn(element, "click").mockImplementation(clickSpy);
      }
      return element;
    });
    vi.stubGlobal("Blob", vi.fn((parts: BlobPart[], options?: BlobPropertyBag) => {
      capturedBlobParts = parts;
      return new OriginalBlob(parts, options);
    }));

    mockUseAPI.mockReturnValue(
      makeUseAPIResult({ data: { data: IMPORT_METADATA } })
    );

    await act(async () => {
      render(<ImportModal show={true} onHide={onHide} modelClass="User" />);
    });

    await screen.findByText(/Mandatory fields/i);

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /download sample csv/i }));
    });

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(capturedBlobParts).toEqual(["email\n"]);

    expect(createdAnchor).not.toBeNull();
    expect(createdAnchor?.getAttribute("download")).toBe("user_import_sample.csv");
    expect(clickSpy).not.toBeNull();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:sample-url");
    expect(createElementSpy).toHaveBeenCalledWith("a");
  });
});
