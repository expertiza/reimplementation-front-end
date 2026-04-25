import SubmittedContentService from '../SubmittedContentService';
import axiosClient from '../../utils/axios_client';
import type { Mocked } from 'vitest';

// Mock the axiosClient instance used by the service (not raw axios,
// which is never called directly – the service always goes through axiosClient).
vi.mock('../../utils/axios_client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedAxios = axiosClient as Mocked<typeof axiosClient>;

describe('SubmittedContentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // submitFile
  // ---------------------------------------------------------------------------

  test('submitFile should call correct endpoint with participantId and file', async () => {
    const mockResponse = { data: { message: 'File uploaded' } };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const participantId = '123';
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

    const result = await SubmittedContentService.submitFile(participantId, file);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    const [url, formData] = (mockedAxios.post as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('/submitted_content/submit_file');
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('id')).toBe(participantId);
    expect(formData.get('uploaded_file')).toBe(file);
    // default currentFolder normalises to "/"
    expect(formData.get('current_folder[name]')).toBe('/');
    expect(result).toEqual(mockResponse.data);
  });

  test('submitFile should forward an explicit subfolder via normalizeFolder', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Success' } });

    const participantId = '123';
    const file = new File(['test content'], 'notes.txt', { type: 'text/plain' });

    await SubmittedContentService.submitFile(participantId, file, '/week1/');

    const [, formData] = (mockedAxios.post as ReturnType<typeof vi.fn>).mock.calls[0];
    // normalizeFolder strips trailing slash
    expect(formData.get('current_folder[name]')).toBe('/week1');
  });

  test('submitFile should prepend leading slash when folder lacks one', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    const file = new File(['data'], 'data.zip', { type: 'application/zip' });
    await SubmittedContentService.submitFile('456', file, 'week2/sub');

    const [, formData] = (mockedAxios.post as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(formData.get('current_folder[name]')).toBe('/week2/sub');
  });

  test('submitFile should treat empty string folder the same as "/"', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    const file = new File(['x'], 'readme.md', { type: 'text/markdown' });
    await SubmittedContentService.submitFile('789', file, '');

    const [, formData] = (mockedAxios.post as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(formData.get('current_folder[name]')).toBe('/');
  });

  // ---------------------------------------------------------------------------
  // submitHyperlink
  // ---------------------------------------------------------------------------

  test('submitHyperlink should call correct endpoint', async () => {
    const mockResponse = { data: { message: 'Hyperlink submitted' } };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await SubmittedContentService.submitHyperlink('https://example.com', '123');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/submitted_content/submit_hyperlink',
      expect.objectContaining({
        id: '123',
        submit_link: 'https://example.com',
      })
    );
    expect(result).toEqual(mockResponse.data);
  });

  // ---------------------------------------------------------------------------
  // removeHyperlink
  // ---------------------------------------------------------------------------

  test('removeHyperlink should call correct endpoint via DELETE', async () => {
    const mockResponse = { data: { message: 'Hyperlink removed' } };
    mockedAxios.delete.mockResolvedValueOnce(mockResponse);

    const result = await SubmittedContentService.removeHyperlink('123', 0);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      '/submitted_content/remove_hyperlink',
      expect.objectContaining({
        data: expect.objectContaining({
          id: '123',
          chk_links: 0,
        }),
      })
    );
    expect(result).toEqual(mockResponse.data);
  });

  // ---------------------------------------------------------------------------
  // listFiles
  // ---------------------------------------------------------------------------

  test('listFiles should call correct endpoint', async () => {
    const mockResponse = { data: { files: [], hyperlinks: [] } };
    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await SubmittedContentService.listFiles('123', '/');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/submitted_content/list_files',
      expect.any(Object)
    );
    expect(result).toEqual(mockResponse.data);
  });

  // ---------------------------------------------------------------------------
  // downloadFile
  // ---------------------------------------------------------------------------

  test('downloadFile should set responseType to blob', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/pdf' });
    mockedAxios.get.mockResolvedValueOnce({ data: mockBlob });

    await SubmittedContentService.downloadFile('test.pdf', '123', '/');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/submitted_content/download',
      expect.objectContaining({
        responseType: 'blob',
      })
    );
  });

  // ---------------------------------------------------------------------------
  // deleteFile
  // ---------------------------------------------------------------------------

  test('deleteFile should call correct endpoint', async () => {
    const mockResponse = { data: { message: 'File deleted' } };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await SubmittedContentService.deleteFile('test.pdf', '123', '/');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/submitted_content/folder_action',
      expect.objectContaining({
        id: '123',
        faction: { delete: 'test.pdf' },
      })
    );
    expect(result).toEqual(mockResponse.data);
  });

  // ---------------------------------------------------------------------------
  // validateFile
  // ---------------------------------------------------------------------------

  test('validateFile should reject files over 5 MB', () => {
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.pdf');
    const result = SubmittedContentService.validateFile(largeFile);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/5MB/i);
  });

  test('validateFile should reject disallowed extensions', () => {
    const invalidFile = new File(['test'], 'test.exe');
    const result = SubmittedContentService.validateFile(invalidFile);
    expect(result.valid).toBe(false);
  });

  test('validateFile should accept a valid PDF under 5 MB', () => {
    const validFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const result = SubmittedContentService.validateFile(validFile);
    expect(result.valid).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // validateUrl
  // ---------------------------------------------------------------------------

  test('validateUrl should accept a valid URL', () => {
    expect(SubmittedContentService.validateUrl('https://example.com').valid).toBe(true);
  });

  test('validateUrl should reject an invalid URL', () => {
    const result = SubmittedContentService.validateUrl('not a url');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Error handling
  // ---------------------------------------------------------------------------

  test('should propagate API errors', async () => {
    const error = new Error('Network error');
    mockedAxios.post.mockRejectedValueOnce(error);

    await expect(
      SubmittedContentService.submitHyperlink('https://example.com', '123')
    ).rejects.toThrow('Network error');
  });

  test('should return response with error field from listFiles', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { error: 'File not found' },
    });

    const result = await SubmittedContentService.listFiles('123', '/');
    expect(result).toEqual({ error: 'File not found' });
  });
});