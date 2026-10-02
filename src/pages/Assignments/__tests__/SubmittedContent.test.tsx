import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SubmittedContent from '../SubmittedContent';
import * as submittedContentUtil from '../SubmittedContentUtil';

vi.mock('../SubmittedContentUtil', () => ({
  listFiles: vi.fn(),
  submitFile: vi.fn(),
  submitHyperlink: vi.fn(),
  removeHyperlink: vi.fn(),
  saveFileToDisk: vi.fn(),
  deleteFiles: vi.fn(),
  formatFileSize: vi.fn(),
  getFileIcon: vi.fn(),
  validateFile: vi.fn(),
  validateUrl: vi.fn(),
  ALLOWED_EXTENSIONS: ['pdf', 'txt'],
  MAX_FILE_SIZE_MB: 5,
}));

vi.mock('../../../utils/axios_client', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: { assignment: 'OSS project & documentation' } }) },
}));

const mockedService = submittedContentUtil as unknown as Record<string, ReturnType<typeof vi.fn>>;

const store = configureStore({
  reducer: {
    authentication: () => ({
      isAuthenticated: true,
      authToken: 'token',
      user: { id: 7, name: 'student', full_name: 'Student', role: 'Student', institution_id: 1 },
    }),
  },
});

/** Clicks the danger button inside the confirmation modal. */
const confirmInModal = async () => {
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: /^(delete|remove)$/i }));
};

const renderPage = () =>
  render(
    <Provider store={store}>
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/student_tasks/42/submit',
            state: { assignmentName: 'OSS project & documentation' },
          },
        ]}
      >
        <SubmittedContent participantId={42} />
      </MemoryRouter>
    </Provider>
  );

describe('SubmittedContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedService.formatFileSize.mockReturnValue('1 KB');
    mockedService.getFileIcon.mockReturnValue('📄');
    mockedService.validateFile.mockReturnValue({ valid: true });
    mockedService.validateUrl.mockReturnValue({ valid: true });
    mockedService.listFiles.mockResolvedValue({
      current_folder: '/',
      files: [{ name: 'report.pdf', size: 1024, type: 'pdf', modified_at: '2026-01-01T00:00:00Z' }],
      folders: [],
      hyperlinks: ['https://example.com'],
    });
  });

  test('titles the page with the assignment name from router state', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', { name: /submit work for OSS project & documentation/i })
    ).toBeInTheDocument();
  });

  test('does not offer folder or refresh controls', async () => {
    renderPage();
    await waitFor(() => expect(mockedService.listFiles).toHaveBeenCalled());

    expect(screen.queryByRole('button', { name: /new folder/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /refresh/i })).not.toBeInTheDocument();
  });

  test('loads the participant folder on mount and renders its contents', async () => {
    renderPage();

    await waitFor(() => expect(mockedService.listFiles).toHaveBeenCalledWith(42, '/'));
    expect(await screen.findByText(/report\.pdf/)).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  test('submits a hyperlink and reloads the folder', async () => {
    mockedService.submitHyperlink.mockResolvedValue({ message: 'The link has been successfully submitted.' });
    renderPage();
    await waitFor(() => expect(mockedService.listFiles).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /add hyperlink/i }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('URL'), {
      target: { value: 'https://github.com/example' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: /^submit$/i }));

    await waitFor(() =>
      expect(mockedService.submitHyperlink).toHaveBeenCalledWith(42, 'https://github.com/example')
    );
    await waitFor(() => expect(mockedService.listFiles).toHaveBeenCalledTimes(2));
  });

  test('removes a hyperlink by its index once the modal is confirmed', async () => {
    mockedService.removeHyperlink.mockResolvedValue(undefined);
    renderPage();
    await screen.findByText('https://example.com');

    fireEvent.click(screen.getByTitle('Remove https://example.com'));
    await confirmInModal();

    await waitFor(() => expect(mockedService.removeHyperlink).toHaveBeenCalledWith(42, 0));
  });

  test('does not remove a hyperlink when the modal is cancelled', async () => {
    renderPage();
    await screen.findByText('https://example.com');

    fireEvent.click(screen.getByTitle('Remove https://example.com'));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /cancel/i }));

    expect(mockedService.removeHyperlink).not.toHaveBeenCalled();
  });

  test('downloads a file from the folder in view', async () => {
    mockedService.saveFileToDisk.mockResolvedValue(undefined);
    renderPage();
    await screen.findByText(/report\.pdf/);

    fireEvent.click(screen.getByTitle('Download report.pdf'));

    await waitFor(() => expect(mockedService.saveFileToDisk).toHaveBeenCalledWith(42, 'report.pdf', '/'));
  });

  test('deletes a file by name once the modal is confirmed', async () => {
    mockedService.deleteFiles.mockResolvedValue({ message: 'Successfully deleted 1 file(s).' });
    renderPage();
    await screen.findByText(/report\.pdf/);

    fireEvent.click(screen.getByTitle('Delete report.pdf'));
    await confirmInModal();

    await waitFor(() => expect(mockedService.deleteFiles).toHaveBeenCalledWith(42, ['report.pdf'], '/'));
  });

  test('names the file in the confirmation modal', async () => {
    renderPage();
    await screen.findByText(/report\.pdf/);

    fireEvent.click(screen.getByTitle('Delete report.pdf'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Delete File')).toBeInTheDocument();
    expect(within(dialog).getByText(/report\.pdf/)).toBeInTheDocument();
  });

  test('does not delete when the modal is cancelled', async () => {
    renderPage();
    await screen.findByText(/report\.pdf/);

    fireEvent.click(screen.getByTitle('Delete report.pdf'));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /cancel/i }));

    expect(mockedService.deleteFiles).not.toHaveBeenCalled();
  });

  test('shows the error message the server rendered', async () => {
    mockedService.listFiles.mockRejectedValueOnce(
      new Error('Participant is not associated with a team.')
    );
    renderPage();

    expect(
      await screen.findByText('Participant is not associated with a team.')
    ).toBeInTheDocument();
  });
});
