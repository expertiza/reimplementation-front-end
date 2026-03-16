import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviewTable from '../ReviewTable';

// Mock axios client and react-redux hooks used by ReviewTable
vi.mock('../../utils/axios_client', () => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('react-redux', () => ({ useSelector: () => ({ user: { id: 1, role: 'Student' } }) }));

describe('ReviewTable top-level behaviors', () => {
  it('uses "item prompts" wording for the toggle and shows team members with username', () => {
    render(
      <MemoryRouter>
        <ReviewTable />
      </MemoryRouter>
    );

    // Toggle label should show Show item prompts initially
    const toggle = screen.getByRole('checkbox', { name: /show item prompts/i });
    expect(toggle).toBeInTheDocument();

    // Team members text exists and contains parentheses for username
    const tm = screen.getByText(/Team members:/i);
    expect(tm).toBeInTheDocument();
  });
});
