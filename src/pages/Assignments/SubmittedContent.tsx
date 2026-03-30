import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaFile, FaLink, FaTrash, FaDownload } from 'react-icons/fa';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import SubmittedContentService from '../../services/SubmittedContentService';
import useAPI from '../../hooks/useAPI';
import { RootState } from '../../store/store';
import { ISubmittedContentProps, IModalState } from '../../types/SubmittedContent';
import './SubmittedContent.css';

type DisplayFile = { id: string; name: string; size: number; uploadedAt: string };

const SubmittedContent: React.FC<ISubmittedContentProps> = () => {
  const { id: assignmentIdFromRoute } = useParams<{ id: string }>();
  const currentUser = useSelector((state: RootState) => state.authentication.user);
  const { data: participantsRes, isLoading: participantsLoading, sendRequest: fetchParticipants } = useAPI();
  const { data: assignmentRes, isLoading: assignmentLoading, sendRequest: fetchAssignmentMeta } = useAPI({
    initialLoading: false,
  });

  // State Management
  const [files, setFiles] = useState<DisplayFile[]>([]);
  const [hyperlinks, setHyperlinks] = useState<{ url: string; title: string; submittedAt: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal States
  const [fileModal, setFileModal] = useState<IModalState>({
    show: false,
    isSubmitting: false,
  });

  const [hyperlinkModal, setHyperlinkModal] = useState<IModalState>({
    show: false,
    isSubmitting: false,
  });

  // Route: assignments/edit/:id/submitcontent — fall back to ?id= for older links
  const assignmentId =
    assignmentIdFromRoute ||
    new URLSearchParams(window.location.search).get('id') ||
    'default';

  useEffect(() => {
    if (!assignmentId || assignmentId === 'default' || !currentUser?.id) return;
    fetchParticipants({ url: `/participants/assignment/${assignmentId}`, method: 'GET' });
  }, [assignmentId, currentUser?.id, fetchParticipants]);

  useEffect(() => {
    if (!assignmentId || assignmentId === 'default') return;
    fetchAssignmentMeta({ url: `/assignments/${assignmentId}`, method: 'GET' });
  }, [assignmentId, fetchAssignmentMeta]);

  const assignmentTitle = useMemo(() => {
    const d = assignmentRes?.data as Record<string, unknown> | undefined;
    const n = d?.name;
    if (typeof n === 'string' && n.trim()) return n.trim();
    if (assignmentId !== 'default') return `Assignment #${assignmentId}`;
    return 'Assignment submission';
  }, [assignmentRes, assignmentId]);

  const participantId = useMemo(() => {
    const rows = participantsRes?.data;
    if (!Array.isArray(rows)) return null;
    const uid = String(currentUser?.id ?? '');
    const match = rows.find((p: { user_id?: number; user?: { id?: number } }) => {
      const rowUser = p.user_id ?? p.user?.id;
      return String(rowUser) === uid;
    });
    return match?.id != null ? String(match.id) : null;
  }, [participantsRes, currentUser?.id]);

  const refreshSubmissionArtifacts = useCallback(async () => {
    if (!participantId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await SubmittedContentService.listFiles(participantId, '/');
      const rawFiles = Array.isArray(data.files) ? data.files : [];
      setFiles(
        rawFiles.map((f) => {
          const modified = f.modified_at;
          const uploadedAt =
            typeof modified === 'string' && modified
              ? modified
              : modified != null
                ? new Date(modified as unknown as string).toISOString()
                : new Date().toISOString();
          return {
            id: `${f.name}-${uploadedAt}`,
            name: f.name,
            size: typeof f.size === 'number' ? f.size : 0,
            uploadedAt,
          };
        })
      );
      const linkList = Array.isArray(data.hyperlinks) ? data.hyperlinks : [];
      setHyperlinks(
        linkList.map((url: string) => ({
          url,
          title: url,
          submittedAt: '',
        }))
      );
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'error' in err
          ? String((err as { error: string }).error)
          : err instanceof Error
            ? err.message
            : 'Failed to load submitted files and links';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [participantId]);

  useEffect(() => {
    refreshSubmissionArtifacts();
  }, [refreshSubmissionArtifacts]);

  // File Upload Handler
  const handleFileUpload = useCallback(
    async (values: any) => {
      try {
        setFileModal((prev) => ({ ...prev, isSubmitting: true }));
        setError(null);

        if (values.file && values.file.length > 0) {
          const file = values.file[0];

          // Validate file
          if (!participantId) {
            setError('You must be a participant on this assignment to submit files.');
            return;
          }

          const validation = SubmittedContentService.validateFile(file);
          if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            return;
          }

          await SubmittedContentService.submitFile(participantId, file);
          await refreshSubmissionArtifacts();
          setSuccess('File uploaded successfully');

          // Reset modal
          setFileModal({ show: false, isSubmitting: false });

          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'error' in err
            ? String((err as { error: string }).error)
            : err instanceof Error
              ? err.message
              : 'Failed to upload file';
        setError(msg);
        console.error(err);
      } finally {
        setFileModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [participantId, refreshSubmissionArtifacts]
  );

  // Hyperlink Submit Handler
  const handleHyperlinkSubmit = useCallback(
    async (values: any) => {
      try {
        setHyperlinkModal((prev) => ({ ...prev, isSubmitting: true }));
        setError(null);

        // Validate URL
        if (!participantId) {
          setError('You must be a participant on this assignment to submit links.');
          return;
        }

        const validation = SubmittedContentService.validateUrl(values.url);
        if (!validation.valid) {
          setError(validation.error || 'Invalid URL');
          return;
        }

        await SubmittedContentService.submitHyperlink(values.url, participantId);
        await refreshSubmissionArtifacts();
        setSuccess('Hyperlink submitted successfully');

        // Reset modal
        setHyperlinkModal({ show: false, isSubmitting: false });

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit hyperlink');
        console.error(err);
      } finally {
        setHyperlinkModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [participantId, refreshSubmissionArtifacts]
  );

  // Remove Hyperlink Handler (index matches team.hyperlinks order on the server)
  const handleRemoveHyperlink = useCallback(
    async (index: number) => {
      try {
        setError(null);
        if (!participantId) {
          setError('You must be a participant on this assignment to remove links.');
          return;
        }
        await SubmittedContentService.removeHyperlink(participantId, index);
        await refreshSubmissionArtifacts();
        setSuccess('Hyperlink removed successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove hyperlink');
        console.error(err);
      }
    },
    [participantId, refreshSubmissionArtifacts]
  );

  // Download File Handler
  const handleDownloadFile = useCallback(
    async (file: DisplayFile) => {
      try {
        setError(null);
        if (!participantId) {
          setError('Missing participant id for download.');
          return;
        }
        await SubmittedContentService.downloadFile(file.name, participantId, '/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to download file');
        console.error(err);
      }
    },
    [participantId]
  );

  // Delete File Handler
  const handleDeleteFile = useCallback(
    async (file: DisplayFile) => {
      try {
        setError(null);
        if (!participantId) {
          setError('Missing participant id for delete.');
          return;
        }
        await SubmittedContentService.deleteFile(file.name, participantId, '/');
        await refreshSubmissionArtifacts();
        setSuccess('File deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete file');
        console.error(err);
      }
    },
    [participantId, refreshSubmissionArtifacts]
  );

  // Validation Schemas
  const fileValidationSchema = Yup.object().shape({
    file: Yup.mixed()
      .required('File is required')
      .test('fileSize', 'File is too large (max 5MB)', (value: any) => {
        if (!value || value.length === 0) return false;
        return value[0].size <= 5 * 1024 * 1024;
      }),
  });

  const hyperlinkValidationSchema = Yup.object().shape({
    url: Yup.string().url('Invalid URL').required('URL is required'),
    title: Yup.string().max(255, 'Title is too long'),
  });

  const studentTasksPath =
    assignmentId !== 'default' ? `/student_tasks/${assignmentId}` : '/student_tasks';

  return (
    <Container fluid className="px-md-4 submitted-content-container py-4">
      <Row className="mt-3 mb-3">
        <Col xs={12}>
          {assignmentId !== 'default' && assignmentLoading ? (
            <div className="d-flex align-items-center gap-2 text-muted">
              <Spinner animation="border" size="sm" />
              <span>Loading assignment…</span>
            </div>
          ) : (
            <h2 className="mb-0">{assignmentTitle}</h2>
          )}
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Alert variant="info" className="mb-4">
            <Alert.Heading as="h3" className="h5">
              Submit your work
            </Alert.Heading>
            <p className="mb-0">
              Upload files or add links for this assignment. Anything you submit is stored with your team on the server
              and listed below whenever you return.
            </p>
          </Alert>
        </Col>
      </Row>

      {/* Alerts */}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      {assignmentId !== 'default' && participantsLoading && (
        <Alert variant="secondary" className="mb-3">Checking your enrollment on this assignment…</Alert>
      )}
      {assignmentId !== 'default' && !participantsLoading && !participantId && currentUser?.id && (
        <Alert variant="warning" className="mb-3">
          You are not enrolled as a participant on this assignment, so uploads are blocked. Ask the instructor to add you under assignment participants.
        </Alert>
      )}

      {/* Action Buttons Grid */}
      <Row className="mb-5 justify-content-center">
        <Col xs={6} sm={6} md={3} className="d-flex justify-content-center mb-3">
          <Button
            onClick={() => setFileModal({ ...fileModal, show: true })}
            style={{
              backgroundColor: '#e9ecef',
              border: '1px solid #dee2e6',
              color: '#000',
              width: '150px',
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              fontSize: '1rem',
            }}
          >
            <FaFile style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }} />
            Upload File
          </Button>
        </Col>

        <Col xs={6} sm={6} md={3} className="d-flex justify-content-center mb-3">
          <Button
            onClick={() => setHyperlinkModal({ ...hyperlinkModal, show: true })}
            style={{
              backgroundColor: '#e9ecef',
              border: '1px solid #dee2e6',
              color: '#000',
              width: '150px',
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              fontSize: '1rem',
            }}
          >
            <FaLink style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }} />
            Add Hyperlink
          </Button>
        </Col>

        <Col xs={6} sm={6} md={3} className="d-flex justify-content-center mb-3">
          <Button
            onClick={() => refreshSubmissionArtifacts()}
            disabled={loading || !participantId}
            style={{
              backgroundColor: '#e9ecef',
              border: '1px solid #dee2e6',
              color: '#000',
              width: '150px',
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              fontSize: '1rem',
            }}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <>
                <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</span>
                View History
              </>
            )}
          </Button>
        </Col>

        <Col xs={6} sm={6} md={3} className="d-flex justify-content-center mb-3">
          <Button
            as={Link}
            to={studentTasksPath}
            style={{
              backgroundColor: '#e9ecef',
              border: '1px solid #dee2e6',
              color: '#000',
              width: '150px',
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              fontSize: '1rem',
            }}
          >
            <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔙</span>
            Go Back
          </Button>
        </Col>
      </Row>

      {loading && participantId && files.length === 0 && hyperlinks.length === 0 ? (
        <Row className="mb-4">
          <Col className="text-center text-muted">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading your submissions…
          </Col>
        </Row>
      ) : null}

      {/* Files Section */}
      {files.length > 0 && (
        <Row className="mb-5">
          <Col>
            <h3 className="h5">Uploaded files</h3>
            <div className="files-list">
              {files.map((file) => (
                <div key={file.id} className="file-item p-3 mb-2 border rounded d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{file.name}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {SubmittedContentService.formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="link"
                      onClick={() => handleDownloadFile(file)}
                      title="Download"
                      style={{ color: '#007bff', marginRight: '0.5rem' }}
                    >
                      <FaDownload />
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => handleDeleteFile(file)}
                      title="Delete"
                      style={{ color: '#dc3545' }}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      )}

      {/* Hyperlinks Section */}
      {hyperlinks.length > 0 && (
        <Row className="mb-5">
          <Col>
            <h3 className="h5">Submitted hyperlinks</h3>
            <div className="hyperlinks-list">
              {hyperlinks.map((hyperlink, index) => (
                <div key={`${hyperlink.url}-${index}`} className="hyperlink-item p-3 mb-2 border rounded d-flex justify-content-between align-items-center">
                  <div>
                    <a href={hyperlink.url} target="_blank" rel="noopener noreferrer">
                      <strong>{hyperlink.title}</strong>
                    </a>
                    {hyperlink.submittedAt ? (
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        Submitted: {new Date(hyperlink.submittedAt).toLocaleString()}
                      </div>
                    ) : null}
                  </div>
                  <Button
                    variant="link"
                    onClick={() => handleRemoveHyperlink(index)}
                    title="Remove"
                    style={{ color: '#dc3545' }}
                    disabled={!participantId}
                  >
                    <FaTrash />
                  </Button>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      )}

      {/* File Upload Modal */}
      <Modal show={fileModal.show} onHide={() => setFileModal({ ...fileModal, show: false })}>
        <Modal.Header closeButton>
          <Modal.Title>Upload File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ file: null }}
            validationSchema={fileValidationSchema}
            onSubmit={handleFileUpload}
          >
            {({ isSubmitting, setFieldValue }) => (
              <FormikForm>
                <Form.Group className="mb-3">
                  <Form.Label>Select File</Form.Label>
                  <Form.Control
                    type="file"
                    name="file"
                    onChange={(event) => {
                      const files = (event.target as HTMLInputElement).files;
                      setFieldValue('file', files);
                    }}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage name="file" component="div" className="text-danger" />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting || fileModal.isSubmitting}
                  className="w-100"
                >
                  {isSubmitting || fileModal.isSubmitting ? 'Uploading...' : 'Upload'}
                </Button>
              </FormikForm>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      {/* Hyperlink Modal */}
      <Modal show={hyperlinkModal.show} onHide={() => setHyperlinkModal({ ...hyperlinkModal, show: false })}>
        <Modal.Header closeButton>
          <Modal.Title>Add Hyperlink</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ url: '', title: '' }}
            validationSchema={hyperlinkValidationSchema}
            onSubmit={handleHyperlinkSubmit}
          >
            {({ isSubmitting }) => (
              <FormikForm>
                <Form.Group className="mb-3">
                  <Form.Label>URL</Form.Label>
                  <Field
                    as={Form.Control}
                    type="url"
                    name="url"
                    placeholder="https://example.com"
                    disabled={isSubmitting || hyperlinkModal.isSubmitting}
                  />
                  <ErrorMessage name="url" component="div" className="text-danger" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Title (Optional)</Form.Label>
                  <Field
                    as={Form.Control}
                    type="text"
                    name="title"
                    placeholder="Link title"
                    disabled={isSubmitting || hyperlinkModal.isSubmitting}
                  />
                  <ErrorMessage name="title" component="div" className="text-danger" />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting || hyperlinkModal.isSubmitting}
                  className="w-100"
                >
                  {isSubmitting || hyperlinkModal.isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </FormikForm>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SubmittedContent;
