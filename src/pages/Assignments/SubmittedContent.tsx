import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  Alert,
  Breadcrumb,
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  FaDownload,
  FaExternalLinkAlt,
  FaFolderOpen,
  FaLink,
  FaSyncAlt,
  FaTrash,
  FaUpload,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useLoaderData, useParams } from "react-router-dom";
import SubmittedContentService, {
  IListFilesResponse,
  IListedFile,
  IListedFolder,
} from "../../services/SubmittedContentService";
import { RootState } from "../../store/store";
import { IAssignmentResponse } from "../../utils/interfaces";
import "./SubmittedContent.css";

type SubmittedContentLoaderData = Partial<IAssignmentResponse>;

const EMPTY_MESSAGE = "No submission artifacts are available in this folder yet.";

const buildErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object") {
    const apiError = (error as { error?: string }).error;
    if (apiError) {
      return apiError;
    }

    const message = (error as { message?: string }).message;
    if (message) {
      return message;
    }
  }

  return fallbackMessage;
};

const formatTimestamp = (value?: string) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
};

const getPathSegments = (currentFolder: string) => {
  const segments = currentFolder.split("/").filter(Boolean);

  return segments.map((segment, index) => ({
    label: segment,
    path: `/${segments.slice(0, index + 1).join("/")}`,
  }));
};

