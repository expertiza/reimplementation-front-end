/**
 * SubmittedContent Type Definitions
 *
 * These mirror the JSON contract of the backend `SubmittedContentController`
 * (reimplementation-back-end: app/controllers/submitted_content_controller.rb).
 */

/** A submission record row, as returned by GET /submitted_content[/:id]. */
export interface ISubmissionRecord {
  id: number;
  record_type: 'file' | 'hyperlink';
  content: string;
  operation: string;
  user: string;
  team_id: number;
  assignment_id: number;
  created_at?: string;
  updated_at?: string;
}

/** A file entry inside `files` of the list_files response. */
export interface ISubmittedFile {
  name: string;
  size: number;
  /** Extension without the dot, e.g. "pdf". Empty string when the file has none. */
  type: string;
  modified_at: string;
}

/** A directory entry inside `folders` of the list_files response. */
export interface ISubmittedFolder {
  name: string;
  modified_at: string;
}

/** GET /submitted_content/list_files */
export interface IListFilesResponse {
  /** Echoed back by the server; absent when the folder had to be created. */
  current_folder?: string;
  files: ISubmittedFile[];
  folders: ISubmittedFolder[];
  /** Team hyperlinks are a plain array of URL strings. */
  hyperlinks: string[];
}

/** Shape of every success payload from the controller's `render_success`. */
export interface IMessageResponse {
  message: string;
}

/** Shape of every failure payload from the controller's `render_error`. */
export interface IErrorResponse {
  error: string;
}

/** The `faction` parameter accepted by POST /submitted_content/folder_action. */
export interface IFolderAction {
  create?: string;
  delete?: string;
  rename?: string;
  copy?: string;
  move?: string;
}

/** Result of the client-side guards that mirror the server's own validation. */
export interface IValidationResult {
  valid: boolean;
  error?: string;
}

/** Local UI state for the upload / hyperlink modals. */
export interface IModalState {
  show: boolean;
  isSubmitting: boolean;
}

export interface ISubmittedContentProps {
  /** Overrides the participant id resolved from the route, mainly for tests. */
  participantId?: number;
}
