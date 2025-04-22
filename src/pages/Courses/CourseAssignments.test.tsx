import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
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

    // Check if the course name is displayed
    expect(screen.getByText(`Assignments for ${mockCourseName}`)).toBeInTheDocument();

    // Check if the table renders
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('renders assignments in the table', () => {
    renderWithRouter(<CourseAssignments courseId={mockCourseId} courseName={mockCourseName} />);

    // Check for table rows (excluding header row)
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1); // Header + assignment rows
  });

  it('triggers edit and delete actions correctly', async () => {
    // Spy on console.log to check if handlers are called
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  
    renderWithRouter(<CourseAssignments courseId={mockCourseId} courseName={mockCourseName} />);
  
    // Find and verify buttons
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
  
    expect(editButtons).toHaveLength(4); // Adjust based on your table rows
    expect(deleteButtons).toHaveLength(4);
  
    // Trigger clicks
    await userEvent.click(editButtons[0]);
    await userEvent.click(deleteButtons[0]);
  
    // Check exact console log outputs
    const firstAssignment = {
      id: expect.any(Number),
      name: expect.stringContaining('Assignment 1'),
      courseName: mockCourseName,
      description: expect.any(String),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    };
  
    expect(consoleSpy).toHaveBeenCalledWith('Edit assignment:', expect.objectContaining(firstAssignment));
    expect(consoleSpy).toHaveBeenCalledWith('Delete assignment:', expect.objectContaining(firstAssignment));
  
    // Clean up mock
    consoleSpy.mockRestore();
  });
  
});
