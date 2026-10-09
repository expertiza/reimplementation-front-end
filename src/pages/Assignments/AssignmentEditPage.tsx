import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { alertActions } from "store/slices/alertSlice";
import useAPI from "hooks/useAPI";
import { HttpMethod } from "utils/httpMethods";
import { IAssignmentFormValues, transformAssignmentResponse } from "./AssignmentUtil";
import { QuestionnaireOption } from "./RubricsContent";
import AssignmentForm, { CourseOption } from "./AssignmentForm";

const AssignmentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();

  const [assignmentValues, setAssignmentValues] = useState<IAssignmentFormValues | null>(null);
  const [assignmentName, setAssignmentName] = useState("");
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireOption[]>([]);

  const { data: assignmentResp, error: assignmentErr, sendRequest: fetchAssignment } = useAPI();
  const { data: coursesResp, error: coursesErr, sendRequest: fetchCourses } = useAPI();
  const {
    data: questionnairesResp,
    error: questionnaireErr,
    sendRequest: fetchQuestionnaires,
  } = useAPI();

  useEffect(() => {
    if (id)
      fetchAssignment({
        url: `/assignments/${id}`,
        method: HttpMethod.GET,
        transformResponse: transformAssignmentResponse,
      });
    fetchCourses({ url: "/courses", method: HttpMethod.GET });
    fetchQuestionnaires({ url: "/questionnaires", method: HttpMethod.GET });
  }, [id, fetchAssignment, fetchCourses, fetchQuestionnaires]);

  useEffect(() => {
    if (assignmentResp?.data) {
      setAssignmentValues(assignmentResp.data as IAssignmentFormValues);
      setAssignmentName((assignmentResp.data as any).name || "");
    }
  }, [assignmentResp]);

  useEffect(() => {
    if (coursesResp?.data) {
      setCourses((coursesResp.data as any[]).map((c: any) => ({ label: c.name, value: c.id })));
    }
  }, [coursesResp]);

  useEffect(() => {
    if (questionnairesResp?.data) {
      setQuestionnaires(
        (questionnairesResp.data as any[]).map((q: any) => ({
          id: q.id,
          name: q.name,
          questionnaire_type: q.questionnaire_type,
        }))
      );
    }
  }, [questionnairesResp]);

  useEffect(() => {
    if (assignmentErr)
      dispatch(alertActions.showAlert({ variant: "danger", message: assignmentErr }));
  }, [assignmentErr, dispatch]);
  useEffect(() => {
    if (coursesErr) dispatch(alertActions.showAlert({ variant: "danger", message: coursesErr }));
  }, [coursesErr, dispatch]);
  useEffect(() => {
    if (questionnaireErr)
      dispatch(alertActions.showAlert({ variant: "danger", message: questionnaireErr }));
  }, [questionnaireErr, dispatch]);

  if (!assignmentValues) {
    return (
      <main>
        <Container fluid className="px-md-4">
          <div className="mt-4 text-muted">Loading assignment…</div>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container fluid className="px-md-4">
        <Row className="mt-md-2 mb-md-2">
          <Col className="text-center">
            <h2>Editing Assignment: {assignmentName}</h2>
          </Col>
          <hr />
        </Row>
        <AssignmentForm
          mode="edit"
          assignmentId={id}
          initialValues={assignmentValues}
          courses={courses}
          questionnaires={questionnaires}
        />
      </Container>
    </main>
  );
};

export default AssignmentEditPage;
