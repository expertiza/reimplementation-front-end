import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, Form, Alert, Table, Spinner } from 'react-bootstrap';
import { FaFile, FaLink, FaTrash, FaDownload } from 'react-icons/fa';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import SubmittedContentService from '../../services/SubmittedContentService';
import { ISubmittedContentProps, IModalState, IFile } from '../../types/SubmittedContent';
import './SubmittedContent.css';

const SubmittedContent: React.FC<ISubmittedContentProps> = () => {
  // State Management
  const [files, setFiles] = useState<IFile[]>([]);
  const [hyperlinks, setHyperlinks] = useState<{ url: string; title: string; submittedAt: string }[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
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

  // Get assignment ID from URL
  const assignmentId = new URLSearchParams(window.location.search).get('id') || 'default';

  // Initial data fetch
  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  // Fetch submissions list
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // This would call the backend API to fetch submissions
      // const response = await SubmittedContentService.listFiles(assignmentId);
      // setSubmissions(response);
    } catch (err) {
      setError('Failed to fetch submissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  // File Upload Handler
  const handleFileUpload = useCallback(
    async (values: any) => {
      try {
        setFileModal((prev) => ({ ...prev, isSubmitting: true }));
        setError(null);

        if (values.file && values.file.length > 0) {
          const file = values.file[0];

          // Validate file
          const validation = await SubmittedContentService.validateFile(file);
          if (!validation.isValid) {
            setError(validation.error || 'Invalid file');
            return;
          }

          // Submit file
          const response = await SubmittedContentService.submitFile(assignmentId, file);
          
          // Add to files list
          setFiles((prev) => [...prev, response.file]);
          setSuccess('File uploaded successfully');

          // Reset modal
          setFileModal({ show: false, isSubmitting: false });

          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload file');
        console.error(err);
      } finally {
        setFileModal((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [assignmentId]
  );

  // Hyperlink Submit Handler
  const handleHyperlinkSubmit = useCallback(
    async (values: any) => {
      try {
        setHyperlinkModal((prev) => ({ ...prev, isSubmitting: true }));
        setError(null);

        // Validate URL
        const validation = await SubmittedContentService.validateUrl(values.url);
        if (!validation.isValid) {
          setError(validation.error || 'Invalid URL');
          return;
        }

        // Submit hyperlink
        const response = await SubmittedContentService.submitHyperlink(
          assignmentId,
          values.url,
          values.title || values.url
        );

        // Add to hyperlinks list
        setHyperlinks((prev) => [...prev, response.hyperlink]);
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
    [assignmentId]
  );

  // Remove Hyperlink Handler
  const handleRemoveHyperlink = useCallback(
    async (url: string) => {
      try {
        setError(null);
        await SubmittedContentService.removeHyperlink(assignmentId, url);
        setHyperlinks((prev) => prev.filter((h) => h.url !== url));
        setSuccess('Hyperlink removed successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove hyperlink');
        console.error(err);
      }
    },
    [assignmentId]
  );

  // Download File Handler
  const handleDownloadFile = useCallback(
    async (file: IFile) => {
      try {
        setError(null);
        await SubmittedContentService.downloadFile(assignmentId, file.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to download file');
        console.error(err);
      }
    },
    [assignmentId]
  );

  // Delete File Handler
  const handleDeleteFile = useCallback(
    async (fileId: string) => {
      try {
        setError(null);
        await SubmittedContentService.deleteFile(assignmentId, fileId);
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        setSuccess('File deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete file');
        console.error(err);
      }
    },
    [assignmentId]
  );

  // Validation Schemas
  const fileValidationSchema = Yup.object().shape({
    file: Yup.mixed()
      .required('File is required')
      .test('fileSize', 'File is too large', (value: any) => {
        if (!value || value.length === 0) return false;
        return value[0].size <= 50 * 1024 * 1024; // 50MB limit
      }),
  });

  const hyperlinkValidationSchema = Yup.object().shape({
    url: Yup.string().url('Invalid URL').required('URL is required'),
    title: Yup.string().max(255, 'Title is too long'),
  });

  return (
    <Container className="submitted-content-container py-5">
      {/* Header */}
      <Row className="mb-5">
        <Col className="text-center">
          <h1 className="submitted-content-title">📝 Submitted Content</h1>
        </Col>
      </Row>

      {/* Alerts */}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

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
            onClick={fetchSubmissions}
            disabled={loading}
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
            onClick={() => window.location.href = '/'}
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

      {/* Submission History Table */}
      {loading ? (
        <Row className="mb-5">
          <Col className="text-center">
            <Spinner animation="border" />
          </Col>
        </Row>
      ) : submissions.length > 0 ? (
        <Row className="mb-5">
          <Col>
            <h3>📊 Submission History</h3>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Submission ID</th>
                  <th>Type</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{submission.id}</td>
                    <td>{submission.type}</td>
                    <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                    <td>{submission.status}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      ) : null}

      {/* Files Section */}
      {files.length > 0 && (
        <Row className="mb-5">
          <Col>
            <h3>📁 Uploaded Files</h3>
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
                      onClick={() => handleDeleteFile(file.id)}
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
            <h3>🔗 Submitted Hyperlinks</h3>
            <div className="hyperlinks-list">
              {hyperlinks.map((hyperlink) => (
                <div key={hyperlink.url} className="hyperlink-item p-3 mb-2 border rounded d-flex justify-content-between align-items-center">
                  <div>
                    <a href={hyperlink.url} target="_blank" rel="noopener noreferrer">
                      <strong>{hyperlink.title}</strong>
                    </a>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      Submitted: {new Date(hyperlink.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="link"
                    onClick={() => handleRemoveHyperlink(hyperlink.url)}
                    title="Remove"
                    style={{ color: '#dc3545' }}
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
