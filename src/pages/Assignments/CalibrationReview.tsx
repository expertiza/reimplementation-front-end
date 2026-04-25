import { useEffect, useState } from "react";
import { Alert, Card, Container, Spinner } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../../utils/axios_client";
import {
  normalizeCalibrationReport,
  type CalibrationReportResponse,
} from "./calibrationReportNormalize";
import CalibrationStackedChart from "./components/CalibrationStackedChart";

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
          `/assignments/${assignmentId}/reports/calibration/${mapId}`
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

  const normalizedReport = report ? normalizeCalibrationReport(report) : null;
  const studentResponseCount = normalizedReport?.latestStudentResponses.length ?? 0;
  const hyperlinks = report?.submitted_content?.hyperlinks ?? [];
  const files = report?.submitted_content?.files ?? [];
  const hasSubmittedContent = hyperlinks.length > 0 || files.length > 0;
  const backHref = assignmentId ? `/assignments/edit/${assignmentId}` : "/assignments";

  return (
    <Container fluid className="py-4 px-4">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h1 className="mb-1">Calibration Report</h1>
          <p className="text-muted mb-0">
            Assignment {assignmentId} · Calibration map {mapId}
            {report && (
              <>
                {" "}
                · {studentResponseCount} student response{studentResponseCount === 1 ? "" : "s"}
              </>
            )}
          </p>
        </div>
        <Link to={backHref} className="btn btn-outline-secondary btn-sm">
          ← Back to assignment
        </Link>
      </div>

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

      {!loading && !error && report && normalizedReport && (
        <>
          <CalibrationStackedChart
            bucketKeys={normalizedReport.bucketKeys}
            chartData={normalizedReport.stackedChartData}
          />

          {hasSubmittedContent && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title as="h5">Submitted content</Card.Title>
                {hyperlinks.length > 0 && (
                  <>
                    <h6 className="mt-3 mb-2 text-muted">Hyperlinks</h6>
                    <ul className="mb-3">
                      {hyperlinks.map((link, idx) => (
                        <li key={`${link}-${idx}`}>
                          <a href={link} target="_blank" rel="noopener noreferrer">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {files.length > 0 && (
                  <>
                    <h6 className="mt-3 mb-2 text-muted">Files</h6>
                    <ul className="mb-0">
                      {files.map((file, idx) => (
                        <li key={`${file}-${idx}`}>{file}</li>
                      ))}
                    </ul>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default CalibrationReview;
