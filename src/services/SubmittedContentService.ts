import { AxiosResponse } from "axios";
import axiosClient from "../utils/axios_client";

interface IParticipantResponse {
  id?: number;
  user_id?: number;
  user?: {
    id?: number;
  };
  team_id?: number;
  team?: {
    id?: number;
  };
}

export interface IListedFile {
  name: string;
  size?: number;
  type?: string;
  modified_at?: string;
}

export interface IListedFolder {
  name: string;
  modified_at?: string;
}

export interface IListFilesResponse {
  current_folder?: string;
  files?: IListedFile[];
  folders?: IListedFolder[];
  hyperlinks?: string[];
  error?: string;
}

interface ISubmissionAssetResponse {
  display_name?: string;
  name?: string;
  size?: number | string;
  type?: string;
  modified?: string;
  url?: string;
}

interface ITeamSubmissionResponse {
  team_id?: number;
  links?: ISubmissionAssetResponse[];
  files?: ISubmissionAssetResponse[];
}

interface IViewSubmissionsResponse {
  submissions?: ITeamSubmissionResponse[];
}

export interface IParticipantContext {
  participantId: string;
  teamId: number | null;
}

interface IValidationResult {
  valid: boolean;
  error?: string;
}

class SubmittedContentService {
  private static normalizeFolder(currentFolder = "/") {
    const trimmedFolder = currentFolder.trim();

    if (!trimmedFolder || trimmedFolder === "/") {
      return "/";
    }

    const cleanedFolder = trimmedFolder.replace(/\/{2,}/g, "/").replace(/\/$/, "");
    return cleanedFolder.startsWith("/") ? cleanedFolder : `/${cleanedFolder}`;
  }

  static async findParticipantContext(
    assignmentId: number,
    userId: number
  ): Promise<IParticipantContext> {
    const response = await axiosClient.get(`/participants/assignment/${assignmentId}`);
    const participants = Array.isArray(response.data) ? response.data : [];
    const matchingParticipant = participants.find((participant: IParticipantResponse) => {
      const participantUserId = participant.user_id ?? participant.user?.id;
      return Number(participantUserId) === Number(userId);
    });

    if (!matchingParticipant?.id) {
      throw new Error("No participant record was found for the current user on this assignment.");
    }

    return {
      participantId: String(matchingParticipant.id),
      teamId: matchingParticipant.team_id ?? matchingParticipant.team?.id ?? null,
    };
  }

  static async findParticipantId(assignmentId: number, userId: number): Promise<string> {
    const participantContext = await this.findParticipantContext(assignmentId, userId);
    return participantContext.participantId;
  }

  static async submitFile(
    participantId: string,
    file: File,
    currentFolder = "/"
  ): Promise<any> {
    const formData = new FormData();
    formData.append("id", participantId);
    formData.append("uploaded_file", file);
    formData.append("current_folder[name]", this.normalizeFolder(currentFolder));

    const response = await axiosClient.post("/submitted_content/submit_file", formData);

    return response.data;
  }

  static async submitHyperlink(url: string, participantId: string): Promise<any> {
    const response = await axiosClient.post("/submitted_content/submit_hyperlink", {
      id: participantId,
      submit_link: url,
    });

    return response.data;
  }

  static async removeHyperlink(participantId: string, index: number): Promise<any> {
    const response = await axiosClient.delete("/submitted_content/remove_hyperlink", {
      data: {
        id: participantId,
        chk_links: index,
      },
    });

    return response.data;
  }

  static async listFiles(
    participantId: string,
    currentFolder = "/"
  ): Promise<IListFilesResponse> {
    const response = await axiosClient.get("/submitted_content/list_files", {
      params: {
        id: participantId,
        folder: { name: this.normalizeFolder(currentFolder) },
      },
    });

    return response.data;
  }

  static async getTeamSubmissionSummary(
    assignmentId: number,
    teamId: number
  ): Promise<IListFilesResponse> {
    const response = await axiosClient.get(`/submitted_content/${assignmentId}/view_submissions`);
    const submissions = (response.data as IViewSubmissionsResponse)?.submissions ?? [];
    const matchingTeam = submissions.find(
      (submission) => Number(submission.team_id) === Number(teamId)
    );

    if (!matchingTeam) {
      return {
        current_folder: "/",
        files: [],
        folders: [],
        hyperlinks: [],
      };
    }

    const files = (matchingTeam.files ?? []).map((file) => ({
      name: file.display_name ?? file.name ?? "Unnamed file",
      size: typeof file.size === "number" ? file.size : undefined,
      type: file.type ?? "File",
      modified_at: file.modified,
    }));

    const hyperlinks = (matchingTeam.links ?? [])
      .map((link) => link.url ?? link.name ?? link.display_name)
      .filter((link): link is string => Boolean(link));

    return {
      current_folder: "/",
      files,
      folders: [],
      hyperlinks,
    };
  }

  static async deleteFile(
    fileName: string,
    participantId: string,
    currentFolder = "/"
  ): Promise<any> {
    const response = await axiosClient.post("/submitted_content/folder_action", {
      id: participantId,
      current_folder: { name: this.normalizeFolder(currentFolder) },
      faction: { delete: fileName },
    });

    return response.data;
  }

  static async downloadFile(
    fileName: string,
    participantId: string,
    currentFolder = "/"
  ): Promise<AxiosResponse<Blob>> {
    return axiosClient.get("/submitted_content/download", {
      params: {
        id: participantId,
        current_folder: { name: this.normalizeFolder(currentFolder) },
        download: fileName,
      },
      responseType: "blob",
    });
  }

  static validateFile(file: File): IValidationResult {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB).`,
      };
    }

    const allowedExtensions = [
      "pdf",
      "png",
      "jpeg",
      "jpg",
      "zip",
      "tar",
      "gz",
      "7z",
      "odt",
      "docx",
      "md",
      "rb",
      "mp4",
      "txt",
    ];

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedExtensions.join(", ")}.`,
      };
    }

    return { valid: true };
  }

  static validateUrl(url: string): IValidationResult {
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return {
        valid: false,
        error: "Invalid URL format. Please enter a valid URL such as https://example.com.",
      };
    }
  }

  static formatFileSize(bytes: number): string {
    if (!bytes) return "-";

    const unit = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const sizeIndex = Math.floor(Math.log(bytes) / Math.log(unit));

    return `${Math.round((bytes / unit ** sizeIndex) * 100) / 100} ${sizes[sizeIndex]}`;
  }
}

export default SubmittedContentService;
