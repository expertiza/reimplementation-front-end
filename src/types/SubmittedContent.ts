/**
 * SubmittedContent Type Definitions
 * Defines all TypeScript interfaces for the Submitted Content feature
 * @author Team CSC517
 */

/**
 * Represents a single submission record
 */
export interface ISubmission {
  id: number;
  record_type: 'file' | 'hyperlink';
  content: string;
  operation: string;
  user: string;
  team_id: number;
  assignment_id: number;
}

/**
 * Represents a file or directory in the submissions folder
 */
export interface IFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
}

/**
 * Represents an error state
 */
export interface IError {
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
}

/**
 * Payload for file upload
 */
export interface IFileUploadPayload {
  file: File;
  unzip?: boolean;
}

/**
 * Payload for hyperlink submission
 */
export interface IHyperlinkPayload {
  hyperlink: string;
}

/**
 * Payload for folder action
 */
export interface IFolderActionPayload {
  delete?: string;
  create?: string;
  rename?: {
    old_name: string;
    new_name: string;
  };
}

/**
 * Response from list files endpoint
 */
export interface IListFilesResponse {
  files?: IFile[];
  hyperlinks?: string[];
  error?: string;
  message?: string;
}

/**
 * Response from submission endpoint
 */
export interface ISubmissionResponse {
  message: string;
  error?: string;
  success: boolean;
}

/**
 * Props for SubmittedContent component
 */
export interface ISubmittedContentProps {
  assignmentId?: number;
}

/**
 * State for submitted content modal
 */
export interface IModalState {
  show: boolean;
  loading: boolean;
  error?: IError;
}

/**
 * Validation result
 */
export interface IValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * File metadata
 */
export interface IFileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

/**
 * Submission statistics
 */
export interface ISubmissionStats {
  totalSubmissions: number;
  filesCount: number;
  hyperlinksCount: number;
  lastSubmissionDate?: string;
}

/**
 * Column definition for submission history table
 */
export interface ITableColumn {
  id: string;
  header: string;
  accessor: string;
  cell?: (value: any) => React.ReactNode;
}
