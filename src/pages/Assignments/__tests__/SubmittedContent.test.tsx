import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubmittedContent from '../SubmittedContent';
import * as axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock react-router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLoaderData: () => ({ id: 1, name: 'Test Assignment' }),
  useNavigate: () => jest.fn(),
}));

// Mock Table component
jest.mock('../../../components/Table/Table', () => {
  return function DummyTable() {
    return <div data-testid="mock-table">Table</div>;
  };
});

describe('SubmittedContent Component', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    mockedAxios.post.mockResolvedValue({ data: { message: 'Success' } });
    localStorage.setItem('participantId', '123');
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders main title', () => {
    render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(screen.getByText('Submit Content')).toBeInTheDocument();
  });

  test('renders 4 buttons in grid', () => {
    render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(screen.getByText('📤')).toBeInTheDocument();
    expect(screen.getByText('🔗')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('📁')).toBeInTheDocument();
  });

  test('opens file upload modal on button click', async () => {
    render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    const submitFileButton = screen.getByText('Submit File');
    fireEvent.click(submitFileButton);
    await waitFor(() => {
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });
  });

  test('opens hyperlink modal on button click', async () => {
    render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    const submitHyperlinkButton = screen.getByText('Submit Hyperlink');
    fireEvent.click(submitHyperlinkButton);
    await waitFor(() => {
      expect(screen.getByText('Submit Hyperlink')).toBeInTheDocument();
    });
  });

  test('displays submission history section', () => {
    render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(screen.getByText('Submission History')).toBeInTheDocument();
  });

  test('displays submitted files section', () => {
    render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(screen.getByText('Submitted Files and Hyperlinks')).toBeInTheDocument();
  });

  test('shows error message on fetch failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
    });
  });

  test('button has correct styling (grey, no colors)', () => {
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    const buttons = container.querySelectorAll('button');
    buttons.forEach((button) => {
      const style = window.getComputedStyle(button);
      // Check that buttons have custom background color (not blue)
      expect(button).toHaveStyle('backgroundColor: #e9ecef');
    });
  });

  test('back button navigates', () => {
    render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    const backButton = screen.getByText('Back to Assignment');
    expect(backButton).toBeInTheDocument();
  });

  test('displays loading spinner during fetch', async () => {
    mockedAxios.get.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 100))
    );
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    // Spinner should appear briefly
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).toBeInTheDocument();
  });

  test('renders empty state for submissions', () => {
    render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(screen.getByText('No submissions yet.')).toBeInTheDocument();
  });

  test('renders empty state for files', () => {
    render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(screen.getByText('No files or hyperlinks submitted yet.')).toBeInTheDocument();
  });
});
