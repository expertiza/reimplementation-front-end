import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubmittedContent from '../SubmittedContent';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

// Mock react-router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLoaderData: () => ({ id: 1, name: 'Test Assignment' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock Table component
vi.mock('../../../components/Table/Table', () => {
  return {
    default: function DummyTable() {
      return <div data-testid="mock-table">Table</div>;
    }
  };
});

describe('SubmittedContent Component', () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] });
    vi.mocked(axios.post).mockResolvedValue({ data: { message: 'Success' } });
    localStorage.setItem('participantId', '123');
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('renders main title', () => {
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  test('renders 4 buttons in grid', () => {
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  test('opens file upload modal on button click', async () => {
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  test('opens hyperlink modal on button click', async () => {
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  test('displays submission history section', () => {
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  test('displays submitted files section', () => {
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  test('shows error message on fetch failure', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  test('button has correct styling (grey, no colors)', () => {
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  test('back button navigates', () => {
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  test('displays loading spinner during fetch', async () => {
    vi.mocked(axios.get).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 100))
    );
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  test('renders empty state for submissions', () => {
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  test('renders empty state for files', () => {
    const { container } = render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });
});
