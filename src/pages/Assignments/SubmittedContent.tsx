import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Container, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { FaDownload, FaFile, FaLink, FaTrash } from 'react-icons/fa';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosClient from '../../utils/axios_client';
import ConfirmDeleteModal from '../../components/Modals/ConfirmDeleteModal';
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  deleteFiles,
  formatFileSize,
  getFileIcon,
  listFiles,
  removeHyperlink,
  saveFileToDisk,
  submitFile,
  submitHyperlink,
} from './SubmittedContentUtil';
import { IModalState, ISubmittedContentProps, ISubmittedFile } from '../../types/SubmittedContent';
import styles from './SubmittedContent.module.css';

/**
 * Submissions live directly in the team's directory. Nothing in the backend
 * creates a subdirectory on its own -- `submit_file` only ever writes to the
 * current folder, and `extract_entry` flattens archives via `File.basename` --
 * so the only source of subfolders would be `faction[create]`. That stays out
 * of the UI while rename/move/delete are unavailable (they need server-absolute
 * paths that `list_files` does not return), since a folder created by mistake
 * could never be removed.
 */
const SUBMISSION_ROOT = '/';

/** Mirrors the server's own size and extension limits. */
const fileValidationSchema = Yup.object().shape({
  file: Yup.mixed()
    .required('Please choose a file.')
    .test('fileSize', `Files must be smaller than ${MAX_FILE_SIZE_MB}MB.`, (value: any) =>
      value?.length ? value[0].size <= MAX_FILE_SIZE_MB * 1024 * 1024 : false
    )
    .test('fileType', `Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}.`, (value: any) => {
      if (!value?.length) return false;
      const extension = value[0].name.split('.').pop()?.toLowerCase();
      return !!extension && ALLOWED_EXTENSIONS.includes(extension);
    }),
});

