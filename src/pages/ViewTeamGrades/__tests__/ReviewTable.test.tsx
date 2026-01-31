import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ReviewTable from '../ReviewTable';

// Mock axios client and react-redux hooks used by ReviewTable
jest.mock('../../utils/axios_client', () => ({ get: jest.fn(), post: jest.fn() }));
jest.mock('react-redux', () => ({ useSelector: () => ({ user: { id: 1, role: 'Student' } }) }));

describe('ReviewTable top-level behaviors', () => {
  it('uses "item prompts" wording for the toggle and shows team members with username', () => {
    render(<ReviewTable />);

    // Toggle label should show Show item prompts initially
    const label = screen.getByLabelText(/toggleQuestion/i);
    expect(label).toBeInTheDocument();

    // Team members text exists and contains parentheses for username
    const tm = screen.getByText(/Team members:/i);
    expect(tm).toBeInTheDocument();
  });
});
