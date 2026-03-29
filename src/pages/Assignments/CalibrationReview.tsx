import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import useAPI from '../../hooks/useAPI';
import { HttpMethod } from '../../utils/httpMethods';
import { averageFromDistribution } from './calibrationSummary';

interface Answer {
  item_id: number;
  answer: number;
  comments: string;
}

interface ResponsePayload {
  response_id: number;
  additional_comment: string;
  is_submitted?: boolean;
  updated_at?: string;
  answers: Answer[];
  reviewer_name?: string;
  response_map_id?: number;
}

interface RubricItem {
  id: number;
  txt: string;
  weight: number;
  seq: number;
  question_type: string;
  min_label?: string;
  max_label?: string;
  break_before?: boolean;
}

export interface CalibrationReportJson {
  assignment_id: number;
  response_map_id: number;
  team_id: number | null;
  team_name: string | null;
  participant_name?: string;
  rubric: RubricItem[];
  instructor_response: ResponsePayload | null;
  student_responses: ResponsePayload[];
  per_item_summary: Array<{
    item_id: number;
    seq: number;
    txt: string;
    question_type: string;
    agree: number;
    near: number;
    disagree: number;
    distribution: Record<string, number>;
    instructor_score: number | null;
  }>;
  submitted_content?: { hyperlinks: string[]; files: string[] };
}

const CalibrationReview: React.FC = () => {
  const { id: assignmentId, responseMapId } = useParams<{ id: string; responseMapId: string }>();
  const navigate = useNavigate();
  const { data: apiResponse, sendRequest, isLoading, error } = useAPI();
  const { data: beginResponse, sendRequest: sendBegin, error: beginError } = useAPI();
  const report = useMemo(
    () => (apiResponse?.data ? (apiResponse.data as CalibrationReportJson) : null),
    [apiResponse]
  );
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<number>(-1);
  const [beginMessage, setBeginMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!assignmentId || !responseMapId) return;
    sendRequest({
      method: HttpMethod.GET,
      url: `/assignments/${assignmentId}/calibration_reports/${responseMapId}`,
    });
  }, [assignmentId, responseMapId, sendRequest]);

  const chartData = useMemo(() => {
    if (!report?.per_item_summary?.length) return [];
    return report.per_item_summary.map((row) => ({
      label: row.seq != null ? `Q${row.seq}` : `I${row.item_id}`,
      name: row.txt?.length > 28 ? `${row.txt.slice(0, 28)}…` : row.txt,
      agree: row.agree,
      near: row.near,
      disagree: row.disagree,
    }));
  }, [report]);

  const handleBeginReview = () => {
    if (!assignmentId || !responseMapId) return;
    setBeginMessage(null);
    sendBegin({
      method: HttpMethod.POST,
      url: `/assignments/${assignmentId}/calibration_response_maps/${responseMapId}/begin`,
    });
  };

  useEffect(() => {
    const d = beginResponse?.data as { redirect_to?: string; map_id?: number } | undefined;
    if (d && typeof d.redirect_to === 'string') {
      setBeginMessage(`Use this path for the instructor review UI: ${d.redirect_to}`);
    }
  }, [beginResponse]);

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
    return (
      <Container className="mt-5">
        <Alert variant="danger">Error loading calibration report: {error}</Alert>
        <Button variant="outline-secondary" onClick={() => navigate(`/assignments/edit/${assignmentId}`)}>
          Back
        </Button>
      </Container>
    );
  }

  if (!report) return null;

  const titleName =
    report.participant_name || report.team_name || `Map ${report.response_map_id}`;

  const summaryByItemId = Object.fromEntries(
    (report.per_item_summary || []).map((s) => [String(s.item_id), s])
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

  const { rubric, instructor_response, student_responses } = report;

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h3 className="mb-0">Calibration: {titleName}</h3>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <Button variant="outline-secondary" size="sm" onClick={handleBeginReview}>
            Instructor review (API begin)
          </Button>
          <Link className="btn btn-outline-primary btn-sm" to={`/assignments/edit/${assignmentId}`}>
            Back to Assignment Editor
          </Link>
        </div>
      </div>

      {beginError && <Alert variant="danger">{beginError}</Alert>}
      {beginMessage && (
        <Alert variant="info" dismissible onClose={() => setBeginMessage(null)}>
          {beginMessage}
        </Alert>
      )}

      {report.submitted_content && (
        <Card className="mb-4">
          <Card.Header>Submitted artifacts (calibration participant)</Card.Header>
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

      <Tabs defaultActiveKey="summary" className="mb-4">
        <Tab eventKey="summary" title="Class comparison (stacked)">
          <Card className="mt-3">
            <Card.Body>
              <p className="text-muted small mb-2">
                Green: same score as instructor. Yellow: within 1. Red: further away.
              </p>
              {chartData.length === 0 ? (
                <p className="text-muted">No rubric summary yet. Add questionnaire to the assignment.</p>
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
                        {item.seq}. {item.txt}
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
    </Container>
  );
};

export default CalibrationReview;
