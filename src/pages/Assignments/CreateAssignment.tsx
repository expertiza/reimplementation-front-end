import React, { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { Form, Formik, FormikHelpers, useFormikContext } from "formik";
import { Button, Col, Container, Row, Tab, Tabs } from "react-bootstrap";
import DataTable from "../../components/Table/Table";
import FormDatePicker from "../../components/Form/FormDatePicker";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { alertActions } from "../../store/slices/alertSlice";
import useAPI from "../../hooks/useAPI";
import { HttpMethod } from "../../utils/httpMethods";
import { IAssignmentFormValues, transformCreateRequest, REVIEW_STRATEGIES, REVIEW_STRATEGY_OPTIONS } from "./AssignmentUtil";
import RubricsContent, { QuestionnaireOption } from "./RubricsContent";
import FormInput from "../../components/Form/FormInput";
import FormSelect from "../../components/Form/FormSelect";
import FormCheckbox from "../../components/Form/FormCheckBox";
import ToolTip from "../../components/ToolTip";
import EtcTab from "./tabs/EtcTab";

// ── Types ────────────────────────────────────────────────────────────────────

interface CourseOption {
  label: string;
  value: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const sanitizePath = (s: string) =>
  s.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

const generateDirPath = (courseName: string, assignmentName: string): string => {
  const course = courseName.trim();
  const assignment = assignmentName.trim();

  // first 8 + last 10 only makes sense when the name is long enough to avoid overlap/duplication;
  // for names <= 18 chars (8+10), the full name is used as-is.
  const coursePrefix = course.length === 0
    ? ""
    : sanitizePath(course.length <= 18 ? course : course.slice(0, 8) + course.slice(-10));

  // Assignment part: full name, spaces/special chars compressed
  const assignmentPart = sanitizePath(assignment);

  if (!coursePrefix) return assignmentPart;
  return assignmentPart ? `${coursePrefix}/${assignmentPart}` : coursePrefix;
};

// ── Sub-components ────────────────────────────────────────────────────────────

const DirectoryPathAutoFill: React.FC<{ courses: CourseOption[] }> = ({ courses }) => {
  const { values, setFieldValue } = useFormikContext<IAssignmentFormValues>();
  // Tracks the last value WE wrote, so we can distinguish our writes from manual user edits
  const lastAutoRef = useRef<string>("");

  useEffect(() => {
    const selectedCourse = courses.find((c) => c.value === Number(values.course_id));
    const courseName =
      selectedCourse && selectedCourse.value !== 0 ? selectedCourse.label : "";
    const auto = generateDirPath(courseName, values.name);

    // Only update if the field is empty OR still matches what we last auto-generated
    // (meaning the user hasn't manually typed something different)
    if (!values.directory_path || values.directory_path === lastAutoRef.current) {
      lastAutoRef.current = auto;
      setFieldValue("directory_path", auto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.name, values.course_id]);

  return null;
};

// ── Validation ────────────────────────────────────────────────────────────────

const validationSchema = Yup.object({
  name: Yup.string().required("Assignment name is required"),
});

// ── Initial values ────────────────────────────────────────────────────────────

const initialValues: IAssignmentFormValues = {
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
  // Rubrics
  is_peer_reviewed: true,
};

// ── Main component ────────────────────────────────────────────────────────────

const CreateAssignment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("general");
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireOption[]>([]);
  const [savedId, setSavedId] = useState<number | null>(null);

  // Keep a ref to the Formik bag so we can access values from handleTabSelect
  const formikRef = useRef<any>(null);

  const { data: coursesResp, error: coursesErr, sendRequest: fetchCourses } = useAPI();
  const { data: questionnairesResp, error: questionnaireErr, sendRequest: fetchQuestionnaires } = useAPI();
  const { error: createErr, sendRequest: createReq } = useAPI();
  const { error: updateErr, sendRequest: updateReq } = useAPI();

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetchCourses({ url: "/courses", method: HttpMethod.GET });
    fetchQuestionnaires({ url: "/questionnaires", method: HttpMethod.GET });
  }, [fetchCourses, fetchQuestionnaires]);

  useEffect(() => {
    if (coursesResp?.data) {
      setCourses(
        (coursesResp.data as any[]).map((c: any) => ({ label: c.name, value: c.id }))
      );
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
    if (questionnaireErr) dispatch(alertActions.showAlert({ variant: "danger", message: questionnaireErr }));
  }, [questionnaireErr, dispatch]);

  useEffect(() => {
    if (createErr) dispatch(alertActions.showAlert({ variant: "danger", message: createErr }));
  }, [createErr, dispatch]);

  useEffect(() => {
    if (updateErr) dispatch(alertActions.showAlert({ variant: "danger", message: updateErr }));
  }, [updateErr, dispatch]);

  // ── Implicit save ──────────────────────────────────────────────────────────

  const doImplicitSave = async (values: IAssignmentFormValues) => {
    if (!values.name) return; // nothing to save without a name
    try {
      if (savedId) {
        await updateReq({
          url: `/assignments/${savedId}`,
          method: HttpMethod.PATCH,
          data: values,
          transformRequest: transformCreateRequest,
        });
      } else {
        const response = await createReq({
          url: "/assignments",
          method: HttpMethod.POST,
          data: values,
          transformRequest: transformCreateRequest,
        });
        const newId = response?.data?.id;
        if (newId) setSavedId(newId);
      }
    } catch {
      // errors surfaced via useEffect above
    }
  };

  const handleTabSelect = async (newKey: string | null) => {
    const key = newKey ?? "general";
    const formik = formikRef.current;
    if (formik) {
      await doImplicitSave(formik.values);
    }
    setActiveTab(key);
  };

  // ── Final submit ───────────────────────────────────────────────────────────

  const onSubmit = async (
    values: IAssignmentFormValues,
    submitProps: FormikHelpers<IAssignmentFormValues>
  ) => {
    try {
      if (savedId) {
        await updateReq({
          url: `/assignments/${savedId}`,
          method: HttpMethod.PATCH,
          data: values,
          transformRequest: transformCreateRequest,
        });
        dispatch(
          alertActions.showAlert({
            variant: "success",
            message: `Assignment "${values.name}" saved!`,
          })
        );
        navigate(`/assignments/edit/${savedId}`);
      } else {
        const response = await createReq({
          url: "/assignments",
          method: HttpMethod.POST,
          data: values,
          transformRequest: transformCreateRequest,
        });
        const newId = response?.data?.id;
        dispatch(
          alertActions.showAlert({
            variant: "success",
            message: `Assignment "${values.name}" created successfully!`,
          })
        );
        navigate(newId ? `/assignments/edit/${newId}` : (location.state?.from ?? "/assignments"));
      }
    } catch {
      // error handled via useEffect
    } finally {
      submitProps.setSubmitting(false);
    }
  };

  const handleCancel = () => navigate(location.state?.from ?? "/assignments");

  // ── Render ─────────────────────────────────────────────────────────────────

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

        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
          validateOnChange={false}
        >
          {(formik) => (
            <Form noValidate>
              <DirectoryPathAutoFill courses={courses} />

              <Tabs
                activeKey={activeTab}
                onSelect={handleTabSelect}
                id="create-assignment-tabs"
                className="mb-3"
              >
                {/* ── General ──────────────────────────────────────────────── */}
                <Tab eventKey="general" title="General">
                  <Row className="mt-3">
                    <Col md={6}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "max-content 1fr",
                          alignItems: "start",
                          columnGap: "20px",
                          rowGap: "4px",
                        }}
                      >
                        <label className="form-label pt-2">Assignment Name *</label>
                        <FormInput controlId="assignment-name" label="" name="name" />

                        <label className="form-label pt-2">Course</label>
                        <FormSelect
                          controlId="assignment-course_id"
                          name="course_id"
                          options={[{ label: "-- None --", value: 0 }, ...courses]}
                        />

                        <div className="d-flex align-items-center gap-1 pt-2">
                          <label className="form-label mb-0">Submission Directory</label>
                          <ToolTip
                            id="directory-tooltip"
                            info="Auto-generated from course + assignment name. No spaces or special chars."
                          />
                        </div>
                        <FormInput
                          controlId="assignment-directory_path"
                          label=""
                          name="directory_path"
                        />

                        <label className="form-label pt-2">Description URL</label>
                        <FormInput
                          controlId="assignment-spec_location"
                          label=""
                          name="spec_location"
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col>
                      <h5 className="mb-3">Assignment Settings</h5>

                      <FormCheckbox
                        controlId="assignment-private"
                        label="Private assignment"
                        name="private"
                      />

                      <FormCheckbox
                        controlId="assignment-has_teams"
                        label="Has teams?"
                        name="has_teams"
                      />
                      {formik.values.has_teams && (
                        <div className="ms-4 mt-1">
                          <div className="d-flex align-items-center gap-3 mb-1">
                            <label className="form-label mb-0">Max team size</label>
                            <div style={{ width: 80 }}>
                              <FormInput
                                controlId="assignment-max_team_size"
                                label=""
                                name="max_team_size"
                                type="number"
                              />
                            </div>
                            <ToolTip id="max-team-size" info="Maximum number of members on a team" />
                          </div>
                          <FormCheckbox
                            controlId="assignment-has_mentors"
                            label="Has mentors?"
                            name="has_mentors"
                          />
                          {formik.values.has_mentors && (
                            <div className="ms-4 mt-1">
                              <FormCheckbox
                                controlId="assignment-auto_assign_mentors"
                                label="Auto-assign mentors when team hits > 50% capacity?"
                                name="auto_assign_mentors"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <FormCheckbox
                        controlId="assignment-has_topics"
                        label="Has topics?"
                        name="has_topics"
                      />

                      <FormCheckbox
                        controlId="assignment-staggered_deadline"
                        label="Staggered deadline assignment?"
                        name="staggered_deadline"
                      />

                      <FormCheckbox
                        controlId="assignment-require_quiz"
                        label="Has quiz?"
                        name="require_quiz"
                      />

                      <FormCheckbox
                        controlId="assignment-reviews_visible_to_other_reviewers"
                        label="Reviews visible to other reviewers?"
                        name="reviews_visible_to_other_reviewers"
                      />

                      <FormCheckbox
                        controlId="assignment-is_calibrated"
                        label="Calibration for training?"
                        name="is_calibrated"
                      />
                      <FormCheckbox
                        controlId="assignment-allow_tag_prompts"
                        label="Allow tag prompts so author can tag feedback comments?"
                        name="allow_tag_prompts"
                      />
                      <FormCheckbox
                        controlId="assignment-available_to_students"
                        label="Available to students?"
                        name="available_to_students"
                      />
                    </Col>
                  </Row>
                </Tab>

                {/* ── Rubrics ───────────────────────────────────────────────── */}
                <Tab eventKey="rubrics" title="Rubrics">
                  <RubricsContent questionnaires={questionnaires} />
                </Tab>

                {/* ── Review Strategy ───────────────────────────────────────── */}
                <Tab eventKey="review-strategy" title="Review Strategy">
                  <div className="mt-4" style={{ maxWidth: 640 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", alignItems: "center", columnGap: 16, rowGap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <label className="form-label mb-0">Review strategy:</label>
                        <ToolTip id="review-strategy" info="Static: each reviewer is pre-assigned a set of submissions to review. Dynamic: a reviewer selects a submission before beginning a review." />
                      </div>
                      <FormSelect
                        controlId="assignment-review_strategy"
                        name="review_strategy"
                        options={REVIEW_STRATEGY_OPTIONS}
                      />

                      {formik.values.review_strategy === REVIEW_STRATEGIES.AUTO_SELECTED && formik.values.has_topics && (
                        <>
                          <label className="form-label mb-0">Review topic threshold (k):</label>
                          <div style={{ width: 70 }}>
                            <FormInput controlId="assignment-review_topic_threshold" label="" name="review_topic_threshold" type="number" />
                          </div>
                        </>
                      )}

                      <label className="form-label mb-0">Maximum reviews per submission:</label>
                      <div style={{ width: 70 }}>
                        <FormInput controlId="assignment-maximum_number_of_reviews_per_submission" label="" name="maximum_number_of_reviews_per_submission" type="number" />
                      </div>
                    </div>

                    {formik.values.review_strategy === REVIEW_STRATEGIES.AUTO_SELECTED && (
                      <div className="mt-3">
                        <FormCheckbox controlId="assignment-has_max_review_limit" label="Has max review limit?" name="has_max_review_limit" />
                        {formik.values.has_max_review_limit && (
                          <div className="ms-4 mt-1" style={{ display: "grid", gridTemplateColumns: "max-content 80px max-content", alignItems: "center", columnGap: 8, rowGap: 4 }}>
                            <label className="form-label mb-0">Required reviews per reviewer:</label>
                            <FormInput controlId="assignment-set_required_number_of_reviews_per_reviewer" label="" name="set_required_number_of_reviews_per_reviewer" type="number" />
                            <ToolTip id="required-reviews" info="How many reviews a reviewer must complete for full credit." />
                            <label className="form-label mb-0">Allowed reviews per reviewer:</label>
                            <FormInput controlId="assignment-set_allowed_number_of_reviews_per_reviewer" label="" name="set_allowed_number_of_reviews_per_reviewer" type="number" />
                            <ToolTip id="allowed-reviews" info="Maximum number of reviews (including required) a reviewer may do, i.e. for extra credit." />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-2">
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <FormCheckbox controlId="assignment-is_review_anonymous" label="Is review anonymous?" name="is_review_anonymous" />
                        <ToolTip id="is-review-anonymous" info="The submitter cannot see who reviewed their submission." />
                      </div>
                      {formik.values.has_teams && (
                        <>
                          <FormCheckbox controlId="assignment-is_review_done_by_teams" label="Is review done by teams?" name="is_review_done_by_teams" />
                          <FormCheckbox controlId="assignment-is_role_based" label="Is role based?" name="is_role_based" />
                        </>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <FormCheckbox controlId="assignment-allow_self_reviews" label="Self-reviews required?" name="allow_self_reviews" />
                        <ToolTip id="allow-self-reviews" info="When enabled, reviewers are required to review their own submission." />
                      </div>
                    </div>

                    <div className="mt-3" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <label className="form-label mb-0">Instructor grade scale:</label>
                      <label className="form-label mb-0">Min:</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: 80 }}
                        value={formik.values.instructor_grade_min_score ?? ""}
                        onChange={(e) =>
                          formik.setFieldValue("instructor_grade_min_score", e.target.value === "" ? null : Number(e.target.value))
                        }
                      />
                      <label className="form-label mb-0">Max:</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: 80 }}
                        value={formik.values.instructor_grade_max_score ?? ""}
                        onChange={(e) =>
                          formik.setFieldValue("instructor_grade_max_score", e.target.value === "" ? null : Number(e.target.value))
                        }
                      />
                    </div>

                    {formik.values.is_role_based && (
                      <div className="alert alert-secondary mt-3">
                        Save the assignment first to configure role-based duties.
                      </div>
                    )}
                  </div>
                </Tab>

                {/* ── Due Dates ─────────────────────────────────────────────── */}
                <Tab eventKey="due-dates" title="Due Dates">
                  <div className="mt-4">
                    <div style={{ display: "flex", alignItems: "center", columnGap: 10, marginBottom: 10 }}>
                      <label className="form-label mb-0">Number of review rounds:</label>
                      <div style={{ width: 70 }}>
                        <FormInput controlId="assignment-number_of_review_rounds" label="" name="number_of_review_rounds" type="number" />
                      </div>
                    </div>

                    <FormCheckbox controlId="assignment-use_signup_deadline" label="Use signup deadline" name="use_signup_deadline" />
                    <FormCheckbox controlId="assignment-use_drop_topic_deadline" label="Use drop-topic deadline" name="use_drop_topic_deadline" />
                    <FormCheckbox controlId="assignment-use_team_formation_deadline" label="Use team-formation deadline" name="use_team_formation_deadline" />

                    <div className="mt-3">
                      <DataTable
                        showColumnFilter={false}
                        showGlobalFilter={false}
                        showPagination={false}
                        getRowId={(row) => String(row.id)}
                        data={[
                          ...Array.from({ length: formik.values.number_of_review_rounds ?? 0 }, (_, i) => ([
                            { id: 2 * i,     deadline_type: `Review ${i + 1}: Submission` },
                            { id: 2 * i + 1, deadline_type: `Review ${i + 1}: Review` },
                          ])).flat(),
                          ...(formik.values.use_signup_deadline        ? [{ id: "signup_deadline",        deadline_type: "Signup deadline" }]        : []),
                          ...(formik.values.use_drop_topic_deadline    ? [{ id: "drop_topic_deadline",    deadline_type: "Drop topic deadline" }]    : []),
                          ...(formik.values.use_team_formation_deadline ? [{ id: "team_formation_deadline", deadline_type: "Team formation deadline" }] : []),
                        ]}
                        columns={[
                          { accessorKey: "deadline_type", header: "Deadline type", enableSorting: false, enableColumnFilter: false },
                          {
                            cell: ({ row }: any) => (
                              <FormDatePicker controlId={`assignment-date_time_${row.original.id}`} name={`date_time.${row.original.id}`} />
                            ),
                            accessorKey: "date_time", header: "Date & Time", enableSorting: false, enableColumnFilter: false,
                          },
                          {
                            cell: ({ row }: any) => (
                              <FormSelect controlId={`assignment-submission_allowed_${row.original.id}`} name={`submission_allowed[${row.original.id}]`} options={[{ label: "Yes", value: "3" }, { label: "Late", value: "2" }, { label: "No", value: "1" }]} />
                            ),
                            accessorKey: "submission_allowed", header: "Submission allowed?", enableSorting: false, enableColumnFilter: false,
                          },
                          {
                            cell: ({ row }: any) => (
                              <FormSelect controlId={`assignment-review_allowed_${row.original.id}`} name={`review_allowed[${row.original.id}]`} options={[{ label: "Yes", value: "3" }, { label: "Late", value: "2" }, { label: "No", value: "1" }]} />
                            ),
                            accessorKey: "review_allowed", header: "Review allowed?", enableSorting: false, enableColumnFilter: false,
                          },
                          {
                            cell: ({ row }: any) => (
                              <FormSelect controlId={`assignment-teammate_allowed_${row.original.id}`} name={`teammate_allowed[${row.original.id}]`} options={[{ label: "Yes", value: "3" }, { label: "Late", value: "2" }, { label: "No", value: "1" }]} />
                            ),
                            accessorKey: "teammate_allowed", header: "Teammate allowed?", enableSorting: false, enableColumnFilter: false,
                          },
                        ]}
                      />
                    </div>

                    <div className="mt-3" style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
                      <FormCheckbox controlId="assignment-apply_late_policy" label="Apply late policy:" name="apply_late_policy" />
                      <FormSelect controlId="assignment-late_policy_id" name="late_policy_id" options={[{ label: "-- None --", value: 0 }]} />
                    </div>
                  </div>
                </Tab>

                {/* ── Etc. ──────────────────────────────────────────────────── */}
                <Tab eventKey="etc" title="Etc.">
                  <Row className="mt-4">
                    <Col>
                      {savedId ? (
                        <EtcTab assignmentId={savedId} />
                      ) : (
                        <div className="alert alert-secondary">
                          <h5>Actions</h5>
                          <p className="mb-0">
                            Save the assignment first (fill in a name and switch to another tab,
                            or click Create Assignment) to unlock participants, teams, and reviewer
                            assignment.
                          </p>
                        </div>
                      )}
                    </Col>
                  </Row>
                </Tab>
              </Tabs>

              {/* ── Footer Buttons ────────────────────────────────────────── */}
              <Row className="mt-4 mb-4">
                <Col className="d-flex gap-2">
                  <Button variant="outline-secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    variant="outline-success"
                    type="submit"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? "Saving..." : "Create Assignment"}
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      </Container>
    </main>
  );
};

export default CreateAssignment;
