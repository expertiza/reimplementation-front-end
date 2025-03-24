import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Header from './Header';
import { ROLE } from '../utils/interfaces';

// Create a mock store
const mockStore = configureStore([]);

describe('Header Component', () => {
  // Test for student role
  test('should show "View Bid" link for users with Student role', () => {
    // Create a store with student role
    const studentStore = mockStore({
      authentication: {
        isAuthenticated: true,
        user: {
          id: 1,
          name: 'student_user',
          full_name: 'Student User',
          role: ROLE.STUDENT,
          institution_id: 1
        }
      }
    });

    render(
      <Provider store={studentStore}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // View Bid link should be visible
    expect(screen.getByText('View Bid')).toBeInTheDocument();
  });

  // Test for instructor role
  test('should not show "View Bid" link for users with Instructor role', () => {
    // Create a store with instructor role
    const instructorStore = mockStore({
      authentication: {
        isAuthenticated: true,
        user: {
          id: 2,
          name: 'instructor_user',
          full_name: 'Instructor User',
          role: ROLE.INSTRUCTOR,
          institution_id: 1
        }
      }
    });

    render(
      <Provider store={instructorStore}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // View Bid link should not be visible
    expect(screen.queryByText('View Bid')).not.toBeInTheDocument();
  });

  // Test for admin role
  test('should not show "View Bid" link for users with Admin role', () => {
    // Create a store with admin role
    const adminStore = mockStore({
      authentication: {
        isAuthenticated: true,
        user: {
          id: 3,
          name: 'admin_user',
          full_name: 'Admin User',
          role: ROLE.ADMIN,
          institution_id: 1
        }
      }
    });

    render(
      <Provider store={adminStore}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // View Bid link should not be visible
    expect(screen.queryByText('View Bid')).not.toBeInTheDocument();
  });

  // Test for TA role
  test('should not show "View Bid" link for users with TA role', () => {
    // Create a store with TA role
    const taStore = mockStore({
      authentication: {
        isAuthenticated: true,
        user: {
          id: 4,
          name: 'ta_user',
          full_name: 'TA User',
          role: ROLE.TA,
          institution_id: 1
        }
      }
    });

    render(
      <Provider store={taStore}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // View Bid link should not be visible
    expect(screen.queryByText('View Bid')).not.toBeInTheDocument();
  });

  // Test for unauthenticated user
  test('should not show any navigation links for unauthenticated users', () => {
    // Create a store with unauthenticated state
    const unauthenticatedStore = mockStore({
      authentication: {
        isAuthenticated: false,
        user: {
          id: 0,
          name: '',
          full_name: '',
          role: '',
          institution_id: 0
        }
      }
    });

    render(
      <Provider store={unauthenticatedStore}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // No navigation links should be visible
    expect(screen.queryByText('View Bid')).not.toBeInTheDocument();
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });
}); 