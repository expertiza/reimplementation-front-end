import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { alertActions } from "store/slices/alertSlice";
import useAPI from "hooks/useAPI";
import { HttpMethod } from "utils/httpMethods";
import { IAssignmentFormValues } from "./AssignmentUtil";
import { QuestionnaireOption } from "./RubricsContent";
import AssignmentForm, { CourseOption } from "./AssignmentForm";

const CREATE_INITIAL_VALUES: IAssignmentFormValues = {
  name: "",
  directory_path: "",
  spec_location: "",
  private: false,
  show_template_review: false,
  require_quiz: false,
  has_badge: false,
  staggered_deadline: false,
  is_calibrated: false,
  has_teams: false,
  max_team_size: 1,
  has_mentors: false,
  auto_assign_mentors: false,
  has_topics: false,
  allow_tag_prompts: false,
  available_to_students: false,
  reviews_visible_to_other_reviewers: false,
  review_topic_threshold: 0,
  maximum_number_of_reviews_per_submission: 0,
  review_strategy: "",
  instructor_grade_min_score: null,
  instructor_grade_max_score: null,
  review_rubric_varies_by_round: false,
  review_rubric_varies_by_topic: false,
  review_rubric_varies_by_role: false,
  is_role_based: false,
  has_max_review_limit: false,
  set_allowed_number_of_reviews_per_reviewer: 0,
  set_required_number_of_reviews_per_reviewer: 0,
  is_review_anonymous: false,
  is_review_done_by_teams: false,
  allow_self_reviews: false,
  number_of_review_rounds: 1,
  use_signup_deadline: false,
  use_drop_topic_deadline: false,
  use_team_formation_deadline: false,
  date_time: {} as Record<string | number, Date | null>,
  weights: [],
  notification_limits: [],
  submission_allowed: {} as Record<string | number, string>,
  review_allowed: {} as Record<string | number, string>,
  teammate_allowed: {} as Record<string | number, string>,
};

const CreateAssignment: React.FC = () => {
  const dispatch = useDispatch();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireOption[]>([]);

  const { data: coursesResp, error: coursesErr, sendRequest: fetchCourses } = useAPI();
  const {
    data: questionnairesResp,
    error: questionnaireErr,
    sendRequest: fetchQuestionnaires,
  } = useAPI();

  useEffect(() => {
    fetchCourses({ url: "/courses", method: HttpMethod.GET });
    fetchQuestionnaires({ url: "/questionnaires", method: HttpMethod.GET });
  }, [fetchCourses, fetchQuestionnaires]);

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
    if (coursesErr) dispatch(alertActions.showAlert({ variant: "danger", message: coursesErr }));
  }, [coursesErr, dispatch]);

  useEffect(() => {
    if (questionnaireErr)
      dispatch(alertActions.showAlert({ variant: "danger", message: questionnaireErr }));
  }, [questionnaireErr, dispatch]);

  return (
    <main>
      <Container fluid className="px-md-4">
        <Row className="mt-md-3 mb-md-2">
          <Col>
            <h1 className="text-dark" style={{ fontSize: "2rem", fontWeight: 600 }}>
              Create Assignment
            </h1>
          </Col>
          <hr />
        </Row>
        <AssignmentForm
          mode="create"
          initialValues={CREATE_INITIAL_VALUES}
          courses={courses}
          questionnaires={questionnaires}
        />
      </Container>
    </main>
  );
};

export default CreateAssignment;
