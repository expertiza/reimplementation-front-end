import axiosClient from "../../utils/axios_client";
import {
  IFolderAction,
  IListFilesResponse,
  IMessageResponse,
  ISubmissionRecord,
  IValidationResult,
} from "../../types/SubmittedContent";

/**
 * Helpers for the backend `SubmittedContentController`. Each request function
 * mirrors a route declared in reimplementation-back-end config/routes.rb:
 *
 *   GET    /submitted_content                  index
 *   GET    /submitted_content/list_files       list_files
 *   GET    /submitted_content/download         download
 *   POST   /submitted_content/submit_file      submit_file
 *   POST   /submitted_content/submit_hyperlink submit_hyperlink
 *   POST   /submitted_content/folder_action    folder_action
 *   DELETE /submitted_content/remove_hyperlink remove_hyperlink
 *
 * The `id` these actions take is an AssignmentParticipant id — `set_participant`
 * does `AssignmentParticipant.find(params[:id])` — not an assignment id.
 */

/**
 * Mirrors ALLOWED_EXTENSIONS in submitted_content_helper.rb, which is what
 * `valid_file_extension?` actually enforces. Adding one here alone only moves the rejection
 * from the browser to a 400 from the server.
 */
export const ALLOWED_EXTENSIONS = [
  "pdf",
  "png",
  "jpeg",
  "jpg",
  "zip",
  "tar",
  "gz",
  "7z",
  "odt",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "md",
  "rb",
  "mp4",
  "txt",
];

/** Mirrors MAX_FILE_SIZE_MB in submitted_content_controller.rb. */
export const MAX_FILE_SIZE_MB = 5;

/** Unwraps the `{ error: "..." }` body the controller renders on failure. */
const toError = (error: any): Error => {
  const message =
    error?.response?.data?.error ??
    error?.response?.data?.message ??
    error?.message ??
    "Request failed";
  return new Error(message);
};

/**
 * GET /submitted_content/list_files
 *
 * The folder goes over as a flat `folder[name]` param: axios JSON-stringifies
 * nested objects, which would make the controller's `params.dig(:folder, :name)`
 * fail on a String.
 */
export const listFiles = async (
  participantId: number,
  folder = "/"
): Promise<IListFilesResponse> => {
  try {
    const response = await axiosClient.get<IListFilesResponse>("/submitted_content/list_files", {
      params: { id: participantId, "folder[name]": folder },
    });
    return response.data;
  } catch (error) {
    throw toError(error);
  }
};

/**
 * POST /submitted_content/submit_file
 *
 * `unzip` is only honoured for .zip uploads; the server expands the archive into
 * the current folder and then deletes it.
 */
export const submitFile = async (
  participantId: number,
  file: File,
  folder = "/",
  unzip = false
): Promise<IMessageResponse> => {
  const formData = new FormData();
  formData.append("id", String(participantId));
  formData.append("uploaded_file", file);
  formData.append("current_folder[name]", folder);
  if (unzip) formData.append("unzip", "true");

  try {
    // Let the browser set the multipart boundary; axiosClient defaults to JSON.
    const response = await axiosClient.post<IMessageResponse>(
      "/submitted_content/submit_file",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    throw toError(error);
  }
};

/** POST /submitted_content/submit_hyperlink — the URL param is `submit_link`. */
export const submitHyperlink = async (
  participantId: number,
  url: string
): Promise<IMessageResponse> => {
  try {
    const response = await axiosClient.post<IMessageResponse>(
      "/submitted_content/submit_hyperlink",
      { id: participantId, submit_link: url }
    );
    return response.data;
  } catch (error) {
    throw toError(error);
  }
};

/**
 * DELETE /submitted_content/remove_hyperlink
 *
 * `index` is a position, not an id: the server deletes whichever URL currently
 * sits at that spot in the team's hyperlink list. An index is therefore only
 * valid while that list is unchanged — once a hyperlink has been added or
 * removed, the same index points at a different URL, or at nothing at all, and
 * the server answers 404.
 *
 * On success the server sends 204 (no content), so there is no message to show
 * the user; the caller supplies its own.
 */
export const removeHyperlink = async (participantId: number, index: number): Promise<void> => {
  try {
    await axiosClient.delete("/submitted_content/remove_hyperlink", {
      data: { id: participantId, chk_links: index },
    });
  } catch (error) {
    throw toError(error);
  }
};

/** GET /submitted_content/download — returns the raw bytes as a Blob. */
export const downloadFile = async (
  participantId: number,
  fileName: string,
  folder = "/"
): Promise<Blob> => {
  try {
    const response = await axiosClient.get("/submitted_content/download", {
      params: { id: participantId, "current_folder[name]": folder, download: fileName },
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw toError(error);
  }
};

/** Triggers a browser save of a file fetched through {@link downloadFile}. */
export const saveFileToDisk = async (
  participantId: number,
  fileName: string,
  folder = "/"
): Promise<void> => {
  const blob = await downloadFile(participantId, fileName, folder);
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
};

/**
 * POST /submitted_content/folder_action
 *
 * `faction` selects the operation. `delete` resolves paths server-side; the
 * rename/copy/move branches still expect `directories[i]` to hold the file's
 * absolute path on the server, which `list_files` never returns, so they stay
 * out of the UI.
 */
export const folderAction = async (
  participantId: number,
  faction: IFolderAction,
  extraParams: Record<string, unknown> = {}
): Promise<IMessageResponse> => {
  try {
    const response = await axiosClient.post<IMessageResponse>(
      "/submitted_content/folder_action",
      { id: participantId, faction, ...extraParams }
    );
    return response.data;
  } catch (error) {
    throw toError(error);
  }
};

/** Creates a folder, resolved relative to the team's submission directory. */
export const createFolder = (participantId: number, folderName: string): Promise<IMessageResponse> =>
  folderAction(participantId, { create: folderName });

/**
 * Deletes files from the team's submission directory.
 *
 * Only bare filenames are sent: the server resolves them against `team.path`
 * itself, so the client never has to know — or be trusted with — a path on the
 * server's disk.
 */
export const deleteFiles = (
  participantId: number,
  filenames: string[],
  folder = "/"
): Promise<IMessageResponse> =>
  folderAction(
    participantId,
    { delete: "true" },
    { current_folder: { name: folder }, filenames }
  );

/** GET /submitted_content — every submission record in the system. */
export const listSubmissionRecords = async (): Promise<ISubmissionRecord[]> => {
  try {
    const response = await axiosClient.get<ISubmissionRecord[]>("/submitted_content");
    return response.data;
  } catch (error) {
    throw toError(error);
  }
};

/** Mirrors the server's size and extension checks so we can fail fast. */
export const validateFile = (file: File): IValidationResult => {
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return {
      valid: false,
      error: `File size must be smaller than ${MAX_FILE_SIZE_MB}MB (this file is ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB)`,
    };
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File extension not allowed. Supported extensions: ${ALLOWED_EXTENSIONS.join(", ")}.`,
    };
  }

  return { valid: true };
};

/** The server accepts any URI its Ruby parser likes; this catches typos early. */
export const validateUrl = (url: string): IValidationResult => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Hyperlinks must start with http:// or https://" };
    }
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: "Invalid URL format. Please enter a valid URL (e.g. https://example.com).",
    };
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

export const getFileIcon = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf", "odt", "docx", "md", "txt"].includes(extension)) return "📄";
  if (["png", "jpeg", "jpg", "mp4"].includes(extension)) return "🎬";
  if (["zip", "tar", "gz", "7z"].includes(extension)) return "📦";
  return "📎";
};
