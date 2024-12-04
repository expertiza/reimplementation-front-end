import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import axios from 'axios';
import Login from './Login';
import { store } from '../../store/store'; // Adjust path as needed

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component Edge Cases', () => {
  const renderLogin = () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle network timeout error', async () => {
    renderLogin();
    
    // Mock a network timeout
    mockedAxios.post.mockRejectedValue({
      message: 'Network Error: Request timeout',
      code: 'ECONNABORTED'
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/User Name/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Verify error alert is shown with timeout message
    await waitFor(() => {
      expect(screen.getByText(/Unable to authenticate user!/i)).toBeInTheDocument();
      expect(screen.getByText(/Network Error: Request timeout/i)).toBeInTheDocument();
    });
  });

  it('should handle multiple rapid form submissions', async () => {
    renderLogin();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/User Name/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' }
    });

    // Simulate multiple rapid clicks
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Verify button is disabled after first click
    expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
    
    // Verify only one API call was made
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle special characters in username', async () => {
    renderLogin();
    
    // Mock successful login
    mockedAxios.post.mockResolvedValue({
      data: { token: 'fake-token' }
    });

    // Fill in form with special characters
    fireEvent.change(screen.getByLabelText(/User Name/i), {
      target: { value: 'test@user#$%' }
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Verify API call includes special characters
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          user_name: 'test@user#$%'
        })
      );
    });
  });
}); 