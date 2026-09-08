/*
 * CourseGradeSummaryPage — instructor-facing grade overview for a course.
 * Shows each student's peer score and instructor grade per assignment,
 * with heat-map coloring normalized to the actual data range.
 * Route: /courses/:courseId/course-report/grade-summary
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
  topic: string | null;
  peer_score: number | null;
  instructor_grade: number | null;
}

interface StudentRow {
  user_id: number;
  user_name: string;
  assignments: AssignmentCell[];
  final_grade: number | null;
}

interface GradeSummaryResponse {
  course_id: number;
  course_name: string;
  assignments: { id: number; name: string; has_topics: boolean }[];
  rows: StudentRow[];
}

const CourseGradeSummaryPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { isLoading, error, data, sendRequest } = useAPI();

  useEffect(() => {
    sendRequest({ url: `/courses/${courseId}/course_report/grade_summary` });
  }, [courseId, sendRequest]);

  const report: GradeSummaryResponse | null = data?.data ?? null;

  const gradeRanges = useMemo(() => {
    if (!report) return {} as Record<number, { peerMin: number; peerMax: number; gradeMin: number; gradeMax: number }>;
    const ranges: Record<number, { peerMin: number; peerMax: number; gradeMin: number; gradeMax: number }> = {};
    report.assignments.forEach((a) => {
      const peerVals = report.rows
        .map((r) => r.assignments.find((c) => c.assignment_id === a.id)?.peer_score)
        .filter((v): v is number => v != null);
      const gradeVals = report.rows
        .map((r) => r.assignments.find((c) => c.assignment_id === a.id)?.instructor_grade)
        .filter((v): v is number => v != null);
      ranges[a.id] = {
        peerMin:  peerVals.length  ? Math.min(...peerVals)  : 0,
        peerMax:  peerVals.length  ? Math.max(...peerVals)  : 100,
        gradeMin: gradeVals.length ? Math.min(...gradeVals) : 0,
        gradeMax: gradeVals.length ? Math.max(...gradeVals) : 100,
      };
    });
    return ranges;
  }, [report]);

  if (isLoading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
  if (error)     return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!report)   return null;

  const assignments = report.assignments;

  return (
    <Container fluid className="px-md-4 mt-4">
      <Row className="mb-3">
        <Col>
          <h2 style={{ fontWeight: 600 }}>Grade Summary — {report.course_name}</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="course-report-table-wrapper">
            <table className="course-report-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="course-report-sticky-col" style={{ verticalAlign: "middle" }}>Student</th>
                  {assignments.map((a) => (
                    <th key={a.id} colSpan={a.has_topics ? 3 : 2} style={{ textAlign: "center" }}>{a.name}</th>
                  ))}
                  <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>Final Grade</th>
                </tr>
                <tr>
                  {assignments.flatMap((a) => [
                    ...(a.has_topics ? [<th key={`${a.id}-topic`} style={{ textAlign: "center", minWidth: "140px" }}>Topic</th>] : []),
                    <th key={`${a.id}-peer`}  style={{ textAlign: "center", width: "72px",  minWidth: "72px"  }}>Peer Score</th>,
                    <th key={`${a.id}-grade`} style={{ textAlign: "center", width: "70px",  minWidth: "70px"  }}>Instr. Grade</th>,
                  ])}
                </tr>
              </thead>
              <tbody>
                {report.rows.map((student) => {
                  const cellByAssignment: Record<number, AssignmentCell> = {};
                  student.assignments.forEach((c) => { cellByAssignment[c.assignment_id] = c; });

                  return (
                    <tr key={student.user_id}>
                      <td className="course-report-sticky-col" style={{ fontWeight: 500 }}>{student.user_name}</td>
                      {assignments.flatMap((a) => {
                        const cell  = cellByAssignment[a.id];
                        const range = gradeRanges[a.id];
                        const peerClass  = cell?.peer_score != null && range ? getHeatColorClass(cell.peer_score, range.peerMin, range.peerMax) : "";
                        const gradeClass = cell?.instructor_grade != null && range ? getHeatColorClass(cell.instructor_grade, range.gradeMin, range.gradeMax) : "";

                        return [
                          ...(a.has_topics ? [<td key={`${a.id}-topic`} style={{ minWidth: "140px" }}>{cell?.topic ?? "—"}</td>] : []),
                          <td key={`${a.id}-peer`}  className={peerClass}  style={{ textAlign: "center" }}>{cell?.peer_score != null ? `${cell.peer_score}%` : "—"}</td>,
                          <td key={`${a.id}-grade`} className={gradeClass} style={{ textAlign: "center" }}>{cell?.instructor_grade != null ? cell.instructor_grade : "—"}</td>,
                        ];
                      })}
                      <td style={{ textAlign: "center", fontWeight: "bold" }}>{student.final_grade ?? "—"}</td>
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

export default CourseGradeSummaryPage;