const SubmittedContent = () => {
  const assignment = (useLoaderData?.() as SubmittedContentLoaderData) || {};
  const { id: routeAssignmentId } = useParams<{ id: string }>();
  const assignmentId = Number(assignment?.id ?? routeAssignmentId ?? 0);
  const currentUserId = useSelector((state: RootState) => state.authentication.user.id);

  const [participantId, setParticipantId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [currentFolder, setCurrentFolder] = useState("/");
  const [folderContents, setFolderContents] = useState<IListFilesResponse>({
    current_folder: "/",
    files: [],
    folders: [],
    hyperlinks: [],
  });
  const [liveFolderContents, setLiveFolderContents] = useState<IListFilesResponse>({
    current_folder: "/",
    files: [],
    folders: [],
    hyperlinks: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isResolvingParticipant, setIsResolvingParticipant] = useState(true);
  const [isLoadingArtifacts, setIsLoadingArtifacts] = useState(false);
  const [isSubmittingFile, setIsSubmittingFile] = useState(false);
  const [isSubmittingHyperlink, setIsSubmittingHyperlink] = useState(false);
  const [isUsingSubmissionSummary, setIsUsingSubmissionSummary] = useState(false);
  const [preferLiveContents, setPreferLiveContents] = useState(false);
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null);
  const [showHyperlinkModal, setShowHyperlinkModal] = useState(false);
  const [hyperlinkUrl, setHyperlinkUrl] = useState("");
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const files = folderContents.files ?? [];
  const folders = folderContents.folders ?? [];
  const hyperlinks = folderContents.hyperlinks ?? [];
  const hasArtifacts = files.length > 0 || folders.length > 0 || hyperlinks.length > 0;
  const showLoadingState =
    isResolvingParticipant || (isLoadingArtifacts && !hasArtifacts && !error);
  const pathSegments = getPathSegments(currentFolder);
  const currentFolderLabel = currentFolder === "/" ? "Root" : currentFolder;
  const isMissingParticipantState = !isResolvingParticipant && !participantId;

  const resolveLiveHyperlinkIndex = (hyperlink: string, summaryIndex: number) => {
    const liveHyperlinks = liveFolderContents.hyperlinks ?? [];
    let seenMatches = 0;

    for (let index = 0; index < liveHyperlinks.length; index += 1) {
      if (liveHyperlinks[index] !== hyperlink) {
        continue;
      }

      if (seenMatches === 0) {
        if (summaryIndex === 0) {
          return index;
        }
      }

      const previousMatchingCount = hyperlinks
        .slice(0, summaryIndex)
        .filter((candidate) => candidate === hyperlink).length;

      if (seenMatches === previousMatchingCount) {
        return index;
      }

      seenMatches += 1;
    }

    return -1;
  };

  const resolveLiveFileName = (fileName: string) => {
    const liveFiles = liveFolderContents.files ?? [];
    const matchingFile = liveFiles.find((liveFile) => liveFile.name === fileName);
    return matchingFile?.name ?? null;
  };

  const loadFolderContents = async (
    resolvedParticipantId: string,
    folderPath: string,
    resolvedTeamId: number | null = teamId,
    preferLiveDisplay: boolean = preferLiveContents
  ) => {
    setIsLoadingArtifacts(true);
    setError(null);

    try {
      const shouldLoadSummary =
        folderPath === "/" && assignmentId > 0 && resolvedTeamId && !preferLiveDisplay;
      const [liveResult, summaryResult] = await Promise.allSettled([
        SubmittedContentService.listFiles(resolvedParticipantId, folderPath),
        shouldLoadSummary
          ? SubmittedContentService.getTeamSubmissionSummary(assignmentId, resolvedTeamId)
          : Promise.resolve(null),
      ]);

      const liveResponse = liveResult.status === "fulfilled" ? liveResult.value : null;
      const summaryResponse =
        summaryResult.status === "fulfilled" ? summaryResult.value : null;
      const summaryHasArtifacts =
        Boolean(summaryResponse) &&
        ((summaryResponse?.files?.length ?? 0) > 0 ||
          (summaryResponse?.folders?.length ?? 0) > 0 ||
          (summaryResponse?.hyperlinks?.length ?? 0) > 0);

      if (!liveResponse && !summaryResponse) {
        throw liveResult.status === "rejected" ? liveResult.reason : summaryResult.reason;
      }

      const nextContents = preferLiveDisplay
        ? liveResponse || (summaryHasArtifacts ? summaryResponse : null)
        : (summaryHasArtifacts ? summaryResponse : null) || liveResponse;

      setLiveFolderContents({
        current_folder: liveResponse?.current_folder || folderPath,
        files: liveResponse?.files ?? [],
        folders: liveResponse?.folders ?? [],
        hyperlinks: liveResponse?.hyperlinks ?? [],
      });
      setIsUsingSubmissionSummary(summaryHasArtifacts && !preferLiveDisplay);

      setFolderContents({
        current_folder: nextContents.current_folder || folderPath,
        files: nextContents.files ?? [],
        folders: nextContents.folders ?? [],
        hyperlinks: nextContents.hyperlinks ?? [],
      });
    } catch (loadError) {
      setError(
        buildErrorMessage(loadError, "Unable to load the submitted artifacts for this assignment.")
      );
      setFolderContents({
        current_folder: folderPath,
        files: [],
        folders: [],
        hyperlinks: [],
      });
      setLiveFolderContents({
        current_folder: folderPath,
        files: [],
        folders: [],
        hyperlinks: [],
      });
      setIsUsingSubmissionSummary(false);
    } finally {
      setIsLoadingArtifacts(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const resolveParticipant = async () => {
      if (!assignmentId || !currentUserId) {
        setParticipantId(null);
        setIsResolvingParticipant(false);
        setError("A valid assignment and logged-in student account are required to view submissions.");
        return;
      }

      setIsResolvingParticipant(true);
      setError(null);
      setSuccess(null);
      setCurrentFolder("/");
      setPreferLiveContents(false);

      try {
        const participantContext = await SubmittedContentService.findParticipantContext(
          assignmentId,
          currentUserId
        );

        if (ignore) return;

        setParticipantId(participantContext.participantId);
        setTeamId(participantContext.teamId);
      } catch (resolveError) {
        if (ignore) return;

        setParticipantId(null);
        setTeamId(null);
        setFolderContents({
          current_folder: "/",
          files: [],
          folders: [],
          hyperlinks: [],
        });
        setLiveFolderContents({
          current_folder: "/",
          files: [],
          folders: [],
          hyperlinks: [],
        });
        setError(
          buildErrorMessage(
            resolveError,
            "We could not find a submission record for your account on this assignment."
          )
        );
      } finally {
        if (!ignore) {
          setIsResolvingParticipant(false);
        }
      }
    };

    resolveParticipant();

    return () => {
      ignore = true;
    };
  }, [assignmentId, currentUserId]);

  useEffect(() => {
    if (!participantId) return;

    loadFolderContents(participantId, currentFolder);
  }, [currentFolder, participantId, teamId]);

  useEffect(() => {
    if (!success) return;

    const timeoutId = window.setTimeout(() => {
      setSuccess(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [success]);

  const resolveParticipantForAction = async () => {
    if (participantId) {
      return participantId;
    }

    if (!assignmentId || !currentUserId) {
      setError("A valid assignment and logged-in student account are required to submit work.");
      return null;
    }

    setIsResolvingParticipant(true);
    setError(null);

    try {
      const participantContext = await SubmittedContentService.findParticipantContext(
        assignmentId,
        currentUserId
      );
      setParticipantId(participantContext.participantId);
      setTeamId(participantContext.teamId);
      return participantContext.participantId;
    } catch (resolveError) {
      setError(
        buildErrorMessage(
          resolveError,
          "We could not find a submission record for your account on this assignment."
        )
      );
      return null;
    } finally {
      setIsResolvingParticipant(false);
    }
  };

  const refreshArtifacts = async () => {
    if (!participantId) return;
    await loadFolderContents(participantId, currentFolder);
  };

  const handleOpenFolder = (folderName: string) => {
    setCurrentFolder((previousFolder) =>
      previousFolder === "/" ? `/${folderName}` : `${previousFolder}/${folderName}`
    );
  };

  const handleOpenFile = async (fileName: string, shouldDownload: boolean) => {
    if (!participantId) return;

    const actionKey = `${shouldDownload ? "download" : "open"}:${currentFolder}:${fileName}`;
    setActiveActionKey(actionKey);
    setError(null);

    try {
      const response = await SubmittedContentService.downloadFile(
        fileName,
        participantId,
        currentFolder
      );
      const fileBlob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], {
              type: response.headers?.["content-type"] || "application/octet-stream",
            });
      const objectUrl = window.URL.createObjectURL(fileBlob);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;

      if (shouldDownload) {
        anchor.download = fileName;
        anchor.click();
      } else {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.click();
      }

      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch (downloadError) {
      setError(
        buildErrorMessage(downloadError, `Unable to access ${fileName}. Please try again.`)
      );
    } finally {
      setActiveActionKey(null);
    }
  };

  const handleDeleteEntry = async (entryName: string, entryType: "file" | "folder") => {
    if (!participantId) return;

    const liveEntryName =
      entryType === "file" && isUsingSubmissionSummary
        ? resolveLiveFileName(entryName)
        : entryName;

    if (entryType === "file" && !liveEntryName) {
      setError("This file could not be matched to a live team submission for deletion.");
      return;
    }

    const actionKey = `delete:${currentFolder}:${entryName}`;
    setActiveActionKey(actionKey);
    setError(null);

    try {
      await SubmittedContentService.deleteFile(
        liveEntryName || entryName,
        participantId,
        currentFolder
      );
      setPreferLiveContents(true);
      setSuccess(
        `${entryType === "folder" ? "Folder" : "Artifact"} "${entryName}" was deleted successfully.`
      );
      await loadFolderContents(participantId, currentFolder, teamId, true);
    } catch (deleteError) {
      setError(
        buildErrorMessage(
          deleteError,
          `Unable to delete ${entryName}. Please refresh and try again.`
        )
      );
    } finally {
      setActiveActionKey(null);
    }
  };

  const handleRemoveHyperlink = async (index: number, hyperlink: string) => {
    if (!participantId) return;

    const liveIndex = isUsingSubmissionSummary
      ? resolveLiveHyperlinkIndex(hyperlink, index)
      : index;

    if (liveIndex < 0) {
      setError("This hyperlink could not be matched to a live team submission for deletion.");
      return;
    }

    const actionKey = `link:${index}`;
    setActiveActionKey(actionKey);
    setError(null);

    try {
      await SubmittedContentService.removeHyperlink(participantId, liveIndex);
      setPreferLiveContents(true);
      setSuccess(`Removed hyperlink "${hyperlink}".`);
      await loadFolderContents(participantId, currentFolder, teamId, true);
    } catch (removeError) {
      setError(
        buildErrorMessage(
          removeError,
          "Unable to remove the hyperlink. Please refresh and try again."
        )
      );
    } finally {
      setActiveActionKey(null);
    }
  };

  const handleUploadButtonClick = async () => {
    const resolvedParticipantId = await resolveParticipantForAction();
    if (!resolvedParticipantId || !uploadInputRef.current) {
      return;
    }

    uploadInputRef.current.value = "";
    uploadInputRef.current.click();
  };

  const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] || null;
    event.target.value = "";

    if (!nextFile) {
      return;
    }

    const resolvedParticipantId = await resolveParticipantForAction();
    if (!resolvedParticipantId) {
      return;
    }

    const validationResult = SubmittedContentService.validateFile(nextFile);
    if (!validationResult.valid) {
      setError(validationResult.error || "The selected file is not valid.");
      return;
    }

    setIsSubmittingFile(true);
    setError(null);

    try {
      await SubmittedContentService.submitFile(resolvedParticipantId, nextFile, currentFolder);
      setPreferLiveContents(true);
      setSuccess(`Uploaded "${nextFile.name}" successfully.`);
      await loadFolderContents(resolvedParticipantId, currentFolder, teamId, true);
    } catch (submitError) {
      setError(
        buildErrorMessage(submitError, "Unable to upload the selected file. Please try again.")
      );
    } finally {
      setIsSubmittingFile(false);
    }
  };

  const handleOpenHyperlinkModal = async () => {
    const resolvedParticipantId = await resolveParticipantForAction();
    if (!resolvedParticipantId) {
      return;
    }

    setShowHyperlinkModal(true);
  };

  const actionHelperMessage = isResolvingParticipant
    ? "Preparing your submission workspace..."
    : !participantId
      ? "This student account needs an assignment participant and team before uploads or links can be submitted."
      : "Files upload directly from your computer, and links open a short form.";

  const handleHyperlinkSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!participantId) {
      setError("A participant record is required before adding hyperlinks.");
      return;
    }

    const trimmedUrl = hyperlinkUrl.trim();
    const validationResult = SubmittedContentService.validateUrl(trimmedUrl);
    if (!validationResult.valid) {
      setError(validationResult.error || "The hyperlink is not valid.");
      return;
    }

    setIsSubmittingHyperlink(true);
    setError(null);

    try {
      await SubmittedContentService.submitHyperlink(trimmedUrl, participantId);
      setPreferLiveContents(true);
      setSuccess("Hyperlink submitted successfully.");
      setShowHyperlinkModal(false);
      setHyperlinkUrl("");
      await loadFolderContents(participantId, currentFolder, teamId, true);
    } catch (submitError) {
      setError(
        buildErrorMessage(submitError, "Unable to submit the hyperlink. Please try again.")
      );
    } finally {
      setIsSubmittingHyperlink(false);
    }
  };

  return (
    <main>
      <Container className="submitted-content-container py-3 py-md-4">
        <div className="submitted-content-shell">
          <section className="submitted-content-panel submitted-content-hero">
            <div className="submitted-content-hero-copy">
              <span className="submitted-content-kicker">Student Workspace</span>
              <h1 className="submitted-content-title mb-2">{assignment.name} - View Submissions</h1>
              <p className="submitted-content-subtitle mb-0">
                {assignment?.name
                  ? `Review, submit, and manage your team artifacts for ${assignment.name}.`
                  : "Review, submit, and manage your team artifacts for this assignment."}
              </p>
            </div>
          </section>

          {error && !isMissingParticipantState && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-0">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-0">
              {success}
            </Alert>
          )}

          {isMissingParticipantState ? (
            <section className="submitted-content-panel submitted-content-empty-state">
              <span className="submitted-content-empty-kicker">Submission access unavailable</span>
              <h2 className="submitted-content-section-title mb-2">
                You are not set up for submissions on this assignment.
              </h2>
              <p className="submitted-content-panel-copy mb-0">
                {error ||
                  "No participant record was found for the current user on this assignment."}
              </p>
            </section>
          ) : (
            <>
              <section className="submitted-content-panel submitted-content-actions">
                <input
                  ref={uploadInputRef}
                  type="file"
                  className="d-none"
                  onChange={handleFileSelection}
                  disabled={isSubmittingFile}
                />
            <div className="submitted-content-actions-layout">
              <div className="submitted-content-actions-copy">
                <h2 className="submitted-content-section-title mb-1">Submit work</h2>
                <p className="submitted-content-panel-copy mb-0">
                  Upload files or add links for the current assignment without leaving this page.
                </p>
                <p className="submitted-content-action-note mb-0">{actionHelperMessage}</p>
              </div>
              <div className="submitted-content-action-stack">
                <div className="submitted-content-action-row">
                  <Button
                    className="submission-action-button"
                    onClick={handleUploadButtonClick}
                    disabled={isSubmittingFile || isResolvingParticipant}
                  >
                    {isSubmittingFile ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <FaUpload className="me-2" />
                    )}
                    {isSubmittingFile ? "Uploading..." : "Upload file"}
                  </Button>
                  <Button
                    variant="outline-primary"
                    className="submission-action-button"
                    onClick={handleOpenHyperlinkModal}
                    disabled={isSubmittingHyperlink || isResolvingParticipant}
                  >
                    {isSubmittingHyperlink ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <FaLink className="me-2" />
                    )}
                    Add hyperlink
                  </Button>
                </div>
              </div>
            </div>
              </section>

              <Row className="g-3">
                <Col xl={8}>
                  <div className="submitted-content-panel h-100">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
                  <div>
                    <h2 className="submitted-content-section-title mb-1">Artifacts</h2>
                    <p className="submitted-content-panel-copy mb-0">
                      Open, download, or remove the artifacts submitted by your team.
                    </p>
                  </div>
                  <div className="submitted-content-toolbar">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="submitted-content-refresh-button"
                      onClick={refreshArtifacts}
                      disabled={!participantId || isLoadingArtifacts}
                    >
                      {isLoadingArtifacts ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                      ) : (
                        <FaSyncAlt className="me-2" />
                      )}
                      Refresh
                    </Button>
                    <div className="submitted-content-folder-indicator">
                      <span className="fw-semibold">Current folder:</span> {currentFolderLabel}
                    </div>
                  </div>
                </div>

                <Breadcrumb className="submitted-content-breadcrumb mb-2">
                  <Breadcrumb.Item
                    active={currentFolder === "/"}
                    linkAs="button"
                    onClick={() => setCurrentFolder("/")}
                  >
                    Root
                  </Breadcrumb.Item>
                  {pathSegments.map((segment) => (
                    <Breadcrumb.Item
                      key={segment.path}
                      active={segment.path === currentFolder}
                      linkAs="button"
                      onClick={() => setCurrentFolder(segment.path)}
                    >
                      {segment.label}
                    </Breadcrumb.Item>
                  ))}
                </Breadcrumb>

                {isUsingSubmissionSummary && (
                  <Alert variant="secondary" className="mb-3">
                    Showing your team&apos;s submissions from the assignment submission feed.
                    Uploads and removals still use the live team submission workspace, so file
                    deletion is only available when the visible file still exists there.
                  </Alert>
                )}

                {showLoadingState ? (
                  <div className="submitted-content-loading">
                    <Spinner animation="border" role="status" />
                    <span>Loading submitted artifacts...</span>
                  </div>
                ) : (
                  <>
                    {folders.length === 0 && files.length === 0 ? (
                      <Alert variant="info" className="mb-0">
                        {EMPTY_MESSAGE}
                      </Alert>
                    ) : (
                      <div className="table-responsive">
                        <Table hover className="submitted-content-table mb-0">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Type</th>
                              <th>Size</th>
                              <th>Modified</th>
                              <th className="text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {folders.map((folder: IListedFolder) => {
                              const deleteActionKey = `delete:${currentFolder}:${folder.name}`;

                              return (
                                <tr key={`folder-${folder.name}`}>
                                  <td className="fw-semibold">
                                    <FaFolderOpen className="me-2 text-warning" />
                                    {folder.name}
                                  </td>
                                  <td>Folder</td>
                                  <td>-</td>
                                  <td>{formatTimestamp(folder.modified_at)}</td>
                                  <td className="text-end">
                                    <div className="artifact-actions">
                                      <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() => handleOpenFolder(folder.name)}
                                      >
                                        Open
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => handleDeleteEntry(folder.name, "folder")}
                                        disabled={
                                          isUsingSubmissionSummary ||
                                          activeActionKey === deleteActionKey
                                        }
                                      >
                                        {activeActionKey === deleteActionKey ? (
                                          <Spinner animation="border" size="sm" />
                                        ) : (
                                          <FaTrash />
                                        )}
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {files.map((file: IListedFile) => {
                              const deleteActionKey = `delete:${currentFolder}:${file.name}`;
                              const liveFileName = resolveLiveFileName(file.name);
                              const resolvedFileName =
                                isUsingSubmissionSummary ? liveFileName : file.name;
                              const openActionKey = `open:${currentFolder}:${resolvedFileName ?? file.name}`;
                              const downloadActionKey = `download:${currentFolder}:${resolvedFileName ?? file.name}`;

                              return (
                                <tr key={`file-${file.name}`}>
                                  <td className="fw-semibold">{file.name}</td>
                                  <td>{file.type?.toUpperCase() || "File"}</td>
                                  <td>{SubmittedContentService.formatFileSize(file.size || 0)}</td>
                                  <td>{formatTimestamp(file.modified_at)}</td>
                                  <td className="text-end">
                                    <div className="artifact-actions">
                                      <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() =>
                                          resolvedFileName && handleOpenFile(resolvedFileName, false)
                                        }
                                        disabled={
                                          (isUsingSubmissionSummary && !resolvedFileName) ||
                                          activeActionKey === openActionKey
                                        }
                                      >
                                        {activeActionKey === openActionKey ? (
                                          <Spinner animation="border" size="sm" />
                                        ) : (
                                          <>
                                            <FaExternalLinkAlt className="me-1" />
                                            Open
                                          </>
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={() =>
                                          resolvedFileName && handleOpenFile(resolvedFileName, true)
                                        }
                                        disabled={
                                          (isUsingSubmissionSummary && !resolvedFileName) ||
                                          activeActionKey === downloadActionKey
                                        }
                                      >
                                        {activeActionKey === downloadActionKey ? (
                                          <Spinner animation="border" size="sm" />
                                        ) : (
                                          <>
                                            <FaDownload className="me-1" />
                                            Download
                                          </>
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => handleDeleteEntry(file.name, "file")}
                                        disabled={
                                          (isUsingSubmissionSummary && !liveFileName) ||
                                          activeActionKey === deleteActionKey
                                        }
                                      >
                                        {activeActionKey === deleteActionKey ? (
                                          <Spinner animation="border" size="sm" />
                                        ) : (
                                          <FaTrash />
                                        )}
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </>
                )}
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="submitted-content-panel h-100">
                <div className="mb-2">
                  <h2 className="submitted-content-section-title mb-1">Hyperlinks</h2>
                  <p className="submitted-content-panel-copy mb-0">
                    Submitted URLs are shown separately so you can open them directly or remove them.
                  </p>
                </div>

                {hyperlinks.length === 0 ? (
                  <Alert variant="light" className="mb-0">
                    No hyperlinks have been submitted for this folder yet.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="submitted-content-table mb-0">
                      <thead>
                        <tr>
                          <th>Hyperlink</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hyperlinks.map((hyperlink, index) => {
                          const actionKey = `link:${index}`;
                          const liveHyperlinkIndex = resolveLiveHyperlinkIndex(hyperlink, index);

                          return (
                            <tr key={`${hyperlink}-${index}`}>
                              <td>
                                <a
                                  className="submitted-content-link"
                                  href={hyperlink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {hyperlink}
                                </a>
                              </td>
                              <td className="text-end">
                                <div className="artifact-actions justify-content-end">
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    as="a"
                                    href={hyperlink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <FaExternalLinkAlt className="me-1" />
                                    Open
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => handleRemoveHyperlink(index, hyperlink)}
                                    disabled={
                                      activeActionKey === actionKey || liveHyperlinkIndex < 0
                                    }
                                  >
                                    {activeActionKey === actionKey ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      <FaTrash />
                                    )}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}
                  </div>
                </Col>
              </Row>
            </>
          )}
        </div>
      </Container>

      <Modal
        show={showHyperlinkModal}
        onHide={() => !isSubmittingHyperlink && setShowHyperlinkModal(false)}
        centered
      >
        <Modal.Header closeButton={!isSubmittingHyperlink}>
          <Modal.Title>Add hyperlink</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleHyperlinkSubmit}>
          <Modal.Body>
            <Form.Group controlId="submitted-content-hyperlink">
              <Form.Label>Hyperlink URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com/project"
                value={hyperlinkUrl}
                onChange={(event) => setHyperlinkUrl(event.target.value)}
                disabled={isSubmittingHyperlink}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setShowHyperlinkModal(false)}
              disabled={isSubmittingHyperlink}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmittingHyperlink || !hyperlinkUrl.trim()}>
              {isSubmittingHyperlink ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </main>
  );
};

export default SubmittedContent;
