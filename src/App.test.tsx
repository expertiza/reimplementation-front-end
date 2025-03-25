import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ReviewTable from 'components/HeatGrid/ReviewTable';

import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});


describe("ReviewTable page", () => {
  const setup = () =>
    render(
      <MemoryRouter initialEntries={["/view-team-grades"]}>
        <Routes>
          <Route path="/view-team-grades" element={<ReviewTable />} />
        </Routes>
      </MemoryRouter>
    );

  test("renders summary report and team info", async () => {
    setup();
    expect(screen.getByText(/Summary Report: Program 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Team:/i)).toBeInTheDocument();
  });

  test("renders submission links", async () => {
    setup();
    expect(
      screen.getByText("https://github.ncsu.edu/Program-2-Ruby-on-Rails/WolfEvents")
    ).toBeInTheDocument();
    expect(screen.getByText("README.md")).toBeInTheDocument();
  });

  test("renders round selector", () => {
    setup();
    expect(screen.getByText(/Round/i)).toBeInTheDocument();
  });

  test("renders word count checkboxes", () => {
    setup();
    expect(screen.getByLabelText(/> 10 Word Comments/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/> 20 Word Comments/i)).toBeInTheDocument();
  });

  test("shows Word Count column when checkbox is selected", async () => {
    setup();

    // Before clicking: Word Count column should not be visible
    expect(screen.queryByText(/Word Count/i)).not.toBeInTheDocument();

    // Click the checkbox to show word count
    const checkbox10 = screen.getByLabelText(/> 10 Word Comments/i);
    fireEvent.click(checkbox10);

    // Wait for DOM update
    await waitFor(() => {
      expect(screen.getAllByText(/Word Count/i).length).toBeGreaterThan(0);
    });
  });

  test("toggle sort by total score", () => {
    setup();
    const button = screen.getByText(/Sort by Total Review Score/i);
    fireEvent.click(button);
    expect(button.textContent).toMatch(/desc|asc/i);
  });
});

