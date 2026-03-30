import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import useAPI from '../../hooks/useAPI';
import { HttpMethod } from '../../utils/httpMethods';
import type { CalibrationReportJson } from './CalibrationReview';
import { fileDisplayName } from '../../utils/fileDisplayName';
import { coerceQuestionnaireDisplayText } from '../Questionnaires/QuestionnaireUtils';

/**
 * Which rubric question types should get a numeric score input in the instructor
 * calibration review UI.
 *
 * Different parts of the app (or older fixtures) may store these values with
 * slightly different casing/naming (e.g. `Criterion` vs `CriterionItem`).
 */
function isScorableRubricItem(item: { question_type: string }): boolean {
  const qt = String(item.question_type ?? '').trim().toLowerCase();
  // Be lenient: saved questionnaires may use variants like "Criterion", "Criterion Item",
  // "Scale", "ScaleItem", etc. Substring match covers these.
  return qt.includes('criterion') || qt.includes('scale');
}

/**
 * Instructor (or TA) calibration review: same rubric and submission context as student calibrators,
 * on its own route. The comparison report lives at …/calibration/:mapId without /review.
 */
const CalibrationInstructorReview: React.FC = () => {
  const { id: assignmentId, responseMapId } = useParams<{ id: string; responseMapId: string }>();
  const navigate = useNavigate();
  const { data: apiResponse, sendRequest, isLoading, error } = useAPI();
  const { data: saveResponse, sendRequest: sendSaveReview, error: saveError, isLoading: savingReview } =
    useAPI({ initialLoading: false });
  const report = useMemo(
    () => (apiResponse?.data ? (apiResponse.data as CalibrationReportJson) : null),
    [apiResponse]
  );
  const [reviewDraft, setReviewDraft] = useState<Record<number, { answer: number | ''; comments: string }>>({});
  const [additionalCommentDraft, setAdditionalCommentDraft] = useState('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [pendingSaveKind, setPendingSaveKind] = useState<'draft' | 'submit' | null>(null);
  const instructorDraftSyncKeyRef = useRef('');

  const loadReport = useCallback(() => {
    if (!assignmentId || !responseMapId) return;
    sendRequest({
      method: HttpMethod.GET,
      url: `/assignments/${assignmentId}/calibration_reports/${responseMapId}`,
    });
  }, [assignmentId, responseMapId, sendRequest]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    if (!report?.rubric?.length) return;
    const scorable = report.rubric.filter(isScorableRubricItem);
    const sortedAnswers = [...(report.instructor_response?.answers ?? [])].sort(
      (a, b) => a.item_id - b.item_id
    );
    const syncKey = JSON.stringify({
      response_map_id: report.response_map_id,
      response_id: report.instructor_response?.response_id ?? null,
      is_submitted: report.instructor_response?.is_submitted ?? null,
      additional_comment: report.instructor_response?.additional_comment ?? '',
      answers: sortedAnswers.map((a) => ({
        item_id: a.item_id,
        answer: a.answer,
        comments: a.comments ?? '',
      })),
      rubric_item_ids: scorable.map((r) => r.id).sort((a, b) => a - b),
    });
    if (syncKey === instructorDraftSyncKeyRef.current) return;
    instructorDraftSyncKeyRef.current = syncKey;

    const next: Record<number, { answer: number | ''; comments: string }> = {};
    scorable.forEach((item) => {
      const existing = report.instructor_response?.answers.find((a) => a.item_id === item.id);
      next[item.id] = {
        answer: existing?.answer != null ? existing.answer : '',
        comments: existing?.comments ?? '',
      };
    });
    setReviewDraft(next);
    setAdditionalCommentDraft(report.instructor_response?.additional_comment ?? '');
  }, [report]);

  useEffect(() => {
    if (!saveResponse || saveResponse.status < 200 || saveResponse.status >= 300) return;
    setSaveSuccess('Review saved.');
    setPendingSaveKind(null);
    loadReport();
  }, [saveResponse, loadReport]);

  useEffect(() => {
    if (!savingReview) setPendingSaveKind(null);
  }, [savingReview]);

  const handleSaveReview = (submit: boolean) => {
    if (!assignmentId || !responseMapId) return;
    setSaveSuccess(null);
    setPendingSaveKind(submit ? 'submit' : 'draft');
    const answers = Object.entries(reviewDraft).map(([itemId, v]) => ({
      item_id: Number(itemId),
      answer: v.answer === '' ? null : Number(v.answer),
      comments: v.comments,
    }));
    sendSaveReview({
      method: HttpMethod.POST,
      url: `/assignments/${assignmentId}/calibration_response_maps/${responseMapId}/instructor_response`,
      data: {
        answers,
        additional_comment: additionalCommentDraft,
        is_submitted: submit,
      },
    });
  };

  if (isLoading && !report) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error && !report) {
    const missingRubric =
      typeof error === "string" &&
      (error.includes("No questionnaire configured") || error.toLowerCase().includes("questionnaire"));
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading className="h5">Error loading calibration review</Alert.Heading>
          <p className="mb-2">{error}</p>
          {missingRubric && (
            <p className="mb-0 small">
              Open <strong>Assignment editor → Rubrics</strong>, link a review questionnaire for <strong>round 1</strong>,
              save the assignment, then try again.
            </p>
          )}
        </Alert>
        <Button variant="outline-secondary" onClick={() => navigate(`/assignments/edit/${assignmentId}`)}>
          Back to assignment
        </Button>
      </Container>
    );
  }

  if (!report) return null;

  const titleName =
    report.participant_name || report.team_name || `Map ${report.response_map_id}`;
  const { rubric, instructor_response } = report;
  const scorableRubricItems = rubric.filter(isScorableRubricItem);
  const scoreMin = report.score_scale?.min ?? 0;
  const scoreMax = report.score_scale?.max ?? 5;
  const reviewLocked = instructor_response?.is_submitted === true;
  const reportHref = `/assignments/edit/${assignmentId}/calibration/${responseMapId}`;

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="mb-1">Calibration review</h3>
          <p className="text-muted small mb-0">
            Same rubric and submission as student calibrators see for <strong>{titleName}</strong>.
          </p>
        </div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <Link className="btn btn-outline-secondary btn-sm" to={reportHref}>
            View review report
          </Link>
          <Link className="btn btn-outline-primary btn-sm" to={`/assignments/edit/${assignmentId}`}>
            Back to Assignment Editor
          </Link>
        </div>
      </div>

      {saveError && <Alert variant="danger">{saveError}</Alert>}
      {saveSuccess && (
        <Alert variant="success" dismissible onClose={() => setSaveSuccess(null)}>
          {saveSuccess}
        </Alert>
      )}

      {report.submitted_content && (
        <Card className="mb-4">
          <Card.Header>Submitted work (calibration participant)</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <strong>Hyperlinks</strong>
                <ul className="mb-0 small">
                  {report.submitted_content.hyperlinks?.length ? (
                    report.submitted_content.hyperlinks.map((h, i) => (
                      <li key={i}>
                        <a href={h} target="_blank" rel="noreferrer">
                          {h}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted">None</li>
                  )}
                </ul>
              </Col>
              <Col md={6}>
                <strong>Files</strong>
                <ul className="mb-0 small">
                  {report.submitted_content.files?.length ? (
                    report.submitted_content.files.map((f, i) => (
                      <li key={i} className="text-break">
                        {fileDisplayName(f)}
                      </li>
                    ))
                  ) : (
                    <li className="text-muted">None</li>
                  )}
                </ul>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Header>Rubric</Card.Header>
        <Card.Body>
          {reviewLocked ? (
            <Alert variant="secondary">
              This review has been submitted and cannot be edited. Open{' '}
              <Link to={reportHref}>View review report</Link> to compare with student calibrators.
            </Alert>
          ) : (
            <p className="text-muted small">
              Enter scores ({scoreMin}–{scoreMax}) and comments for each criterion, then save a draft or submit.
            </p>
          )}
          {scorableRubricItems.length === 0 ? (
            <>
              <p className="text-muted">
                No scored rubric items found. Link a review questionnaire on the assignment.
              </p>
              {rubric.length > 0 && (
                <p className="text-muted small mb-0">
                  Detected rubric `question_type` values:
                  <br />
                  {rubric
                    .slice(0, 12)
                    .map((r) => r.question_type)
                    .join(", ")}
                </p>
              )}
            </>
          ) : (
            <>
              {scorableRubricItems.map((item) => (
                <Card key={item.id} className="mb-3">
                  <Card.Body>
                    <Card.Title className="h6">
                      {item.seq}. {coerceQuestionnaireDisplayText(item.txt)}
                    </Card.Title>
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label>Score</Form.Label>
                          <Form.Control
                            type="number"
                            min={scoreMin}
                            max={scoreMax}
                            disabled={reviewLocked}
                            value={
                              reviewDraft[item.id]?.answer === '' || reviewDraft[item.id]?.answer === undefined
                                ? ''
                                : String(reviewDraft[item.id]!.answer)
                            }
                            onChange={(e) => {
                              const raw = e.target.value;
                              setReviewDraft((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  answer: raw === '' ? '' : Number(raw),
                                  comments: prev[item.id]?.comments ?? '',
                                },
                              }));
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={9}>
                        <Form.Group className="mb-2">
                          <Form.Label>Comments</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            disabled={reviewLocked}
                            value={reviewDraft[item.id]?.comments ?? ''}
                            onChange={(e) =>
                              setReviewDraft((prev) => ({
                                ...prev,
                                [item.id]: {
                                  answer: prev[item.id]?.answer ?? '',
                                  comments: e.target.value,
                                },
                              }))
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
              <Form.Group className="mb-3">
                <Form.Label>Overall comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  disabled={reviewLocked}
                  value={additionalCommentDraft}
                  onChange={(e) => setAdditionalCommentDraft(e.target.value)}
                />
              </Form.Group>
              {!reviewLocked && (
                <div className="d-flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline-primary"
                    disabled={savingReview}
                    onClick={() => handleSaveReview(false)}
                  >
                    {savingReview && pendingSaveKind === 'draft' ? 'Saving…' : 'Save draft'}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={savingReview}
                    onClick={() => handleSaveReview(true)}
                  >
                    {savingReview && pendingSaveKind === 'submit' ? 'Submitting…' : 'Submit review'}
                  </Button>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CalibrationInstructorReview;
