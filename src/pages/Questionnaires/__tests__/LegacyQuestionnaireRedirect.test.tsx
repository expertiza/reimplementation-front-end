import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import LegacyQuestionnaireRedirect from "../LegacyQuestionnaireRedirect";

describe("legacy questionnaire editing", () => {
  it.each(["/questionnaire/edit/123", "/administrator/questionnaire/edit/123"])(
    "redirects %s with the matched ID and replaces history", async (path) => {
      const router = createMemoryRouter([
        { path: "/before", element: <div>Before</div> },
        { path: "/questionnaire/edit/:id", element: <LegacyQuestionnaireRedirect /> },
        { path: "/administrator/questionnaire/edit/:id", element: <LegacyQuestionnaireRedirect /> },
        { path: "/questionnaires/edit/:id", element: <div>Editor</div> },
      ], { initialEntries: ["/before", path] });
      render(<RouterProvider router={router} />);
      expect(await screen.findByText("Editor")).toBeInTheDocument();
      expect(router.state.location.pathname).toBe("/questionnaires/edit/123");
      expect(router.state.historyAction).toBe("REPLACE");
      await router.navigate(-1);
      await waitFor(() => expect(router.state.location.pathname).toBe("/before"));
    }
  );
});
