import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import Header from "../../../layout/Header";
import { ROLE } from "../../../utils/interfaces";

describe("questionnaire navigation permissions", () => {
  it.each([ROLE.TA, ROLE.INSTRUCTOR, ROLE.ADMIN, ROLE.SUPER_ADMIN])(
    "matches route permissions for %s", async (role) => {
      const store = configureStore({ reducer: {
        authentication: () => ({ isAuthenticated: true, user: { role } }),
      } });
      render(<Provider store={store}><MemoryRouter><Header /></MemoryRouter></Provider>);
      await userEvent.click(screen.getByRole("button", { name: "Manage" }));
      if (role === ROLE.TA) {
        expect(screen.queryByRole("link", { name: "Questionnaires" })).not.toBeInTheDocument();
      } else {
        expect(screen.getByRole("link", { name: "Questionnaires" })).toHaveAttribute("href", "/questionnaires");
      }
    }
  );
});
