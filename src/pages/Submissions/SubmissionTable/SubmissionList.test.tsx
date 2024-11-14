import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubmissionList from './SubmissionList';

const mockSubmissions = [
  {
    id: 1,
    teamName: 'Team B',
    assignment: 'Assignment 1',
    members: [{ name: 'Student 1', id: 1 }],
    links: [],
    fileInfo: [],
  },
  {
    id: 2,
    teamName: 'Team A',
    assignment: 'Assignment 1',
    members: [{ name: 'Student 2', id: 2 }],
    links: [],
    fileInfo: [],
  },
];

const mockOnGradeClick = jest.fn();

describe('SubmissionList', () => {
  it('renders submission entries correctly', () => {
    render(
      <BrowserRouter>
        <SubmissionList submissions={mockSubmissions} onGradeClick={mockOnGradeClick} />
      </BrowserRouter>
    );

    // Check if submission entry is rendered
    expect(screen.getByText('Team B')).toBeTruthy();
    expect(screen.getByText('Team A')).toBeTruthy();
  });

  it('sorts the submissions by team name', () => {
    render(
      <BrowserRouter>
        <SubmissionList submissions={mockSubmissions} onGradeClick={mockOnGradeClick} />
      </BrowserRouter>
    );
  
    // Click the team name header to sort ascending
    const teamNameHeader = screen.getByText('Team Name');
    fireEvent.click(teamNameHeader);
  
    // Get the rows that contain submission entries
    const rows = screen.getAllByRole('row');
  
    // Check the order of the first two submission rows (excluding the header)
    expect(rows[1].innerHTML).toContain('Team A'); 
    expect(rows[2].innerHTML).toContain('Team B');
  
    // Click again to sort descending
    fireEvent.click(teamNameHeader);
  
    // Get the rows again after sorting
    const sortedRows = screen.getAllByRole('row');
  
    // Check the order of the first two submission rows (excluding the header)
    expect(sortedRows[1].innerHTML).toContain('Team B');
    expect(sortedRows[2].innerHTML).toContain('Team A'); 
  });
  
});
