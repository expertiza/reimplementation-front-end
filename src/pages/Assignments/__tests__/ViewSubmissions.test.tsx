import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ViewSubmissions from '../ViewSubmissions';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mock the useLoaderData hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLoaderData: () => ({
    id: 1,
    name: 'Test Assignment',
    due_date: '2025-12-01T00:00:00Z'
  }),
  useNavigate: () => jest.fn()
}));

describe('ViewSubmissions Component', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ViewSubmissions />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders the component with correct title', () => {
    renderComponent();
    expect(screen.getByText('View Submissions - Test Assignment')).toBeInTheDocument();
  });

  it('displays table headers correctly', () => {
    renderComponent();
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('Team Name');
    expect(headers[1]).toHaveTextContent('Team Member(s)');
    expect(headers[2]).toHaveTextContent('Links');
    expect(headers[3]).toHaveTextContent('History');
  });

  it('displays submission data correctly', () => {
    renderComponent();
    // Check for the first team name
    const teamNameElement = screen.getByText('Anonymized_Team_38121');
    expect(teamNameElement).toBeInTheDocument();
    expect(teamNameElement).toHaveClass('team-name');
    
    // Check for links in the nested table
    const cells = screen.getAllByRole('cell');
    const linksCell = cells.find(cell => cell.textContent?.includes('repo1'));
    expect(linksCell).toBeInTheDocument();
  });

  it('displays nested table headers in Links column', () => {
    renderComponent();
    // Find the cells containing the links table (it's in the third column)
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1]; // First row after header
    const cells = within(firstDataRow).getAllByRole('cell');
    const linksCell = cells[2]; // Third column contains links

    // Check the headers within the nested table
    const nestedHeaders = within(linksCell).getAllByRole('columnheader');
    expect(nestedHeaders).toHaveLength(4);
    expect(nestedHeaders[0]).toHaveTextContent('Name');
    expect(nestedHeaders[1]).toHaveTextContent('Size');
    expect(nestedHeaders[2]).toHaveTextContent('Type');
    expect(nestedHeaders[3]).toHaveTextContent('Modified');
  });

  it('shows correct button text based on deadline', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    const mockAssignment = {
      id: 1,
      name: 'Test Assignment',
      due_date: futureDate.toISOString()
    };

    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useLoaderData: () => mockAssignment,
      useNavigate: () => jest.fn()
    }));

    renderComponent();
    const reviewButtons = screen.getAllByRole('button', { name: 'View Reviews' });
    expect(reviewButtons.length).toBeGreaterThan(0);
  });

  it('renders team members correctly', () => {
    renderComponent();
    const buttons = screen.getAllByRole('button');
    const memberButton = buttons.find(button => button.textContent === 'gh_user_10000');
    expect(memberButton).toBeInTheDocument();
    
    const cells = screen.getAllByRole('cell');
    const memberCell = cells.find(cell => cell.textContent?.includes('Student 10000'));
    expect(memberCell).toBeInTheDocument();
  });

  it('has correct link styling', () => {
    renderComponent();
    const buttons = screen.getAllByRole('button');
    const memberLinks = buttons.filter(button => button.textContent?.startsWith('gh_user_'));
    expect(memberLinks.length).toBeGreaterThan(0);
    expect(memberLinks[0]).toHaveClass('submission-link');
  });

  it('renders history button for each submission', () => {
    renderComponent();
    const historyButtons = screen.getAllByRole('button', { name: 'History' });
    expect(historyButtons.length).toBeGreaterThan(0);
    expect(historyButtons[0]).toHaveClass('submission-link');
  });

  it('handles different assignment states', () => {
  const pastDueDate = new Date();
  pastDueDate.setFullYear(pastDueDate.getFullYear() - 1);
  
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLoaderData: () => ({
      id: 1,
      name: 'Past Due Assignment',
      due_date: pastDueDate.toISOString()
    }),
    useNavigate: () => jest.fn()
  }));

  it('validates data formatting', () => {
  renderComponent();
  
  
  const dates = screen.getAllByText(/\d{4}-\d{2}-\d{2}/);
  dates.forEach(dateElement => {
    const dateText = dateElement.textContent;
    expect(dateText).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it('applies correct table sizing', () => {
    renderComponent();
    const tables = screen.getAllByRole('table');
    expect(tables.length).toBeGreaterThan(0);
    
    const tableContainer = screen.getByTestId('submission-table-container');
    expect(tableContainer).toHaveStyle({ width: '100%' });
  });
});