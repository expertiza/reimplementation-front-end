import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AssignGrade from '../AssignGrade';

// Mock the useLoaderData hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLoaderData: () => ({
    assignmentId: 1,
    assignmentName: 'Program 1',
    teamName: 'Team Hornets',
    submissionSummary: 'This is a placeholder submission summary describing the tasks, code, or content the team has submitted for the assignment.',
    peerReviews: [
      {
        reviewerName: 'student9183',
        score: 93,
        comment: 'Excellent work! Very thorough and well-documented.',
      },
      {
        reviewerName: 'student9173',
        score: 88,
        comment: 'Good submission, but could use more detailed comments in the code.',
      },
    ],
  }),
}));

describe('AssignGrade Component', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AssignGrade />
      </BrowserRouter>
    );
  };

  test('renders the assignment name', () => {
    renderComponent();
    expect(screen.getByText('Summary Report for assignment: Program 1')).toBeInTheDocument();
  });

  test('renders the submission summary', () => {
    renderComponent();
    expect(screen.getByText('Submission Summary')).toBeInTheDocument();
    expect(screen.getByText('This is a placeholder submission summary describing the tasks, code, or content the team has submitted for the assignment.')).toBeInTheDocument();
  });

  test('renders peer review scores', () => {
    renderComponent();
    expect(screen.getByText('Teammate Review')).toBeInTheDocument();
    expect(screen.getByText('student9183')).toBeInTheDocument();
    expect(screen.getByText('student9173')).toBeInTheDocument();
    expect(screen.getByText('93')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('Excellent work! Very thorough and well-documented.')).toBeInTheDocument();
    expect(screen.getByText('Good submission, but could use more detailed comments in the code.')).toBeInTheDocument();
  });

  test('renders grade and comment form', () => {
    renderComponent();
    expect(screen.getByText('Grade and Comment for Submission')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter numeric or letter grade')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add any comments for the team here')).toBeInTheDocument();
    expect(screen.getByText('Submit Grade')).toBeInTheDocument();
  });

  test('submit button is disabled when form is empty', () => {
    renderComponent();
    const submitButton = screen.getByText('Submit Grade');
    expect(submitButton).toBeDisabled();
  });

  test('submit button is enabled when form is filled', () => {
    renderComponent();
    
    // Fill in the form
    const gradeInput = screen.getByPlaceholderText('Enter numeric or letter grade');
    const commentInput = screen.getByPlaceholderText('Add any comments for the team here');
    
    fireEvent.change(gradeInput, { target: { value: '95' } });
    fireEvent.change(commentInput, { target: { value: 'Great work!' } });
    
    const submitButton = screen.getByText('Submit Grade');
    expect(submitButton).not.toBeDisabled();
  });

  test('form submission shows alert', () => {
    // Mock window.alert
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderComponent();
    
    // Fill in the form
    const gradeInput = screen.getByPlaceholderText('Enter numeric or letter grade');
    const commentInput = screen.getByPlaceholderText('Add any comments for the team here');
    
    fireEvent.change(gradeInput, { target: { value: '95' } });
    fireEvent.change(commentInput, { target: { value: 'Great work!' } });
    
    // Submit the form
    const submitButton = screen.getByText('Submit Grade');
    fireEvent.click(submitButton);
    
    // Check if alert was called
    expect(alertMock).toHaveBeenCalledWith('Grade submitted! (See the console for details.)');
    
    // Restore the original alert
    alertMock.mockRestore();
  });
}); 