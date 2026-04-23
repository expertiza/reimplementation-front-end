import { Container } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";

const CalibrationReview = () => {
  const { assignmentId, mapId } = useParams();

  return (
    <Container className="py-4">
      <h1>Calibration Report</h1>
      <p className="text-muted mb-4">
        Assignment {assignmentId}, calibration map {mapId}
      </p>
      <p>
        This page is the entry point for the calibration report UI. The next step
        is to fetch <code>calibration_report</code> and render the class comparison
        chart plus the rubric-detail comparison view.
      </p>
      <Link to={assignmentId ? `/assignments/edit/${assignmentId}` : "/assignments"}>
        Back to assignment
      </Link>
    </Container>
  );
};

export default CalibrationReview;
