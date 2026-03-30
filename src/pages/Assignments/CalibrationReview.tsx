import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import useAPI from '../../hooks/useAPI';
import { HttpMethod } from '../../utils/httpMethods';
import { averageFromDistribution } from './calibrationSummary';
import axiosClient from '../../utils/axios_client';
import { API_BASE_URL } from '../../utils/apiBaseUrl';
import {
  normalizeCalibrationReport,
  questionnaireFromAssignmentApi,
  rubricFromAssignmentResponse,
  type RubricItem,
} from './calibrationReportNormalize';
import {
  buildFallbackCalibrationReport,
  injectDemoInstructorIfNeeded,
  injectDemoStudentCalibrationData,
  type CalibrationReportDisplay,
} from './calibrationReportDemo';
import { coerceQuestionnaireDisplayText } from '../Questionnaires/QuestionnaireUtils';

export type { CalibrationReportJson } from './calibrationReportNormalize';

/** Matches `useAPI` / `axios_client`. */
function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/** Shown when the APIs omit questionnaire name/id (still a clean header for instructors). */
const RUBRIC_STATIC_HEADLINE = 'Review rubric';
const RUBRIC_STATIC_HINT =
  'Link a review questionnaire on the assignment Rubrics tab (round 1 for single-round reviews). Rubric name and id appear here when the APIs return them.';

