import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import Questionnaires from "../Questionnaire";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLoaderData: () => [
      {
        id: 2,
        name: "q1",
        private: false,
        questionnaire_type: "Review rubric",
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
        instructor_id: 1,
        instructor: { name: "admin", email: "admin@example.com" },
      },
    ],
    Outlet: () => null,
  };
});

vi.mock("react-redux", () => ({
  useDispatch: () => vi.fn(),
}));

vi.mock("hooks/useAPI", () => ({
  default: () => ({
    error: null,
    isLoading: false,
    data: { data: [] },
    sendRequest: vi.fn(),
  }),
}));

describe("Questionnaire routing", () => {
  it("navigates to plural /questionnaires/edit/:id path", () => {
    render(
      <MemoryRouter>
        <Questionnaires />
      </MemoryRouter>
    );

    // First edit button in table actions
    const editButtons = screen.getAllByLabelText("Edit Questionnaire");
    fireEvent.click(editButtons[0]);

    expect(navigateMock).toHaveBeenCalledWith("/questionnaires/edit/2");
  });
});