const hyperlinkValidationSchema = Yup.object().shape({
  url: Yup.string()
    .url('Enter a valid URL.')
    .matches(/^https?:\/\//i, 'Hyperlinks must start with http:// or https://')
    .required('A URL is required.'),
});

const SubmittedContent: React.FC<ISubmittedContentProps> = ({ participantId: participantIdProp }) => {
  // Every submitted_content endpoint keys off an AssignmentParticipant id --
  // `set_participant` does `AssignmentParticipant.find(params[:id])` -- and the
  // route carries exactly that.
  const { participantId: participantIdParam } = useParams<{ participantId: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  /** Which participant we are acting as, in order of precedence. */
  const participantId = useMemo<number | null>(() => {
    if (participantIdProp != null) return participantIdProp;

    const queryValue = searchParams.get('participantId');
    for (const candidate of [participantIdParam, queryValue]) {
      const parsed = Number(candidate);
      if (candidate && Number.isFinite(parsed)) return parsed;
    }
    return null;
  }, [participantIdProp, participantIdParam, searchParams]);

  const [files, setFiles] = useState<ISubmittedFile[]>([]);
  const [hyperlinks, setHyperlinks] = useState<string[]>([]);

  // Titles the page. StudentTaskDetail already knows the name and passes it in
  // router state, so the common path needs no request at all.
  const [assignmentName, setAssignmentName] = useState<string | null>(
    (location.state as { assignmentName?: string } | null)?.assignmentName ?? null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // What the confirmation modal is currently asking about, if anything.
  type PendingDelete =
    | { kind: 'file'; file: ISubmittedFile }
    | { kind: 'hyperlink'; index: number; url: string };
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [fileModal, setFileModal] = useState<IModalState>({ show: false, isSubmitting: false });
  const [hyperlinkModal, setHyperlinkModal] = useState<IModalState>({ show: false, isSubmitting: false });

  const flashSuccess = useCallback((message: string) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(null), 4000);
  }, []);

  /**
   * Fetches the assignment name when it was not handed to us in router state.
   * `student_tasks#show` resolves a participant id to a task whose `assignment`
   * field is the name.
   */
  useEffect(() => {
    if (assignmentName) return;

    let cancelled = false;

    const loadAssignmentName = async () => {
      try {
        if (participantId != null) {
          const { data } = await axiosClient.get(`/student_tasks/show/${participantId}`);
          if (!cancelled) setAssignmentName(data?.assignment ?? null);
        }
      } catch {
        // The heading falls back to the generic title; not worth an alert.
      }
    };

    loadAssignmentName();

    return () => {
      cancelled = true;
    };
  }, [assignmentName, participantId]);

  /** GET /submitted_content/list_files for the team's submission directory. */
  const loadSubmissions = useCallback(async () => {
    if (participantId == null) {
      setError('No participant was named for this page. Open it from your task list.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listFiles(participantId, SUBMISSION_ROOT);
      setFiles(data.files ?? []);
      setHyperlinks(data.hyperlinks ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submitted content.');
      setFiles([]);
      setHyperlinks([]);
    } finally {
      setLoading(false);
    }
  }, [participantId]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const uploadSelectedFile = useCallback(
    async (values: { file: FileList | null; unzip: boolean }) => {
      if (participantId == null || !values.file?.length) return;
      const file = values.file[0];

      setFileModal({ show: true, isSubmitting: true });
      setError(null);
      try {
        const { message } = await submitFile(participantId, file, SUBMISSION_ROOT, values.unzip);
        setFileModal({ show: false, isSubmitting: false });
        flashSuccess(message);
        await loadSubmissions();
      } catch (err) {
        setFileModal({ show: true, isSubmitting: false });
        setError(err instanceof Error ? err.message : 'Failed to upload file.');
      }
    },
    [participantId, loadSubmissions, flashSuccess]
  );

  const addHyperlink = useCallback(
    async (values: { url: string }) => {
      if (participantId == null) return;

      setHyperlinkModal({ show: true, isSubmitting: true });
      setError(null);
      try {
        const { message } = await submitHyperlink(participantId, values.url);
        setHyperlinkModal({ show: false, isSubmitting: false });
        flashSuccess(message);
        await loadSubmissions();
      } catch (err) {
        setHyperlinkModal({ show: true, isSubmitting: false });
        setError(err instanceof Error ? err.message : 'Failed to submit hyperlink.');
      }
    },
    [participantId, loadSubmissions, flashSuccess]
  );

  /**
   * Carries out whatever the confirmation modal was asking about. Files are
   * removed by name -- the server resolves it against the team's directory, so
   * the client never handles a server-side path -- and hyperlinks by position.
   */
  const handleConfirmDelete = useCallback(async () => {
    if (participantId == null || pendingDelete == null) return;

    setIsDeleting(true);
    setError(null);
    try {
      if (pendingDelete.kind === 'file') {
        const { message } = await deleteFiles(
          participantId,
          [pendingDelete.file.name],
          SUBMISSION_ROOT
        );
        flashSuccess(message);
      } else {
        await removeHyperlink(participantId, pendingDelete.index);
        flashSuccess('The hyperlink has been removed.');
      }
      setPendingDelete(null);
      await loadSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove the item.');
    } finally {
      setIsDeleting(false);
    }
  }, [participantId, pendingDelete, loadSubmissions, flashSuccess]);

  const handleDownload = useCallback(
    async (file: ISubmittedFile) => {
      if (participantId == null) return;
      setError(null);
      try {
        await saveFileToDisk(participantId, file.name, SUBMISSION_ROOT);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to download file.');
      }
    },
    [participantId]
  );

  const actionsDisabled = participantId == null || loading;

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1 className={styles.title}>
            {assignmentName ? `Submit work for ${assignmentName}` : 'Submit work'}
          </h1>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      <Row className="mb-4">
        <Col className="d-flex flex-wrap gap-2">
          <Button
            variant="primary"
            disabled={actionsDisabled}
            onClick={() => setFileModal({ show: true, isSubmitting: false })}
          >
            <FaFile className="me-2" />
            Upload File
          </Button>
          <Button
            variant="primary"
            disabled={actionsDisabled}
            onClick={() => setHyperlinkModal({ show: true, isSubmitting: false })}
          >
            <FaLink className="me-2" />
            Add Hyperlink
          </Button>
        </Col>
      </Row>

      {loading ? (
        <Row className="py-5">
          <Col className="text-center">
            <Spinner animation="border" role="status" />
          </Col>
        </Row>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <h5>
                Files&nbsp;<span className={styles.count}>{files.length}</span>
              </h5>
              {files.length === 0 ? (
                <p className="text-muted">No files submitted yet.</p>
              ) : (
                <Table striped bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th style={{ width: '90px' }}>Size</th>
                      <th style={{ width: '180px' }}>Last modified</th>
                      <th className="text-end" style={{ width: '80px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr key={file.name}>
                        <td>
                          {getFileIcon(file.name)} {file.name}
                        </td>
                        <td>{formatFileSize(file.size)}</td>
                        <td>{new Date(file.modified_at).toLocaleString()}</td>
                        <td className="text-end">
                          <Button
                            variant="link"
                            className="p-0 me-3"
                            title={`Download ${file.name}`}
                            onClick={() => handleDownload(file)}
                          >
                            <FaDownload />
                          </Button>
                          <Button
                            variant="link"
                            className="p-0 text-danger"
                            title={`Delete ${file.name}`}
                            onClick={() => setPendingDelete({ kind: 'file', file })}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <h5>
                Hyperlinks&nbsp;<span className={styles.count}>{hyperlinks.length}</span>
              </h5>
              {hyperlinks.length === 0 ? (
                <p className="text-muted">No hyperlinks submitted yet.</p>
              ) : (
                <Table striped bordered hover responsive size="sm">
                  <tbody>
                    {hyperlinks.map((url, index) => (
                      <tr key={url}>
                        <td>
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            {url}
                          </a>
                        </td>
                        <td className="text-end" style={{ width: '80px' }}>
                          <Button
                            variant="link"
                            className="p-0 text-danger"
                            title={`Remove ${url}`}
                            onClick={() => setPendingDelete({ kind: 'hyperlink', index, url })}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Col>
          </Row>
        </>
      )}

      <ConfirmDeleteModal
        show={pendingDelete != null}
        title={pendingDelete?.kind === 'hyperlink' ? 'Remove Hyperlink' : 'Delete File'}
        itemType={pendingDelete?.kind === 'hyperlink' ? 'hyperlink' : 'file'}
        itemLabel={pendingDelete?.kind === 'file' ? pendingDelete.file.name : pendingDelete?.url ?? ''}
        action={pendingDelete?.kind === 'hyperlink' ? 'Remove' : 'Delete'}
        isSubmitting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <Modal
        show={fileModal.show}
        onHide={() => setFileModal({ show: false, isSubmitting: false })}
      >
        <Modal.Header closeButton>
          <Modal.Title>Upload File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ file: null as FileList | null, unzip: false }}
            validationSchema={fileValidationSchema}
            onSubmit={uploadSelectedFile}
          >
            {({ setFieldValue, values }) => (
              <FormikForm>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="uploaded_file">Select file</Form.Label>
                  <Form.Control
                    id="uploaded_file"
                    type="file"
                    name="file"
                    disabled={fileModal.isSubmitting}
                    onChange={(event) =>
                      setFieldValue('file', (event.target as HTMLInputElement).files)
                    }
                  />
                  <Form.Text muted>
                    Max {MAX_FILE_SIZE_MB}MB. Allowed: {ALLOWED_EXTENSIONS.join(', ')}.
                  </Form.Text>
                  <ErrorMessage name="file" component="div" className="text-danger" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    id="unzip"
                    type="checkbox"
                    label="Expand this archive after upload (.zip only)"
                    checked={values.unzip}
                    disabled={fileModal.isSubmitting}
                    onChange={(event) => setFieldValue('unzip', event.target.checked)}
                  />
                  <Form.Text muted>
                    The server flattens archives — every entry lands alongside your other files.
                  </Form.Text>
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100" disabled={fileModal.isSubmitting}>
                  {fileModal.isSubmitting ? 'Uploading…' : 'Upload'}
                </Button>
              </FormikForm>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      <Modal
        show={hyperlinkModal.show}
        onHide={() => setHyperlinkModal({ show: false, isSubmitting: false })}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Hyperlink</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ url: '' }}
            validationSchema={hyperlinkValidationSchema}
            onSubmit={addHyperlink}
          >
            <FormikForm>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="url">URL</Form.Label>
                <Field
                  as={Form.Control}
                  id="url"
                  type="url"
                  name="url"
                  placeholder="https://example.com"
                  disabled={hyperlinkModal.isSubmitting}
                />
                <ErrorMessage name="url" component="div" className="text-danger" />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={hyperlinkModal.isSubmitting}
              >
                {hyperlinkModal.isSubmitting ? 'Submitting…' : 'Submit'}
              </Button>
            </FormikForm>
          </Formik>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SubmittedContent;
