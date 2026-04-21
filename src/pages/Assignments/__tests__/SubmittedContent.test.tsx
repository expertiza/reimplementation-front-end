import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubmittedContent from '../SubmittedContent';

vi.mock('../../../services/SubmittedContentService', () => ({
  default: {
    validateFile: vi.fn().mockResolvedValue({ isValid: true }),
    submitFile: vi.fn().mockResolvedValue({
      file: { id: '1', filename: 'test.pdf', size: 1024, uploadedAt: new Date().toISOString() },
    }),
    validateUrl: vi.fn().mockResolvedValue({ isValid: true }),
    submitHyperlink: vi.fn().mockResolvedValue({
      hyperlink: { url: 'https://example.com', title: 'Example', submittedAt: new Date().toISOString() },
    }),
    removeHyperlink: vi.fn().mockResolvedValue({}),
    downloadFile: vi.fn().mockResolvedValue({}),
    deleteFile: vi.fn().mockResolvedValue({}),
    formatFileSize: vi.fn().mockReturnValue('1 KB'),
  },
}));

describe('SubmittedContent Component', () => {
  test('renders title and primary action buttons', () => {
    render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /submitted content/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload file/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add hyperlink/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view history/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  test('opens file upload modal on click', () => {
    render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /upload file/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Upload File')).toBeInTheDocument();
  });

  test('opens hyperlink modal on click', () => {
    render(
      <BrowserRouter>
        <SubmittedContent />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /add hyperlink/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Add Hyperlink')).toBeInTheDocument();
  });
});
