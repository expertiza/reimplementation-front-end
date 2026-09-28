import { Card, Col, Form, Row, Table } from "react-bootstrap";
import type { ReviewerOption, RubricDetailRow } from "../calibrationReportNormalize";
import CalibrationRubricDistributionChart from "./CalibrationRubricDistributionChart";

interface CalibrationRubricDetailPanelProps {
  reviewerOptions: ReviewerOption[];
  selectedReviewerId: number | null;
  rows: RubricDetailRow[];
  onReviewerChange: (reviewerId: number) => void;
}

const scoreLabel = (score: number | null) => (score === null ? "N/A" : score);

const commentLabel = (comment: string) => comment.trim() || "No comments";

const differenceLabel = (instructorScore: number | null, studentScore: number | null) => {
  if (instructorScore === null || studentScore === null) {
    return "N/A";
  }

  const difference = studentScore - instructorScore;

  if (difference === 0) {
    return "Matches instructor";
  }

  return `${Math.abs(difference)} ${difference > 0 ? "above" : "below"}`;
};

const CalibrationRubricDetailPanel = ({
  reviewerOptions,
  selectedReviewerId,
  rows,
  onReviewerChange,
}: CalibrationRubricDetailPanelProps) => {
  const selectedReviewer = reviewerOptions.find((option) => option.value === selectedReviewerId);

  return (
    <Card className="mb-4">
      <Card.Body>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-3">
          <div>
            <Card.Title as="h5">Rubric detail</Card.Title>
            <Card.Text className="text-muted mb-0">
              Compare one student calibration review directly against the instructor on each rubric item.
            </Card.Text>
          </div>

          <Form.Group controlId="calibration-reviewer-select" style={{ minWidth: 280 }}>
            <Form.Label className="mb-1">Student reviewer</Form.Label>
            <Form.Select
              aria-label="Student reviewer"
              disabled={reviewerOptions.length === 0}
              value={selectedReviewerId ?? ""}
              onChange={(event) => onReviewerChange(Number(event.target.value))}
            >
              {reviewerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>

        {selectedReviewer ? (
          <p className="mb-3" data-testid="selected-reviewer-summary">
            Comparing against <strong>{selectedReviewer.label}</strong>.
          </p>
        ) : (
          <p className="text-muted mb-3">No student reviewer is available for comparison yet.</p>
        )}

        <div className="d-flex flex-column gap-4">
          {rows.map((row) => (
            <Card key={row.itemId} className="border">
              <Card.Body>
                <h6 className="mb-3">{row.itemSeq}. {row.itemLabel}</h6>

                <Row className="g-4 align-items-start">
                  <Col lg={8}>
                    <Table bordered responsive className="mb-0">
                      <thead>
                        <tr>
                          <th>Instructor score</th>
                          <th>Student score</th>
                          <th>Difference</th>
                          <th>Instructor comment</th>
                          <th>Student comment</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{scoreLabel(row.instructorScore)}</td>
                          <td>{scoreLabel(row.studentScore)}</td>
                          <td>{differenceLabel(row.instructorScore, row.studentScore)}</td>
                          <td>{commentLabel(row.instructorComment)}</td>
                          <td>{commentLabel(row.studentComment)}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>

                  <Col lg={4}>
                    <div className="d-flex flex-column align-items-center">
                      <div className="text-muted small mb-2">
                        Class summary for this rubric ({row.totalResponses} response{row.totalResponses === 1 ? "" : "s"})
                      </div>
                      <CalibrationRubricDistributionChart row={row} />
                      <div className="mt-3 small text-center">
                        <div>Green Agree: {row.agreeCount}</div>
                        <div>Yellow Near: {row.nearCount}</div>
                        <div>Red Disagree: {row.disagreeCount}</div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CalibrationRubricDetailPanel;
