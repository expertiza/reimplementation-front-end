import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubmissionList from './SubmissionList';

const mockSubmissions = [
  {
    id: 1,
    teamName: 'Anonymized_Team_38121',
    assignment: 'Assignment 1',
    members: [{ name: 'Student 1', id: 1 }],
    links: [],
    fileInfo: [],
  },
];

const mockOnGradeClick = jest.fn();

describe('SubmissionEntry', () => {
  it('displays the correct team name', () => {
    render(
      <BrowserRouter>
        <SubmissionList submissions={mockSubmissions} onGradeClick={mockOnGradeClick} />
      </BrowserRouter>
    );
    
    // Check if team name is rendered correctly
    expect(screen.getByText('Anonymized_Team_38121')).toBeTruthy();
  });

  it('calls onGradeClick when the grade button is clicked', () => {
    render(
      <BrowserRouter>
        <SubmissionList submissions={mockSubmissions} onGradeClick={mockOnGradeClick} />
      </BrowserRouter>
    );
    
    // Simulate the button click
    const button = screen.getByRole('button', { name: /Assign Grade/i });
    fireEvent.click(button);

    expect(mockOnGradeClick).toHaveBeenCalledWith(mockSubmissions[0].id);
  });
});
