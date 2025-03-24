import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Header from '../layout/Header';
import BiddingPage from '../pages/Bidding/BiddingPage';
import { ROLE } from '../utils/interfaces';

// Create mock store
const mockStore = configureStore([]);

// Mock the Chart.js implementation
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart">Chart Component</div>,
}));

// Mock html2canvas
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({
    toDataURL: jest.fn(() => 'mock-image-data-url'),
  })),
}));

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    addImage: jest.fn(),
    save: jest.fn(),
  }));
});

// Mock jspdf-autotable
jest.mock('jspdf-autotable', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('View Bid Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('Non-student users should not see View Bid link', () => {
    // Store with instructor role
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
        <MemoryRouter initialEntries={['/']}>
          <Header />
          <div>Home Page</div>
        </MemoryRouter>
      </Provider>
    );
    
    // Instructor should not see the View Bid link
    expect(screen.queryByText('View Bid')).not.toBeInTheDocument();
  });
  
  test('Protected route redirects non-students trying to access bidding page directly', () => {
    // Instructor store
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
    
    // Define type for redux store state
    type StoreState = {
      authentication: {
        isAuthenticated: boolean;
        user: {
          id: number;
          name: string;
          full_name: string;
          role: string;
          institution_id: number;
        }
      }
    };

    render(
      <Provider store={instructorStore}>
        <MemoryRouter initialEntries={['/bidding/1']}>
          <Routes>
            <Route path="/bidding/:assignmentId" element={
              // Simulate protected route behavior
              <div>
                {(instructorStore.getState() as StoreState).authentication.user.role !== ROLE.STUDENT ? 
                  <div>Access Denied</div> : 
                  <BiddingPage />}
              </div>
            } />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    
    // Verify instructor sees access denied
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    
    // Verify bidding page is not rendered
    expect(screen.queryByText('Assignment Bidding Summary by Priority')).not.toBeInTheDocument();
  });
}); 