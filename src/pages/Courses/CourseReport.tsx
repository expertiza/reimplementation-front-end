import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Alert, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Table from "../../components/Table/Table";
import useAPI from "../../hooks/useAPI";
import {
  buildColumns,
  buildRows,
} from "../../services/courseAssignmentOverviewService";
import {
  CourseReportApiResponse,
  DEFAULT_VISIBLE_FIELDS,
  VisibleFields,
} from "../../types/courseAssignmentOverview";

const CourseReport = () => {
  const { courseId } = useParams();
  const { data, error, isLoading, sendRequest } = useAPI();
  const [visibleFields, setVisibleFields] =
    useState<VisibleFields>(DEFAULT_VISIBLE_FIELDS);

  useEffect(() => {
    if (courseId) {
      sendRequest({ url: `/assignment_records?course_id=${courseId}` });
    }
  }, [courseId, sendRequest]);

  const reportData = data?.data as CourseReportApiResponse | undefined;
  const assignments = reportData?.assignments ?? [];
  const students = reportData?.students ?? [];

  const rows = useMemo(() => buildRows(students, assignments), [students, assignments]);
  const columns = useMemo(
    () => buildColumns(assignments, visibleFields),
    [assignments, visibleFields]
  );

  const columnVisibility = useMemo(
    () =>
      assignments.reduce<Record<string, boolean>>(
        (acc, assignment) => {
          if (assignment.has_topics) {
            acc[`a${assignment.assignment_id}_topic`] = visibleFields.topic;
          }
          acc[`a${assignment.assignment_id}_peerGrade`] = visibleFields.peerGrade;
          acc[`a${assignment.assignment_id}_instructorGrade`] =
            visibleFields.instructorGrade;
          acc[`a${assignment.assignment_id}_avgTeammateScore`] =
            visibleFields.avgTeammateScore;
          return acc;
        },
        { studentName: true }
      ),
    [assignments, visibleFields]
  );

  const tableKey = useMemo(
    () =>
      JSON.stringify({
        assignments: assignments.map((assignment) => assignment.assignment_id),
        visibleFields,
      }),
    [assignments, visibleFields]
  );

  const handleFieldToggle =
    (field: keyof VisibleFields) => (event: ChangeEvent<HTMLInputElement>) => {
      setVisibleFields((prev) => ({
        ...prev,
        [field]: event.target.checked,
      }));
    };

  if (isLoading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <main>
      <Container fluid className="px-md-4">
        <Row className="mt-4 mb-4">
          <Col className="text-center">
            <h1 className="text-dark" style={{ fontSize: "2rem", fontWeight: "600" }}>
              Course Report — {reportData?.course_name}
            </h1>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <div className="d-flex flex-wrap gap-3">
              <Form.Check
                type="checkbox"
                id="course-report-topic"
                label="Topic"
                checked={visibleFields.topic}
                onChange={handleFieldToggle("topic")}
              />
              <Form.Check
                type="checkbox"
                id="course-report-peer-grade"
                label="Peer Grade"
                checked={visibleFields.peerGrade}
                onChange={handleFieldToggle("peerGrade")}
              />
              <Form.Check
                type="checkbox"
                id="course-report-instructor-grade"
                label="Instructor Grade"
                checked={visibleFields.instructorGrade}
                onChange={handleFieldToggle("instructorGrade")}
              />
              <Form.Check
                type="checkbox"
                id="course-report-avg-teammate-score"
                label="Avg. Teammate Score"
                checked={visibleFields.avgTeammateScore}
                onChange={handleFieldToggle("avgTeammateScore")}
              />
            </div>
          </Col>
        </Row>
        <Row>
          <Table
            key={tableKey}
            data={rows}
            columns={columns}
            columnVisibility={columnVisibility}
            showPagination={false}
            showGlobalFilter={false}
          />
        </Row>
      </Container>
    </main>
  );
};

export default CourseReport;