const CalibrationReview: React.FC = () => {
  const { id: assignmentId, responseMapId, teamId } = useParams<{
    id: string;
    responseMapId?: string;
    teamId?: string;
  }>();
  /** Same segment as `responseMapId`; older duplicate route used `teamId` as the param name. */
  const mapId = responseMapId ?? teamId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showCalibrationApiDebug = searchParams.get('debug_calibration') === '1';
  const { data: apiResponse, sendRequest, isLoading, error } = useAPI();
  const report = useMemo(
    () => (apiResponse?.data ? normalizeCalibrationReport(apiResponse.data) : null),
    [apiResponse]
  );
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<number>(-1);
  const [beginNavError, setBeginNavError] = useState<string | null>(null);
  const [assignmentQuestionnaireMeta, setAssignmentQuestionnaireMeta] = useState<{
    questionnaire_id?: number;
    questionnaire_name?: string;
    review_round?: number;
  } | null>(null);
  const [assignmentRubric, setAssignmentRubric] = useState<RubricItem[]>([]);
  const [assignmentAuxLoaded, setAssignmentAuxLoaded] = useState(false);

  useEffect(() => {
    if (!assignmentId || !mapId) return;
    sendRequest({
      method: HttpMethod.GET,
      url: `/assignments/${assignmentId}/calibration_reports/${mapId}`,
    });
  }, [assignmentId, mapId, sendRequest]);

  useEffect(() => {
    if (!assignmentId) return;
    let cancelled = false;
    setAssignmentAuxLoaded(false);
    axiosClient
      .get(`/assignments/${assignmentId}`)
      .then((res) => {
        if (cancelled) return;
        setAssignmentQuestionnaireMeta(questionnaireFromAssignmentApi(res.data));
        setAssignmentRubric(rubricFromAssignmentResponse(res.data));
      })
      .catch(() => {
        if (!cancelled) {
          setAssignmentQuestionnaireMeta(null);
          setAssignmentRubric([]);
        }
      })
      .finally(() => {
        if (!cancelled) setAssignmentAuxLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [assignmentId]);

  const displayReport = useMemo((): CalibrationReportDisplay | null => {
    if (!assignmentId || !mapId) return null;
    const aid = Number(assignmentId);
    const mid = Number(mapId);
    if (Number.isNaN(aid) || Number.isNaN(mid)) return null;

    if (report) {
      const withInst = injectDemoInstructorIfNeeded(report);
      return injectDemoStudentCalibrationData(withInst);
    }
    if (error && assignmentAuxLoaded) {
      const meta = assignmentQuestionnaireMeta ?? undefined;
      return buildFallbackCalibrationReport({
        assignment_id: aid,
        response_map_id: mid,
        rubric: assignmentRubric,
        questionnaire_id: meta?.questionnaire_id,
        questionnaire_name: meta?.questionnaire_name,
        review_round: meta?.review_round,
        loadError: error,
      });
    }
    return null;
  }, [
    report,
    error,
    assignmentId,
    mapId,
    assignmentAuxLoaded,
    assignmentRubric,
    assignmentQuestionnaireMeta,
  ]);

  const chartData = useMemo(() => {
    if (!displayReport?.per_item_summary?.length) return [];
    return displayReport.per_item_summary.map((row) => {
      const rowText = coerceQuestionnaireDisplayText(row.txt);
      return {
        label: row.seq != null ? `Q${row.seq}` : `I${row.item_id}`,
        name: rowText.length > 28 ? `${rowText.slice(0, 28)}…` : rowText,
        agree: row.agree,
        near: row.near,
        disagree: row.disagree,
      };
    });
  }, [displayReport]);

  const handleEnterInstructorReview = async () => {
    if (!assignmentId || !mapId) return;
    setBeginNavError(null);
    try {
      const res = await axiosClient.post(
        `/assignments/${assignmentId}/calibration_response_maps/${mapId}/begin`
      );
      const raw = res.data as { redirect_to?: string } | undefined;
      const path =
        raw && typeof raw.redirect_to === 'string'
          ? raw.redirect_to
          : `/assignments/edit/${assignmentId}/calibration/${mapId}/review`;
      navigate(path);
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? String((e as { response?: { data?: { error?: string } } }).response?.data?.error ?? '')
          : '';
      setBeginNavError(msg || 'Could not open instructor review. Check that you are logged in as teaching staff.');
    }
  };

  /** Must run before any conditional return — hooks cannot follow early returns. */
  const apiBase = getApiBaseUrl();
  const calibrationReportRequestUrl =
    assignmentId && mapId
      ? `${apiBase}/assignments/${assignmentId}/calibration_reports/${mapId}`
      : '';
  const assignmentRequestUrl = assignmentId ? `${apiBase}/assignments/${assignmentId}` : '';

  if (!assignmentId || !mapId) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Invalid calibration URL: missing assignment id or calibration map id.
        </Alert>
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Container>
    );
  }

  const waitingForAssignmentAux = Boolean(error && !report && mapId && !assignmentAuxLoaded);
  if ((isLoading && !report) || waitingForAssignmentAux) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!displayReport) return null;

  const titleName =
    displayReport.participant_name ||
    displayReport.team_name ||
    `Map ${displayReport.response_map_id}`;

  const summaryByItemId = Object.fromEntries(
    (displayReport.per_item_summary || []).map((s) => [String(s.item_id), s])
  );

  const getBarColor = (score: number, instructorScore: number) => {
    const diff = Math.abs(score - instructorScore);
    if (diff === 0) return '#28a745';
    if (diff === 1) return '#ffc107';
    if (diff === 2) return '#fd7e14';
    return '#dc3545';
  };

  const renderDistributionChart = (
    distribution: Record<string, number>,
    instructorScore?: number | null
  ) => {
    const scores = Object.keys(distribution).map(Number).sort((a, b) => a - b);
    if (scores.length === 0) return <div className="text-muted small">No student scores yet.</div>;

    const maxCount = Math.max(...Object.values(distribution));
    const allRelevantScores = [...scores];
    if (instructorScore != null) allRelevantScores.push(instructorScore);
    const minScore = Math.min(...allRelevantScores);
    const maxScore = Math.max(...allRelevantScores);
    const displayRange: number[] = [];
    for (let i = minScore; i <= maxScore; i++) displayRange.push(i);

    const avg = averageFromDistribution(distribution);

    return (
      <div
        className="mt-2"
        style={{
          width: '100%',
          height: '120px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
          paddingBottom: '20px',
          position: 'relative',
        }}
      >
        {displayRange.map((score) => {
          const count = distribution[score.toString()] || 0;
          const height = maxCount > 0 ? (count / maxCount) * 80 : 0;
          const isInstructorChoice = instructorScore != null && score === instructorScore;
          return (
            <div
              key={score}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${height}%`,
                  backgroundColor:
                    instructorScore != null ? getBarColor(score, instructorScore) : '#6c757d',
                  border: isInstructorChoice ? '3px solid #000' : '1px solid #ddd',
                  borderRadius: '2px 2px 0 0',
                  position: 'relative',
                }}
                title={`Score ${score}: ${count} students`}
              >
                {count > 0 && (
                  <span
                    style={{
                      fontSize: '10px',
                      position: 'absolute',
                      top: '-15px',
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    {count}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11px', marginTop: '4px' }}>{score}</span>
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            width: '100%',
            textAlign: 'center',
            fontSize: '10px',
            color: '#666',
          }}
        >
          Distribution{avg != null ? ` (avg ${avg.toFixed(2)})` : ''}
        </div>
      </div>
    );
  };

  const { rubric, instructor_response, student_responses } = displayReport;

  const questionnaireName =
    displayReport.questionnaire_name ?? assignmentQuestionnaireMeta?.questionnaire_name;
  const questionnaireId =
    displayReport.questionnaire_id ?? assignmentQuestionnaireMeta?.questionnaire_id;
  const questionnaireRound =
    displayReport.review_round ?? assignmentQuestionnaireMeta?.review_round;

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h3 className="mb-0">Calibration: {titleName}</h3>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <Button variant="primary" size="sm" onClick={handleEnterInstructorReview}>
            Enter / edit instructor review
          </Button>
          <Link className="btn btn-outline-primary btn-sm" to={`/assignments/edit/${assignmentId}`}>
            Back to Assignment Editor
          </Link>
        </div>
      </div>

      {beginNavError && (
        <Alert variant="danger" dismissible onClose={() => setBeginNavError(null)}>
          {beginNavError}
        </Alert>
      )}

      {displayReport.calibrationReportLoadError && (
        <Alert variant="warning" className="mb-3">
          Could not load the calibration report from the server ({displayReport.calibrationReportLoadError}
          ). The charts below use preview data: a sample instructor review and sample class scores. Save your
          real instructor review when the API is available.
        </Alert>
      )}

      {displayReport.usingFallbackInstructorReview && !displayReport.calibrationReportLoadError && (
        <Alert variant="info" className="mb-3">
          No complete instructor (gold-standard) review was returned for this calibration. Sample instructor scores
          are shown so you can still use the comparison view; submit the instructor review to replace them.
        </Alert>
      )}

      <Tabs defaultActiveKey="summary" className="mb-4">
        <Tab eventKey="summary" title="Class comparison (stacked)">
          <Card className="mt-3">
            <Card.Body>
              <p className="text-muted small mb-2">
                Green: same score as instructor. Yellow: within 1. Red: further away.
              </p>
              {chartData.length === 0 ? (
                <p className="text-muted">
                  {displayReport.rubric?.length
                    ? "No calibration comparison data yet (no peer scores to compare)."
                    : questionnaireName
                      ? `No rubric items were returned for “${questionnaireName}”. The calibration report JSON may be missing questionnaire items — check the Network response for this page.`
                      : "No review rubric items in this report. Link a review questionnaire on the assignment, or ensure the calibration API includes rubric items."}
                </p>
              ) : (
                <div style={{ width: '100%', overflowX: 'auto' }} data-testid="calibration-stacked-chart">
                  <BarChart
                    width={Math.min(920, chartData.length * 72 + 120)}
                    height={420}
                    data={chartData}
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                  >
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value: number, name: string) => [value, name]} />
                    <Legend />
                    <Bar dataKey="agree" stackId="cal" fill="#28a745" name="Agree" />
                    <Bar dataKey="near" stackId="cal" fill="#ffc107" name="Near (±1)" />
                    <Bar dataKey="disagree" stackId="cal" fill="#dc3545" name="Disagree" />
                  </BarChart>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="detail" title="Rubric detail">
          <Row className="mt-3">
            <Col md={3}>
              <Card className="mb-4">
                <Card.Header>Student reviewers</Card.Header>
                <Card.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="list-group">
                    <button
                      type="button"
                      className={`list-group-item list-group-item-action ${selectedStudentIndex === -1 ? 'active' : ''}`}
                      onClick={() => setSelectedStudentIndex(-1)}
                    >
                      Class summary
                    </button>
                    {student_responses.map((resp, idx) => (
                      <button
                        type="button"
                        key={idx}
                        className={`list-group-item list-group-item-action ${selectedStudentIndex === idx ? 'active' : ''}`}
                        onClick={() => setSelectedStudentIndex(idx)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{resp.reviewer_name || `Reviewer ${idx + 1}`}</span>
                          {resp.updated_at && (
                            <small>{new Date(resp.updated_at).toLocaleDateString()}</small>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={9}>
              {rubric.map((item) => {
                const instAnswer = instructor_response?.answers.find((a) => a.item_id === item.id);
                const studentResp =
                  selectedStudentIndex >= 0 ? student_responses[selectedStudentIndex] : null;
                const studAnswer = studentResp?.answers.find((a) => a.item_id === item.id);
                const rowSummary = summaryByItemId[String(item.id)];

                return (
                  <Card key={item.id} className="mb-4 shadow-sm">
                    <Card.Body>
                      <Card.Title className="border-bottom pb-2">
                        {item.seq}. {coerceQuestionnaireDisplayText(item.txt)}
                      </Card.Title>

                      <Row className="mt-3">
                        <Col md={6} className="border-end">
                          <h6>Instructor (gold standard)</h6>
                          <div className="p-2 bg-light rounded mb-2">
                            <strong>Score:</strong> {instAnswer != null ? instAnswer.answer : 'N/A'}
                            <div className="mt-2">
                              <strong>Comments:</strong>
                              <p className="mb-0 text-muted">{instAnswer?.comments || 'No comments.'}</p>
                            </div>
                          </div>
                        </Col>

                        <Col md={6}>
                          {selectedStudentIndex === -1 ? (
                            <>
                              <h6>Class summary</h6>
                              {rowSummary ? (
                                renderDistributionChart(
                                  rowSummary.distribution || {},
                                  rowSummary.instructor_score ?? instAnswer?.answer
                                )
                              ) : (
                                <span className="text-muted small">No summary for this item.</span>
                              )}
                            </>
                          ) : (
                            <>
                              <h6>Student: {studentResp?.reviewer_name}</h6>
                              <div
                                className={`p-2 rounded mb-2 ${
                                  instAnswer &&
                                  studAnswer &&
                                  instAnswer.answer === studAnswer.answer
                                    ? 'bg-success-subtle'
                                    : 'bg-light'
                                }`}
                              >
                                <strong>Score:</strong>{' '}
                                {studAnswer != null ? studAnswer.answer : 'N/A'}
                                {instAnswer && studAnswer && (
                                  <span className="ms-2 badge rounded-pill bg-secondary">
                                    Diff: {Math.abs(studAnswer.answer - instAnswer.answer)}
                                  </span>
                                )}
                                <div className="mt-2">
                                  <strong>Comments:</strong>
                                  <p className="mb-0 text-muted">
                                    {studAnswer?.comments || 'No comments.'}
                                  </p>
                                </div>
                              </div>
                            </>
                          )}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                );
              })}

              <Card className="mb-4 border-primary">
                <Card.Header className="bg-primary text-white">Overall feedback</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6} className="border-end">
                      <h6>Instructor</h6>
                      <p className="text-muted">
                        {instructor_response?.additional_comment || 'No overall feedback.'}
                      </p>
                    </Col>
                    <Col md={6}>
                      {selectedStudentIndex === -1 ? (
                        <p className="text-center text-muted mt-3">
                          Select a student to see their overall feedback.
                        </p>
                      ) : (
                        <>
                          <h6>Student: {student_responses[selectedStudentIndex]?.reviewer_name}</h6>
                          <p className="text-muted">
                            {student_responses[selectedStudentIndex]?.additional_comment ||
                              'No overall feedback.'}
                          </p>
                        </>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      <Card className="mb-4 border-secondary">
        <Card.Body className="py-3">
          <div className="fw-semibold mb-2">Review questionnaire (rubric source)</div>
          {questionnaireName || questionnaireId != null ? (
            <div className="small lh-lg">
              <span className="text-body fw-medium">{questionnaireName ?? RUBRIC_STATIC_HEADLINE}</span>
              {questionnaireId != null && (
                <span className="text-muted ms-1">(questionnaire id {questionnaireId})</span>
              )}
              {questionnaireRound != null && (
                <span className="text-muted ms-1">· review round {questionnaireRound}</span>
              )}
            </div>
          ) : (
            <div className="small text-muted lh-lg">
              <div className="text-body fw-medium mb-1">{RUBRIC_STATIC_HEADLINE}</div>
              {RUBRIC_STATIC_HINT}
            </div>
          )}

          {showCalibrationApiDebug && (
            <>
              <hr className="my-3" />
              <div className="fw-semibold mb-1 small">API requests (for Network tab)</div>
              <p className="small text-muted mb-2">
                The UI runs on your app origin (e.g. port 3000), but these calls go to the{' '}
                <strong>API</strong> origin below — they will <strong>not</strong> appear mixed with HTML/JS from
                the app unless you show <strong>all</strong> requests. Turn on <strong>Preserve log</strong> before
                navigating so the list is not cleared.
              </p>
              <ul className="small mb-2 ps-3">
                <li className="mb-1">
                  <strong>Calibration report:</strong>{' '}
                  <code className="user-select-all d-inline-block text-break">
                    GET {calibrationReportRequestUrl}
                  </code>
                </li>
                <li>
                  <strong>Assignment (metadata):</strong>{' '}
                  <code className="user-select-all d-inline-block text-break">
                    GET {assignmentRequestUrl}
                  </code>
                </li>
              </ul>
              <p className="small text-muted mb-2">
                In Chrome DevTools → <strong>Network</strong>: set filter to <strong>Fetch/XHR</strong>, then
                search for <code className="user-select-all">calibration_reports</code> or{' '}
                <code className="user-select-all">{mapId}</code>. The <strong>Name</strong> column often shows only
                the last path segment (e.g. <code>{mapId}</code>), not the full path — open a row and check{' '}
                <strong>Headers</strong> → <strong>Request URL</strong> to confirm.
              </p>
              <p className="small text-muted mb-0">
                If the <strong>Response</strong> tab says &quot;Failed to load response data&quot; / &quot;No
                resource with given identifier&quot;, that is a known Chrome issue on some cross-origin requests —
                try the <strong>Preview</strong> tab, use Firefox DevTools, or use the raw JSON card below (this
                page already has <code className="user-select-all">debug_calibration=1</code>).
              </p>
            </>
          )}
        </Card.Body>
      </Card>

      {showCalibrationApiDebug && apiResponse?.data != null && (
        <Card className="mb-4 border-info">
          <Card.Header className="py-2">
            Raw calibration API response (<code>debug_calibration=1</code>)
          </Card.Header>
          <Card.Body className="py-2">
            <pre
              className="small mb-0 text-break"
              style={{ maxHeight: 'min(70vh, 640px)', overflow: 'auto' }}
            >
              {JSON.stringify(apiResponse.data, null, 2)}
            </pre>
          </Card.Body>
        </Card>
      )}

      {displayReport.submitted_content && (
        <Card className="mb-4">
          <Card.Header>Submitted artifacts (calibration participant)</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <strong>Hyperlinks</strong>
                <ul className="mb-0 small">
                  {displayReport.submitted_content.hyperlinks?.length ? (
                    displayReport.submitted_content.hyperlinks.map((h, i) => (
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
                  {displayReport.submitted_content.files?.length ? (
                    displayReport.submitted_content.files.map((f, i) => (
                      <li key={i}>
                        <a href={f} target="_blank" rel="noreferrer">
                          {f}
                        </a>
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
    </Container>
  );
};

export default CalibrationReview;
