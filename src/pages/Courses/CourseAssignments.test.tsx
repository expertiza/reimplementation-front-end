import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test/test-utils'
import CourseAssignments from '../Courses/CourseAssignments'

// IMPORTANT: mock path must exactly match how the component imports it.
// If the component uses "@/hooks/useAPI", change it here too.
vi.mock('hooks/useAPI', () => {
  const list: any = [
    {
      id: 1,
      course_id: 101,               // ✅ must match the test's courseId
      name: 'Assignment 1',
      courseName: 'Test Course',
      description: 'Description 1',
      created_at: '2023-01-01',
      updated_at: '2023-01-02',
    },
    {
      id: 2,
      course_id: 101,               // ✅ must match the test's courseId
      name: 'Assignment 2',
      courseName: 'Test Course',
      description: 'Description 2',
      created_at: '2023-01-03',
      updated_at: '2023-01-04',
    },
  ];
  // support code paths that read `data` or `data.data`
  list.data = [...list];

  return {
    default: () => ({
      error: null,
      isLoading: false,
      data: list,
      sendRequest: vi.fn(),         // called by component's useEffect; no-op here
    }),
  };
});

describe('CourseAssignments', () => {
  const mockCourseId = 101
  const mockCourseName = 'Test Course'

  it('renders the component correctly', () => {
    renderWithProviders(<CourseAssignments courseId={mockCourseId} courseName={mockCourseName} />)
    expect(screen.getByText(`Assignments for ${mockCourseName}`)).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders assignments in the table', () => {
    renderWithProviders(<CourseAssignments courseId={mockCourseId} courseName={mockCourseName} />)
    // should now have header + 2 rows
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(1)
    expect(screen.getByText('Assignment 1')).toBeInTheDocument()
    expect(screen.getByText('Assignment 2')).toBeInTheDocument()
  })

  it('triggers edit and delete actions correctly', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    renderWithProviders(<CourseAssignments courseId={mockCourseId} courseName={mockCourseName} />)

    // If your buttons are icon-only or not named "Edit/Delete",
    // just grab all buttons in the Actions column.
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)

    // Click the first two action buttons if present.
    // Adjust if your UI uses a single "⋯" menu etc.
    await user.click(buttons[0])
    if (buttons[1]) await user.click(buttons[1])

    // Keep your intent checks; adapt the messages if your component logs differently
    expect(consoleSpy).toHaveBeenCalledWith(
      'Edit assignment:',
      expect.objectContaining({ name: 'Assignment 1' })
    )
    expect(consoleSpy).toHaveBeenCalledWith(
      'Delete assignment:',
      expect.objectContaining({ name: 'Assignment 1' })
    )

    consoleSpy.mockRestore()
  })
})
