/*
 * CourseAllReviewsPage — instructor-facing teammate review summary for a course.
 * Shows the average peer review score received by each student per assignment,
 * with heat-map coloring normalized to the actual data range.
 * Route: /courses/:courseId/course-report/all-reviews
 */
import { useEffect, useMemo } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import useAPI from "../../hooks/useAPI";
import { getHeatColorClass } from "../../utils/heatgridUtils";
import "./CourseReports.css";

interface AssignmentCell {
  assignment_id: number;
  assignment_name: string;
  teammate_review: string | null;
}

interface StudentRow {
  user_id: number;
  user_name: string;
  teammate_count: number;
  assignments: AssignmentCell[];
  aggregate: string | null;
}

interface AllReviewsResponse {
  course_id: number;
  course_name: string;
  assignments: { id: number; name: string }[];
  rows: StudentRow[];
}

const parsePct = (val: string | null): number | null => {
  if (!val) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
};

const CourseAllReviewsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { isLoading, error, data, sendRequest } = useAPI();

  useEffect(() => {
    sendRequest({ url: `/courses/${courseId}/course_report/all_reviews` });
  }, [courseId, sendRequest]);

  const report: AllReviewsResponse | null = data?.data ?? null;

  const { dataMin, dataMax } = useMemo(() => {
    if (!report) return { dataMin: 0, dataMax: 100 };
    const allPcts = report.rows.flatMap((r) =>
      r.assignments.map((c) => parsePct(c.teammate_review)).filter((v): v is number => v != null)
    );
    return {
      dataMin: allPcts.length ? Math.min(...allPcts) : 0,
      dataMax: allPcts.length ? Math.max(...allPcts) : 100,
    };
  }, [report]);

  if (isLoading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
  if (error)     return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!report)   return null;

  const assignments = report.assignments;

  return (
    <Container fluid className="px-md-4 mt-4">
      <Row className="mb-3">
        <Col>
          <h2 style={{ fontWeight: 600 }}>Teammate Reviews Summary — {report.course_name}</h2>
          <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
            Scores shown are the average peer review scores <strong>received</strong> by each student from their teammates.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="course-report-table-wrapper">
            <table className="course-report-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="course-report-sticky-col" style={{ verticalAlign: "middle" }}>Student</th>
                  <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", width: "80px" }}>Teammate Count</th>
                  {assignments.map((a) => (
                    <th key={a.id} style={{ textAlign: "center" }}>{a.name}</th>
                  ))}
                  <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", width: "80px" }}>Aggregate</th>
                </tr>
                <tr>
                  {assignments.map((a) => (
                    <th key={`${a.id}-sub`} style={{ textAlign: "center", fontWeight: "normal", fontSize: "11px", minWidth: "90px" }}>
                      Avg Score Received (%)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.map((student) => {
                  const cellByAssignment: Record<number, AssignmentCell> = {};
                  student.assignments.forEach((c) => { cellByAssignment[c.assignment_id] = c; });
                  const aggPct = parsePct(student.aggregate);

                  return (
                    <tr key={student.user_id}>
                      <td className="course-report-sticky-col" style={{ fontWeight: 500 }}>{student.user_name}</td>
                      <td style={{ textAlign: "center" }}>{student.teammate_count}</td>
                      {assignments.map((a) => {
                        const cell = cellByAssignment[a.id];
                        const pct  = parsePct(cell?.teammate_review ?? null);
                        return (
                          <td key={`${student.user_id}-${a.id}`} className={pct != null ? getHeatColorClass(pct, dataMin, dataMax) : ""} style={{ textAlign: "center" }}>
                            {cell?.teammate_review ?? "—"}
                          </td>
                        );
                      })}
                      <td className={aggPct != null ? getHeatColorClass(aggPct, dataMin, dataMax) : ""} style={{ textAlign: "center", fontWeight: "bold" }}>
                        {student.aggregate ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseAllReviewsPage;
