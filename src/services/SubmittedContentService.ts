import axios from 'axios';

/**
 * SubmittedContentService
 * Handles all API calls related to submitted content (files and hyperlinks)
 * @author Team CSC517
 */

interface IListFilesResponse {
  files?: Array<{
    name: string;
    path: string;
    type: 'file' | 'directory';
  }>;
  hyperlinks?: string[];
  error?: string;
}

interface IValidationResult {
  valid: boolean;
  error?: string;
}

class SubmittedContentService {
  /**
   * Submit a file for an assignment
   * @param formData FormData containing file and metadata
   * @param participantId The participant ID
   * @param currentFolder Current folder path
   * @returns Response data
   */
  static async submitFile(
    formData: FormData,
    participantId: string,
    currentFolder: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        '/submitted_content/submit_file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Submit a hyperlink for an assignment
   * @param url The hyperlink URL
   * @param participantId The participant ID
   * @returns Response data
   */
  static async submitHyperlink(url: string, participantId: string): Promise<any> {
    try {
      const response = await axios.post('/submitted_content/submit_hyperlink', {
        id: participantId,
        submission: url,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Remove a submitted hyperlink
   * @param participantId The participant ID
   * @param index Index of hyperlink to remove
   * @returns Response data
   */
  static async removeHyperlink(participantId: string, index: number): Promise<any> {
    try {
      const response = await axios.post('/submitted_content/remove_hyperlink', {
        id: participantId,
        chk_links: index,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * List all submitted files and hyperlinks
   * @param participantId The participant ID
   * @param currentFolder Current folder path
   * @returns Files and hyperlinks list
   */
  static async listFiles(
    participantId: string,
    currentFolder: string
  ): Promise<IListFilesResponse> {
    try {
      const response = await axios.get('/submitted_content/list_files', {
        params: {
          id: participantId,
          folder: { name: currentFolder },
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Perform folder action (create, delete, etc.)
   * @param action The action to perform
   * @param participantId The participant ID
   * @param currentFolder Current folder path
   * @returns Response data
   */
  static async folderAction(
    action: any,
    participantId: string,
    currentFolder: string
  ): Promise<any> {
    try {
      const response = await axios.post('/submitted_content/folder_action', {
        id: participantId,
        current_folder: { name: currentFolder },
        faction: action,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Delete a submitted file
   * @param fileName Name of file to delete
   * @param participantId The participant ID
   * @param currentFolder Current folder path
   * @returns Response data
   */
  static async deleteFile(
    fileName: string,
    participantId: string,
    currentFolder: string
  ): Promise<any> {
    return this.folderAction({ delete: fileName }, participantId, currentFolder);
  }

  /**
   * Download a submitted file
   * @param fileName Name of file to download
   * @param participantId The participant ID
   * @param currentFolder Current folder path
   * @returns Blob data
   */
  static async downloadFile(
    fileName: string,
    participantId: string,
    currentFolder: string
  ): Promise<Blob> {
    try {
      const response = await axios.get('/submitted_content/download', {
        params: {
          id: participantId,
          current_folder: { name: currentFolder },
          download: fileName,
        },
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Validate a file for upload
   * @param file The file to validate
   * @returns Validation result
   */
  static validateFile(file: File): IValidationResult {
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      };
    }

    // Check file extension
    const allowedExtensions = [
      'pdf',
      'png',
      'jpeg',
      'jpg',
      'zip',
      'tar',
      'gz',
      '7z',
      'odt',
      'docx',
      'md',
      'rb',
      'mp4',
      'txt',
    ];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate a URL for hyperlink submission
   * @param url The URL to validate
   * @returns Validation result
   */
  static validateUrl(url: string): IValidationResult {
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return {
        valid: false,
        error: 'Invalid URL format. Please enter a valid URL (e.g., https://example.com)',
      };
    }
  }

  /**
   * Get file size in human readable format
   * @param bytes File size in bytes
   * @returns Formatted file size string
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Check if file type is document
   * @param fileName The file name
   * @returns True if file is a document
   */
  static isDocument(fileName: string): boolean {
    const documentExtensions = ['pdf', 'odt', 'docx', 'md', 'txt'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? documentExtensions.includes(extension) : false;
  }

  /**
   * Check if file type is media
   * @param fileName The file name
   * @returns True if file is media
   */
  static isMedia(fileName: string): boolean {
    const mediaExtensions = ['png', 'jpeg', 'jpg', 'mp4'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? mediaExtensions.includes(extension) : false;
  }

  /**
   * Check if file type is archive
   * @param fileName The file name
   * @returns True if file is an archive
   */
  static isArchive(fileName: string): boolean {
    const archiveExtensions = ['zip', 'tar', 'gz', '7z'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? archiveExtensions.includes(extension) : false;
  }

  /**
   * Get icon for file type
   * @param fileName The file name
   * @returns Icon emoji string
   */
  static getFileIcon(fileName: string): string {
    if (this.isDocument(fileName)) return '📄';
    if (this.isMedia(fileName)) return '🎬';
    if (this.isArchive(fileName)) return '📦';
    return '📁';
  }
}

export default SubmittedContentService;
