import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SubmittedContent from '../SubmittedContent';

vi.mock('../../../hooks/useAPI', () => ({
  default: () => ({
    data: undefined,
    isLoading: false,
    error: '',
    sendRequest: vi.fn(),
  }),
}));

vi.mock('../../../services/SubmittedContentService', () => ({
  default: {
    validateFile: vi.fn().mockReturnValue({ valid: true }),
    submitFile: vi.fn().mockResolvedValue({
      file: { id: '1', filename: 'test.pdf', size: 1024, uploadedAt: new Date().toISOString() },
    }),
    validateUrl: vi.fn().mockReturnValue({ valid: true }),
    submitHyperlink: vi.fn().mockResolvedValue({
      hyperlink: { url: 'https://example.com', title: 'Example', submittedAt: new Date().toISOString() },
    }),
    listFiles: vi.fn().mockResolvedValue({ files: [], hyperlinks: [] }),
    removeHyperlink: vi.fn().mockResolvedValue({}),
    downloadFile: vi.fn().mockResolvedValue({}),
    deleteFile: vi.fn().mockResolvedValue({}),
    formatFileSize: vi.fn().mockReturnValue('1 KB'),
  },
}));

const testStore = configureStore({
  reducer: {
    authentication: (
      state = {
        isAuthenticated: true,
        authToken: 'test-token',
        user: {
          id: 1,
          name: 'student1',
          full_name: 'Student One',
          role: 'Student',
          institution_id: 1,
        },
      }
    ) => state,
  },
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <Provider store={testStore}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>
  );
}

describe('SubmittedContent Component', () => {
  test('renders title and primary action buttons', () => {
    renderWithProviders(<SubmittedContent />);

    expect(screen.getByRole('heading', { level: 2, name: /assignment submission/i })).toBeInTheDocument();
    expect(screen.getByText(/submit your work/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload file/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add hyperlink/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view history/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  test('opens file upload modal on click', () => {
    renderWithProviders(<SubmittedContent />);

    fireEvent.click(screen.getByRole('button', { name: /upload file/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Upload File')).toBeInTheDocument();
  });

  test('opens hyperlink modal on click', () => {
    renderWithProviders(<SubmittedContent />);

    fireEvent.click(screen.getByRole('button', { name: /add hyperlink/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Add Hyperlink')).toBeInTheDocument();
  });
});
