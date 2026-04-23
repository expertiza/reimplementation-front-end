import { useEffect, useState } from "react";
import { Alert, Container, ListGroup, Spinner } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../../utils/axios_client";

interface CalibrationReportResponse {
  map_id: number;
  assignment_id: number;
  reviewee_id: number;
  rubric_items: unknown[];
  instructor_response: unknown;
  student_responses: unknown[];
  per_item_summary: unknown[];
  submitted_content?: {
    hyperlinks?: string[];
    files?: string[];
  };
}

const CalibrationReview = () => {
  const { assignmentId, mapId } = useParams();
  const [report, setReport] = useState<CalibrationReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      if (!assignmentId || !mapId) {
        setError("Missing assignment or calibration map id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await axiosClient.get<CalibrationReportResponse>(
          `/assignments/${assignmentId}/review_mappings/${mapId}/calibration_report`
        );
        setReport(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Unable to load calibration report");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [assignmentId, mapId]);

  return (
    <Container className="py-4">
      <h1>Calibration Report</h1>
      <p className="text-muted mb-4">
        Assignment {assignmentId}, calibration map {mapId}
      </p>

      {loading && (
        <div className="d-flex align-items-center gap-2 mb-4">
          <Spinner animation="border" size="sm" />
          <span>Loading calibration report...</span>
        </div>
      )}

      {!loading && error && (
        <Alert variant="danger">
          <Alert.Heading>Unable to load calibration report</Alert.Heading>
          <div>{error}</div>
        </Alert>
      )}

      {!loading && !error && report && (
        <>
          <Alert variant="success">
            Calibration report loaded. This confirms the route and backend payload are wired.
          </Alert>

          <ListGroup className="mb-4">
            <ListGroup.Item>
              <strong>Map ID:</strong> {report.map_id}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Reviewee ID:</strong> {report.reviewee_id}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Rubric items:</strong> {report.rubric_items.length}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Student responses:</strong> {report.student_responses.length}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Per-item summaries:</strong> {report.per_item_summary.length}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Submitted hyperlinks:</strong> {report.submitted_content?.hyperlinks?.length ?? 0}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Submitted files:</strong> {report.submitted_content?.files?.length ?? 0}
            </ListGroup.Item>
          </ListGroup>
        </>
      )}

      <Link to={assignmentId ? `/assignments/edit/${assignmentId}` : "/assignments"}>
        Back to assignment
      </Link>
    </Container>
  );
};

export default CalibrationReview;
