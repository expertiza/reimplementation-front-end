import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Mock the useAPI hook to return mock assignments
jest.mock('hooks/useAPI', () => () => ({
  error: null,
  isLoading: false,
  data: {
    data: [
      {
        id: 1,
        name: 'Assignment 1',
        courseName: 'Test Course',
        description: 'Description 1',
        created_at: '2023-01-01',
        updated_at: '2023-01-02',
      },
      {
        id: 2,
        name: 'Assignment 2',
        courseName: 'Test Course',
        description: 'Description 2',
        created_at: '2023-01-03',
        updated_at: '2023-01-04',
      },
    ],
  },
  sendRequest: jest.fn(),
}));

import CourseAssignments from './CourseAssignments';

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('CourseAssignments', () => {
  const mockCourseId = 101;
  const mockCourseName = 'Test Course';

  it('renders the component correctly', () => {
    renderWithRouter(<CourseAssignments courseId={mockCourseId} courseName={mockCourseName} />);
    expect(screen.getByText(`Assignments for ${mockCourseName}`)).toBeInTheDocument();
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('renders assignments in the table', () => {
    renderWithRouter(<CourseAssignments courseId={mockCourseId} courseName={mockCourseName} />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1); // Header + assignment rows
    expect(screen.getByText('Assignment 1')).toBeInTheDocument();
    expect(screen.getByText('Assignment 2')).toBeInTheDocument();
  });

  it('triggers edit and delete actions correctly', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    renderWithRouter(<CourseAssignments courseId={mockCourseId} courseName={mockCourseName} />);
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

    expect(editButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);

    await userEvent.click(editButtons[0]);
    await userEvent.click(deleteButtons[0]);

    expect(consoleSpy).toHaveBeenCalledWith('Edit assignment:', expect.objectContaining({ name: 'Assignment 1' }));
    expect(consoleSpy).toHaveBeenCalledWith('Delete assignment:', expect.objectContaining({ name: 'Assignment 1' }));

    consoleSpy.mockRestore();
  });
});
