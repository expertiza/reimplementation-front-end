import axios from 'axios';
import SubmittedContentService from '../SubmittedContentService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SubmittedContentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('submitFile should call correct endpoint', async () => {
    const mockResponse = { data: { message: 'File uploaded' } };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.pdf'));

    const result = await SubmittedContentService.submitFile(formData, '123', '/');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/submitted_content/submit_file',
      formData,
      expect.any(Object)
    );
    expect(result).toEqual(mockResponse.data);
  });

  test('submitFile should handle FormData correctly', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Success' } });

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('id', '123');
    formData.append('uploaded_file', file);

    await SubmittedContentService.submitFile(formData, '123', '/');

    expect(mockedAxios.post).toHaveBeenCalled();
  });

  test('submitHyperlink should call correct endpoint', async () => {
    const mockResponse = { data: { message: 'Hyperlink submitted' } };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await SubmittedContentService.submitHyperlink('https://example.com', '123');

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/submitted_content/submit_hyperlink',
      expect.objectContaining({
        id: '123',
        submission: 'https://example.com',
      })
    );
    expect(result).toEqual(mockResponse.data);
  });

  test('removeHyperlink should call correct endpoint', async () => {
    const mockResponse = { data: { message: 'Hyperlink removed' } };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await SubmittedContentService.removeHyperlink('123', 0);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/submitted_content/remove_hyperlink',
      expect.objectContaining({
        id: '123',
        chk_links: 0,
      })
    );
    expect(result).toEqual(mockResponse.data);
  });

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

  test('downloadFile should set responseType to blob', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/pdf' });
    mockedAxios.get.mockResolvedValueOnce({ data: mockBlob });

    const result = await SubmittedContentService.downloadFile('test.pdf', '123', '/');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/submitted_content/download',
      expect.objectContaining({
        responseType: 'blob',
      })
    );
  });

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
    mockedAxios.post.mockRejectedValueOnce(error);

    await expect(
      SubmittedContentService.submitHyperlink('https://example.com', '123')
    ).rejects.toThrow('Network error');
  });

  test('should handle response with error field', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { error: 'File not found' },
    });

    const result = await SubmittedContentService.listFiles('123', '/');
    expect(result).toEqual({ error: 'File not found' });
  });
});
