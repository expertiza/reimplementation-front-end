import axiosClient from '../../utils/axios_client';
import SubmittedContentService from '../SubmittedContentService';

vi.mock('../../utils/axios_client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedClient = vi.mocked(axiosClient, true);

describe('SubmittedContentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('submitFile posts multipart with participant id and uploaded_file', async () => {
    const mockResponse = { data: { message: 'File uploaded' } };
    mockedClient.post.mockResolvedValueOnce(mockResponse);

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const result = await SubmittedContentService.submitFile('123', file, '/');

    expect(mockedClient.post).toHaveBeenCalledWith(
      '/submitted_content/submit_file',
      expect.any(FormData)
    );
    expect(result).toEqual(mockResponse.data);
  });

  test('submitHyperlink should call correct endpoint', async () => {
    const mockResponse = { data: { message: 'Hyperlink submitted' } };
    mockedClient.post.mockResolvedValueOnce(mockResponse);

    const result = await SubmittedContentService.submitHyperlink('https://example.com', '123');

    expect(mockedClient.post).toHaveBeenCalledWith(
      '/submitted_content/submit_hyperlink',
      expect.objectContaining({
        id: '123',
        submit_link: 'https://example.com',
      })
    );
    expect(result).toEqual(mockResponse.data);
  });

  test('removeHyperlink should DELETE with query params', async () => {
    const mockResponse = { data: {} };
    mockedClient.delete.mockResolvedValueOnce(mockResponse);

    const result = await SubmittedContentService.removeHyperlink('123', 0);

    expect(mockedClient.delete).toHaveBeenCalledWith('/submitted_content/remove_hyperlink', {
      params: { id: '123', chk_links: 0 },
    });
    expect(result).toEqual(mockResponse.data);
  });

  test('listFiles should call correct endpoint', async () => {
    const mockResponse = { data: { files: [], hyperlinks: [] } };
    mockedClient.get.mockResolvedValueOnce(mockResponse);

    const result = await SubmittedContentService.listFiles('123', '/');

    expect(mockedClient.get).toHaveBeenCalledWith(
      '/submitted_content/list_files',
      expect.any(Object)
    );
    expect(result).toEqual(mockResponse.data);
  });

  test('downloadFile should set responseType to blob', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/pdf' });
    mockedClient.get.mockResolvedValueOnce({ data: mockBlob });

    const result = await SubmittedContentService.downloadFile('test.pdf', '123', '/');

    expect(mockedClient.get).toHaveBeenCalledWith(
      '/submitted_content/download',
      expect.objectContaining({
        responseType: 'blob',
      })
    );
    expect(result).toEqual(mockBlob);
  });

  test('deleteFile should call correct endpoint', async () => {
    const mockResponse = { data: { message: 'File deleted' } };
    mockedClient.post.mockResolvedValueOnce(mockResponse);

    const result = await SubmittedContentService.deleteFile('test.pdf', '123', '/');

    expect(mockedClient.post).toHaveBeenCalledWith(
      '/submitted_content/folder_action',
      expect.objectContaining({
        id: '123',
        faction: { delete: 'test.pdf' },
      })
    );
    expect(result).toEqual(mockResponse.data);
  });

  test('validateFile should check size', () => {
    const largeFile = new File(
      [new ArrayBuffer(6 * 1024 * 1024)],
      'large.pdf'
    );
    const result = SubmittedContentService.validateFile(largeFile);
    expect(result.valid).toBe(false);
  });

  test('validateFile should check extension', () => {
    const invalidFile = new File(['test'], 'test.exe');
    const result = SubmittedContentService.validateFile(invalidFile);
    expect(result.valid).toBe(false);
  });

  test('validateFile should accept valid file', () => {
    const validFile = new File(['test'], 'test.pdf');
    const result = SubmittedContentService.validateFile(validFile);
    expect(result.valid).toBe(true);
  });

  test('validateUrl should accept valid URL', () => {
    const result = SubmittedContentService.validateUrl('https://example.com');
    expect(result.valid).toBe(true);
  });

  test('validateUrl should reject invalid URL', () => {
    const result = SubmittedContentService.validateUrl('not a url');
    expect(result.valid).toBe(false);
  });

  test('should handle API errors gracefully', async () => {
    const error = new Error('Network error');
    mockedClient.post.mockRejectedValueOnce(error);

    await expect(
      SubmittedContentService.submitHyperlink('https://example.com', '123')
    ).rejects.toThrow('Network error');
  });

  test('should handle response with error field', async () => {
    mockedClient.get.mockResolvedValueOnce({
      data: { error: 'File not found' },
    });

    const result = await SubmittedContentService.listFiles('123', '/');
    expect(result).toEqual({ error: 'File not found' });
  });
});
