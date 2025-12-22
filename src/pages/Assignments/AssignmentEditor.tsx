import * as Yup from "yup";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import { Button, Modal } from "react-bootstrap";
import { Form, Formik } from "formik";
import { IAssignmentFormValues } from "./AssignmentUtil";
import { IEditor } from "../../utils/interfaces";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import FormInput from "components/Form/FormInput";
import FormSelect from "components/Form/FormSelect";
import { HttpMethod } from "utils/httpMethods";
import { RootState } from "../../store/store";
import { alertActions } from "../../store/slices/alertSlice";
import useAPI from "../../hooks/useAPI";
import FormCheckbox from "components/Form/FormCheckBox";
import { Tabs, Tab } from 'react-bootstrap';
import '../../custom.scss';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import Table from "components/Table/Table";
import FormDatePicker from "components/Form/FormDatePicker";
import ToolTip from "components/ToolTip";

const initialValues: IAssignmentFormValues = {
  name: "",
  directory_path: "",
  instructor_id: 1,
  course_id: 1,
  // dir: "",
  spec_location: "",
  private: false,
  show_template_review: false,
  require_quiz: false,
  has_badge: false,
  staggered_deadline: false,
  is_calibrated: false,
  has_teams: false,
  max_team_size: 1,
  show_teammate_review: false,
  is_pair_programming: false,
  has_mentors: false,
  has_topics: false,
  review_topic_threshold: 0,
  maximum_number_of_reviews_per_submission: 0,
  review_strategy: "",
  review_rubric_varies_by_round: false,
  review_rubric_varies_by_topic: false,
  review_rubric_varies_by_role: false,
  has_max_review_limit: false,
  set_allowed_number_of_reviews_per_reviewer: 0,
  set_required_number_of_reviews_per_reviewer: 0,
  is_review_anonymous: false,
  is_review_done_by_teams: false,
  allow_self_reviews: false,
  reviews_visible_to_other_reviewers: false,
  number_of_review_rounds: 0,
  use_signup_deadline: false,
  use_drop_topic_deadline: false,
  use_team_formation_deadline: false,
  allow_tag_prompts: false,
  weights: [],
  notification_limits: [],
  use_date_updater: [],
  submission_allowed: [],
  review_allowed: [],
  teammate_allowed: [],
  metareview_allowed: [],
  reminder: [],
  // Add other assignment-specific initial values
};

const validationSchema = Yup.object({
  name: Yup.string().required("Required")
  // Add other assignment-specific validation rules
});

const AssignmentEditor = ({ mode }: { mode: "create" | "update" }) => {
  const { data: assignmentResponse, error: assignmentError, sendRequest } = useAPI();
  const { data: coursesResponse, error: coursesError, sendRequest: sendCoursesRequest } = useAPI();
  const { data: calibrationSubmissionsResponse, error: calibrationSubmissionsError, sendRequest: sendCalibrationSubmissionsRequest } = useAPI();
  const [courses, setCourses] = useState<any[]>([]);
  const [calibrationSubmissions, setCalibrationSubmissions] = useState<any[]>([]);
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const assignmentData: any = useLoaderData();

  // Merge backend-loaded assignment data with frontend defaults:
  // for any field that is null/undefined in assignmentData, fall back to initialValues.
  const getInitialValues = (): IAssignmentFormValues => {
    if (mode !== "update" || !assignmentData) {
      return initialValues;
    }

    const merged: any = { ...assignmentData };

    (Object.keys(initialValues) as (keyof IAssignmentFormValues)[]).forEach(
      (key) => {
        const value = merged[key];
        if (value === null || value === undefined) {
          merged[key] = initialValues[key];
        }
      }
    );

    return merged as IAssignmentFormValues;
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Close the modal if the assignment is updated successfully and navigate to the assignments page
  useEffect(() => {
    if (
      assignmentResponse &&
      assignmentResponse.status >= 200 &&
      assignmentResponse.status < 300
    ) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Assignment ${assignmentData.name} ${mode}d successfully!`,
        })
      );
      navigate(location.state?.from ? location.state.from : "/assignments");
    }
  }, [dispatch, mode, navigate, assignmentData, assignmentResponse, location.state?.from]);

  // Show the error message if the assignment is not updated successfully
  useEffect(() => {
    assignmentError && dispatch(alertActions.showAlert({ variant: "danger", message: assignmentError }));
  }, [assignmentError, dispatch]);

  // Load courses on component mount
  useEffect(() => {
    sendCoursesRequest({
      url: "/courses",
      method: HttpMethod.GET,
    });
  }, []);



  // Handle courses response
  useEffect(() => {
    if (coursesResponse && coursesResponse.status >= 200 && coursesResponse.status < 300) {
      setCourses(coursesResponse.data || []);
    }
  }, [coursesResponse]);


  // Show courses error message
  useEffect(() => {
    coursesError && dispatch(alertActions.showAlert({ variant: "danger", message: coursesError }));
  }, [coursesError, dispatch]);


  // Load calibration submissions on component mount
  useEffect(() => {
    // sendCalibrationSubmissionsRequest({
    //   url: `/calibration_submissions/get_instructor_calibration_submissions/${assignmentData.id}`,
    //   method: HttpMethod.GET,
    // });
    setCalibrationSubmissions([
      {
        id: 1,
        participant_name: "Participant 1",
        review_status: "not_started",
        submitted_content: { hyperlinks: ["https://www.google.com"], files: ["file1.txt", "file2.pdf"] },
      },
      {
        id: 2,
        participant_name: "Participant 2",
        review_status: "in_progress",
        submitted_content: { hyperlinks: ["https://www.google.com"], files: ["file1.txt", "file2.pdf"] },
      },
    ]);
  }, []);

  // Handle calibration submissions response
  useEffect(() => {
    if (calibrationSubmissionsResponse && calibrationSubmissionsResponse.status >= 200 && calibrationSubmissionsResponse.status < 300) {
      setCalibrationSubmissions(calibrationSubmissionsResponse.data || []);
    }
  }, [calibrationSubmissionsResponse]);

  // Show calibration submissions error message
  useEffect(() => {
    calibrationSubmissionsError && dispatch(alertActions.showAlert({ variant: "danger", message: calibrationSubmissionsError }));
  }, [calibrationSubmissionsError, dispatch]);


  const handleClose = () => navigate(location.state?.from ? location.state.from : "/assignments");

  return (
    <div style={{ padding: '30px' }}>
      {
        mode === "update" && <h1>Editing Assignment: {assignmentData.name}</h1>
      }
      {
        mode === "create" && <h1>Creating Assignment</h1>
      }


      <Formik
        initialValues={getInitialValues()}
        onSubmit={() => { }}
        validationSchema={validationSchema}
        validateOnChange={false}
      // enableReinitialize={true}
      >
        {(formik) => {
          const handleSave = () => {
            // Validate sum of weights = 100%
            const totalWeight = formik.values.weights?.reduce((acc: number, curr: number) => acc + curr, 0) || 0;
            if (totalWeight !== 100) {
              dispatch(alertActions.showAlert({ variant: "danger", message: "Sum of weights must be 100%" }));
              return;
            }

            let method: HttpMethod = HttpMethod.POST;
            let url: string = "/assignments";
            if (mode === "update") {
              url = `/assignments/${formik.values.id}`;
              method = HttpMethod.PATCH;
            }
            // to be used to display message when assignment is created
            assignmentData.name = formik.values.name;

            console.log("Sending assignment data:", formik.values);

            sendRequest({
              url: url,
              method: method,
              data: formik.values,
            });
          };


          return (
            <Form>
              <Tabs defaultActiveKey="general" id="assignment-tabs">
                {/* General Tab */}
                <Tab eventKey="general" title="General" >
                  <div style={{ width: '40%', marginTop: '20px' }}>
                    <div style={{ display: 'grid', alignItems: 'center', columnGap: '20px', gridTemplateColumns: 'max-content 1fr' }}>
                      <label className="form-label">Assignment name</label>
                      <FormInput controlId="assignment-name" label="" name="name" />
                      <label className="form-label">Course</label>
                      {courses && (
                        <FormSelect
                          controlId="assignment-course_id"
                          // label="Course"
                          name="course_id"
                          options={courses.map(course => ({
                            label: course.name,
                            value: course.id,
                          }))}
                        />
                      )}
                      <div style={{ display: 'flex', columnGap: '5px' }}>
                        <label className="form-label">Submission directory</label>
                        <ToolTip id={`assignment-directory_path-tooltip`} info="Mandatory field. No space or special chars. Directory name will be autogenerated if not provided, in the form of assignment_[assignment_id]." />
                      </div>
                      <FormInput controlId="assignment-directory_path" name="directory_path" />
                      <label className="form-label">Description URL</label>
                      <FormInput controlId="assignment-spec_location" name="spec_location" />
                    </div>

                  </div>
                  <FormCheckbox controlId="assignment-private" label="Private assignment" name="private" />

                  <FormCheckbox controlId="assignment-has_teams" label="Has teams?" name="has_teams" />
                  {formik.values.has_teams && (
                    <div style={{ paddingLeft: 30 }}>
                      <div style={{ display: 'flex', columnGap: '5px', alignItems: 'center' }}>
                        <label className="form-label">Max Team Size</label>
                        <div style={{ width: '100px' }}><FormInput controlId="assignment-max_team_size" name="max_team_size" type="number" /></div>
                      </div>
                      <FormCheckbox controlId="assignment-show_teammate_review" label="Show teammate reviews?" name="show_teammate_review" />
                      <FormCheckbox controlId="assignment-is_pair_programming" label="Pair Programming?" name="is_pair_programming" />
                    </div>
                  )}

                  <FormCheckbox controlId="assignment-has_mentors" label="Has mentors?" name="has_mentors" />
                  {formik.values.has_mentors && (
                    <div style={{ paddingLeft: 30 }}><FormCheckbox controlId="assignment-auto_assign_mentors" label="Auto-assign mentors when team hits > 50% capacity?" name="auto_assign_mentors" /></div>
                  )}

                  <FormCheckbox controlId="assignment-has_topics" label="Has topics?" name="has_topics" />
                  {formik.values.has_topics && (
                    <div style={{ paddingLeft: 30 }}><FormCheckbox controlId="assignment-staggered_deadline_assignment" label="Staggered deadline assignment?" name="staggered_deadline_assignment" /></div>
                  )}

                  <FormCheckbox controlId="assignment-has_quizzes" label="Has quizzes?" name="has_quizzes" />
                  <FormCheckbox controlId="assignment-calibration_for_training" label="Calibration for training?" name="calibration_for_training" />
                  <FormCheckbox controlId="assignment-allow_tag_prompts" label="Allow tag prompts so author can tag feedback comments?" name="allow_tag_prompts" />
                  <FormCheckbox controlId="assignment-available_to_students" label="Available to students?" name="available_to_students" />
                </Tab>

                {/* Topics Tab */}
                <Tab eventKey="topics" title="Topics">
                  <div style={{ fontSize: '1.5rem', color: '#333', marginTop: '20px', marginBottom: '20px' }}>Topics for {assignmentData.name}</div>
                  <FormCheckbox controlId="assignment-allow_topic_suggestions_from_students" label="Allow topic suggestions from students?" name="allow_topic_suggestion_from_students" />
                  <div style={{ display: 'flex' }}> <FormCheckbox controlId="assignment-enable_bidding_for_topics" label="Enable bidding for topics?" name="enable_bidding_for_topics" /><ToolTip id={`assignment-enable_bidding_for_topics-tooltip`} info="Enable bidding for topics. When enabled, students can bid on topics to work on. The topic with the highest bid will be assigned to the student." /></div>
                  <FormCheckbox controlId="assignment-enable_bidding_for_reviews" label="Enable bidding for reviews?" name="enable_bidding_for_reviews" />
                  <div style={{ display: 'flex' }}><FormCheckbox controlId="assignment-enable_authors_to_review_others" label="Enable authors to review others working on same topic?" name="enable_authors_to_review_other_topics" /> <ToolTip id={`assignment-enable_authors_to_review_others-tooltip`} info="Enable authors to review others working on same topic. When enabled, authors can review others working on same topic." /></div>
                  <FormCheckbox controlId="assignment-allow_reviewer_to_choose_topic_to_review" label="Allow reviewer to choose which topic to review?" name="allow_reviewer_to_choose_topic_to_review" />
                  <FormCheckbox controlId="assignment-allow_participants_to_create_bookmarks" label="Allow participants to create bookmarks?" name="allow_participants_to_create_bookmarks" />

                  {/* TODO: Add topics table here */}

                  <div className="d-flex justify-content-start gap-2" style={{ alignItems: 'center', marginTop: '20px' }}>
                    <a href="#" style={{ color: '#a4a366', textDecoration: 'none' }}>New topic</a> |
                    <a href="#" style={{ color: '#a4a366', textDecoration: 'none' }}>Import topics</a> |
                    <Button variant="outline-secondary">Delete selected topics</Button> |
                    <Button variant="outline-secondary">Delete all topics</Button> |
                    <a href="#" style={{ color: '#a4a366', textDecoration: 'none' }}>Back</a>
                  </div>
                </Tab>

                {/* Rubrics Tab */}
                <Tab eventKey="rubrics" title="Rubrics">
                  <div style={{ marginTop: '20px' }}></div>
                  <FormCheckbox controlId="assignment-review_rubric_varies_by_round" label="Review rubric varies by round?" name="review_rubric_varies_by_round" />
                  <FormCheckbox controlId="assignment-review_rubric_varies_by_topic" label="Review rubric varies by topic?" name="review_rubric_varies_by_topic" />
                  <FormCheckbox controlId="assignment-review_rubric_varies_by_role" label="Review rubric varies by role?" name="review_rubric_varies_by_role" />

                  <div style={{ marginTop: '20px', display: 'ruby' }}>
                    <Table
                      showColumnFilter={false}
                      showGlobalFilter={false}
                      showPagination={false}
                      data={[
                        ...Array.from({ length: formik.values.number_of_review_rounds ?? 0 }, (_, i) => ([
                          {
                            id: i,
                            title: `Review round ${i + 1}:`,
                            questionnaire: ['Sample 1', 'Sample 2', 'Sample 3'],
                            questionnaire_type: 'dropdown',
                          },
                          ...(formik.values.allow_tag_prompts ? [
                            {
                              id: i,
                              title: `Add tag prompts`,
                              questionnaire_type: 'tag_prompts',
                            },
                          ] : []),
                        ])).flat(),
                        {
                          id: formik.values.number_of_review_rounds ?? 0,
                          title: "Author feedback:",
                          questionnaire: ['Standard author feedback'],
                          questionnaire_type: 'dropdown',
                        },
                        ...(formik.values.allow_tag_prompts ? [
                          {
                            id: formik.values.number_of_review_rounds ?? 0,
                            title: "Add tag prompts",
                            questionnaire_type: 'tag_prompts',
                          },
                        ] : []),
                        {
                          id: (formik.values.number_of_review_rounds ?? 0) + 1,
                          title: "Teammate review:",
                          questionnaire: ['Review with Github metrics'],
                          questionnaire_type: 'dropdown',
                        },
                        ...(formik.values.allow_tag_prompts ? [
                          {
                            id: (formik.values.number_of_review_rounds ?? 0) + 1,
                            title: "Add tag prompts",
                            questionnaire_type: 'tag_prompts',
                          },
                        ] : []),
                      ]}
                      columns={[
                        {
                          cell: ({ row }) => <div style={{ marginRight: '10px' }}>{row.original.title}</div>,
                          accessorKey: "title", header: "", enableSorting: false, enableColumnFilter: false
                        },
                        {
                          cell: ({ row }) => <div style={{ marginRight: '10px' }}>{row.original.questionnaire_type === 'dropdown' &&
                            <FormSelect controlId={`assignment-questionnaire_${row.original.id}`} name="questionnaire"
                              options={row.original.questionnaire.map((questionnaire: string) => ({ label: questionnaire, value: questionnaire }))} />}
                            {row.original.questionnaire_type === 'tag_prompts' &&
                              <div style={{ marginBottom: '10px' }}><Button variant="outline-secondary">+Tag prompt+</Button>
                                <Button variant="outline-secondary">-Tag prompt-</Button></div>}</div>,
                          accessorKey: "questionnaire", header: "Rubrics", enableSorting: false, enableColumnFilter: false
                        },
                        {
                          cell: ({ row }) => <div style={{ marginRight: '10px' }}>{row.original.questionnaire_type === 'dropdown' &&
                            <><div style={{ width: '70px', display: 'flex', alignItems: 'center' }}><FormInput controlId={`assignment-weight_${row.original.id}`} name={`weights[${row.original.id}]`} type="number" />%</div></>}</div>,
                          accessorKey: `weights`, header: "Weight", enableSorting: false, enableColumnFilter: false
                        },
                        {
                          cell: ({ row }) => <>{row.original.questionnaire_type === 'dropdown' &&
                            <><div style={{ width: '70px', display: 'flex', alignItems: 'center' }}><FormInput controlId={`assignment-notification_limit_${row.original.id}`} name={`notification_limits[${row.original.id}]`} type="number" />%</div></>}</>,
                          accessorKey: "notification_limits",
                          header: () => (
                            <div style={{ display: 'flex', gap: "5px" }}>
                              Notification limit
                              <ToolTip id="notification-limit-info" info="Notify the instructor when at least two reviews differ by this amount." />
                            </div>
                          ),
                          enableSorting: false,
                          enableColumnFilter: false
                        },
                      ]}
                    />
                  </div>
                </Tab>

                {/* Review Strategy Tab */}
                <Tab eventKey="review_strategy" title="Review strategy">
                  <div style={{ marginTop: '20px' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', columnGap: '5px' }}> <label className="form-label">Review strategy:</label><ToolTip id="review-strategy-info" info="Review strategy to be used for this assignment." /></div>
                    <FormSelect
                      controlId="assignment-review_strategy"
                      name="review_strategy"
                      options={[
                        { label: "Review Strategy 1", value: 1 },
                        { label: "Review Strategy 2", value: 2 },
                        { label: "Review Strategy 3", value: 3 },
                      ]}
                    />
                  </div>
                  {formik.values.has_topics && (
                    <div style={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', columnGap: '5px' }}> <label className="form-label">Review topic threshold (k):</label><ToolTip id="review-topic-threshold-info" info="Review topic threshold to be used for this assignment." /></div>
                      <div style={{ width: '70px', display: 'flex', alignItems: 'center' }}>
                        <FormInput controlId="assignment-review_topic_threshold" name="review_topic_threshold" type="number" />
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'grid', alignItems: 'center', columnGap: '10px', gridTemplateColumns: 'max-content 1fr' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', columnGap: '5px' }}> <label className="form-label">Set required number of reviews per reviewer:</label><ToolTip id="set-required-number-of-reviews-per-reviewer-info" info="Each reviewer will be required to do this number of reviews." /></div>
                    <div style={{ width: '70px', display: 'flex', alignItems: 'center' }}>
                      <FormInput controlId="assignment-set_required_number_of_reviews_per_reviewer" name="set_required_number_of_reviews_per_reviewer" type="number" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', columnGap: '5px' }}> <label className="form-label">Set allowed number of reviews per reviewer:</label><ToolTip id="set-allowed-number-of-reviews-per-reviewer-info" info="Each reviewer will be allowed to do a maximum of this number of reviews (including extra credits)." /></div>
                    <div style={{ width: '70px', display: 'flex', alignItems: 'center' }}>
                      <FormInput controlId="assignment-set_allowed_number_of_reviews_per_reviewer" name="set_allowed_number_of_reviews_per_reviewer" type="number" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', columnGap: '5px' }}> <label className="form-label">Maximum number of reviews per submission:</label><ToolTip id="maximum-number-of-reviews-per-submission-info" info="Maximum number of reviews per submission to be used for this assignment." /></div>
                    <div style={{ width: '70px', display: 'flex', alignItems: 'center' }}>
                      <FormInput controlId="assignment-maximum_number_of_reviews_per_submission" name="maximum_number_of_reviews_per_submission" type="number" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', columnGap: '0px' }}> <FormCheckbox controlId="assignment-has_max_review_limit" label="Has max review limit?" name="has_max_review_limit" /><ToolTip id="has-max-review-limit-info" info="Has max review limit to be used for this assignment." /></div>
                    <div></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', columnGap: '0px' }}> <FormCheckbox controlId="assignment-is_review_anonymous" label="Is review anonymous?" name="is_review_anonymous" /><ToolTip id="is-review-anonymous-info" info="Is review anonymous to be used for this assignment." /></div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', columnGap: '0px' }}> <FormCheckbox controlId="assignment-is_review_done_by_teams" label="Is review done by teams?" name="is_review_done_by_teams" /><ToolTip id="is-review-done-by-teams-info" info="Is review done by teams to be used for this assignment." /></div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', columnGap: '0px' }}> <FormCheckbox controlId="assignment-allow_self_reviews" label="Allow self-reviews?" name="allow_self_reviews" /><ToolTip id="allow-self-reviews-info" info="Allow self-reviews to be used for this assignment." /></div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', columnGap: '0px' }}> <FormCheckbox controlId="assignment-reviews_visible_to_other_reviewers" label="Reviews visible to other reviewers?" name="reviews_visible_to_other_reviewers" /><ToolTip id="reviews-visible-to-other-reviewers-info" info="Reviews visible to other reviewers to be used for this assignment." /></div>

                </Tab>

                {/* Due dates Tab */}
                <Tab eventKey="due_dates" title="Due dates">
                  <div style={{ marginTop: '20px' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', columnGap: '10px', marginBottom: '10px' }}>
                    <label className="form-label">Number of review rounds:</label>
                    <div style={{ width: '70px', display: 'flex', alignItems: 'center', marginBottom: '-0.3rem' }}>
                      <FormInput controlId="assignment-number_of_review_rounds" name="number_of_review_rounds" type="number" />
                    </div>
                    <Button variant="outline-secondary">Set</Button>
                  </div>

                  <FormCheckbox controlId="assignment-use_signup_deadline" label="Use signup deadline" name="use_signup_deadline" />
                  <FormCheckbox controlId="assignment-use_drop_topic_deadline" label="Use drop-topic deadline" name="use_drop_topic_deadline" />
                  <FormCheckbox controlId="assignment-use_team_formation_deadline" label="Use team-formation deadline" name="use_team_formation_deadline" />

                  <Button variant="outline-secondary" style={{ marginTop: '10px', marginBottom: '10px' }}>Show/Hide date updater</Button>

                  {((formik.values.number_of_review_rounds && formik.values.number_of_review_rounds > 0) ||
                    formik.values.use_signup_deadline ||
                    formik.values.use_drop_topic_deadline ||
                    formik.values.use_team_formation_deadline) && (
                      <>
                        <div>
                          <div style={{ display: 'ruby', marginTop: '30px' }}>
                            <Table
                              showColumnFilter={false}
                              showGlobalFilter={false}
                              showPagination={false}
                              data={[
                                ...(formik.values.use_signup_deadline ? [
                                  {
                                    id: 'signup_deadline',
                                    deadline_type: "Signup deadline",
                                  },
                                ] : []),
                                ...(formik.values.use_drop_topic_deadline ? [
                                  {
                                    id: 'drop_topic_deadline',
                                    deadline_type: "Drop topic deadline",
                                  },
                                ] : []),
                                ...(formik.values.use_team_formation_deadline ? [
                                  {
                                    id: 'team_formation_deadline',
                                    deadline_type: "Team formation deadline",
                                  },
                                ] : []),
                                ...Array.from({ length: formik.values.number_of_review_rounds ?? 0 }, (_, i) => ([
                                  {
                                    id: 2 * i,
                                    deadline_type: `Round ${i + 1}: Submission`,
                                  },
                                  {
                                    id: 2 * i + 1,
                                    deadline_type: `Round ${i + 1}: Review`,
                                  },
                                ])).flat(),
                              ]}
                              columns={[
                                { accessorKey: "deadline_type", header: "Deadline type", enableSorting: false, enableColumnFilter: false },
                                {
                                  cell: ({ row }) => <><FormDatePicker controlId={`assignment-date_time_${row.original.id}`} name={`date_time[${row.original.id}]`} /></>,
                                  accessorKey: "date_time", header: "Date & Time", enableSorting: false, enableColumnFilter: false
                                },
                                {
                                  cell: ({ row }) => <><FormCheckbox controlId={`assignment-use_date_updater_${row.original.id}`} name={`use_date_updater[${row.original.id}]`} /></>,
                                  accessorKey: `use_date_updater`, header: () => (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', columnGap: '5px' }}>Use date updater?<ToolTip id="use-date-updater-info" info="Use date updater to be used for this assignment." /></div>
                                  ), enableSorting: false, enableColumnFilter: false
                                },
                                {
                                  cell: ({ row }) => <>
                                    <FormSelect controlId={`assignment-submission_allowed_${row.original.id}`} name={`submission_allowed[${row.original.id}]`} options={[
                                      { label: "Yes", value: "yes" },
                                      { label: "No", value: "no" },
                                    ]} />
                                  </>,
                                  accessorKey: "submission_allowed", header: "Submission allowed?", enableSorting: false, enableColumnFilter: false
                                },
                                {
                                  cell: ({ row }) => <>
                                    <FormSelect controlId={`assignment-submission_allowed_${row.original.id}`} name={`submission_allowed[${row.original.id}]`} options={[
                                      { label: "Yes", value: "yes" },
                                      { label: "No", value: "no" },
                                    ]} />
                                  </>,
                                  accessorKey: "review_allowed", header: "Review allowed?", enableSorting: false, enableColumnFilter: false
                                },
                                {
                                  cell: ({ row }) => <>
                                    <FormSelect controlId={`assignment-submission_allowed_${row.original.id}`} name={`submission_allowed[${row.original.id}]`} options={[
                                      { label: "Yes", value: "yes" },
                                      { label: "No", value: "no" },
                                    ]} />
                                  </>,
                                  accessorKey: "teammate_allowed", header: "Teammate review allowed?", enableSorting: false, enableColumnFilter: false
                                },
                                // {
                                //   cell: ({ row }) => <>
                                //     <FormSelect controlId={`assignment-submission_allowed_${row.original.id}`} name={`submission_allowed[${row.original.id}]`} options={[
                                //       { label: "Yes", value: "yes" },
                                //       { label: "No", value: "no" },
                                //     ]} />
                                //   </>,
                                //   accessorKey: "metareview_allowed", header: "Meta-review allowed?", enableSorting: false, enableColumnFilter: false
                                // },
                                {
                                  cell: ({ row }) => <>
                                    <FormSelect controlId={`assignment-submission_allowed_${row.original.id}`} name={`submission_allowed[${row.original.id}]`} options={[
                                      { label: "1", value: "1" },
                                      { label: "2", value: "2" },
                                      { label: "3", value: "3" },
                                      { label: "4", value: "4" },
                                      { label: "5", value: "5" },
                                      { label: "6", value: "6" },
                                      { label: "7", value: "7" },
                                      { label: "8", value: "8" },
                                      { label: "9", value: "9" },
                                      { label: "10", value: "10" },
                                    ]} /></>,
                                  accessorKey: "reminder", header: () => (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', columnGap: '5px' }}>Reminder (hrs):<ToolTip id="reminder-info" info="Each participant will be emailed a reminder this number of hours before the deadline." /></div>
                                  ), enableSorting: false, enableColumnFilter: false
                                },
                              ]}
                            />
                          </div>
                        </div>
                      </>
                    )}

                  <div style={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>
                    <FormCheckbox controlId={`assignment-apply_late_policy`} label="Apply late policy:" name="apply_late_policy" />
                    <div style={{ marginBottom: '-0.3rem' }}>
                      <FormSelect controlId={`assignment-late_policy_date_time`} name={`late_policy_date_time`} options={[
                        { label: "--None--", value: "none" },
                      ]} />
                    </div>
                    <Button variant="outline-secondary">New late policy</Button>
                  </div>


                </Tab>

                {/* Calibration Tab */}
                <Tab eventKey="calibration" title="Calibration">
                  <h3>Submit reviews for calibration</h3>
                  <div>
                    <div style={{ display: 'ruby', marginTop: '30px' }}>
                      <Table
                        showColumnFilter={false}
                        showGlobalFilter={false}
                        showPagination={false}
                        data={[
                          ...calibrationSubmissions.map((calibrationSubmission: any) => ({
                            id: calibrationSubmission.id,
                            participant_name: calibrationSubmission.participant_name,
                            review_status: calibrationSubmission.review_status,
                            submitted_content: calibrationSubmission.submitted_content,
                          })),
                        ]}
                        columns={[
                          {
                            accessorKey: "participant_name", header: "Participant name", enableSorting: false, enableColumnFilter: false
                          },
                          {
                            cell: ({ row }) => {
                              if (row.original.review_status === "not_started") {
                                return <a style={{ color: '#986633', textDecoration: 'none' }} href={`/assignments/edit/${assignmentData.id}/calibration/${row.original.id}`}>Begin</a>;
                              } else {
                                return <div style={{ display: 'flex', alignItems: 'center', columnGap: '5px' }}>
                                  <a style={{ color: '#986633', textDecoration: 'none' }} href={`/assignments/edit/${assignmentData.id}/calibration/${row.original.id}`}>View</a>
                                  |
                                  <a style={{ color: '#986633', textDecoration: 'none' }} href={`/assignments/edit/${assignmentData.id}/calibration/${row.original.id}`}>Edit</a>
                                </div>;
                              }
                            },
                            accessorKey: "action", header: "Action", enableSorting: false, enableColumnFilter: false
                          },
                          {
                            cell: ({ row }) => <>
                              <div>Hyperlinks:</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {
                                  row.original.submitted_content.hyperlinks.map((item: any, index: number) => {
                                    return <a style={{ color: '#986633', textDecoration: 'none' }} key={index} href={item}>{item}</a>;
                                  })
                                }
                              </div>
                              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column' }}>Files:</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {
                                  row.original.submitted_content.files.map((item: any, index: number) => {
                                    return <a style={{ color: '#986633', textDecoration: 'none' }} key={index} href={item}>{item}</a>;
                                  })
                                }
                              </div>
                            </>,
                            accessorKey: "submitted_content", header: "Submitted items(s)", enableSorting: false, enableColumnFilter: false
                          },
                        ]}
                      />
                    </div>
                  </div>
                </Tab>

                {/* Etc Tab */}
                <Tab eventKey="etc" title="Etc.">
                  <div className="assignment-actions d-flex flex-wrap justify-content-start">
                    <div className="custom-tab-button" onClick={() => navigate(`participants`)}>
                      <img src={'/assets/icons/add-participant-24.png'} alt="User Icon" className="icon" />
                      <span>Add Participant</span>
                    </div>
                    <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/createteams`)}>
                      <img src={'/assets/icons/create-teams-24.png'} alt="User Icon" className="icon" />
                      <span>Create Teams</span>
                    </div>
                    <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/assignreviewer`)}>
                      <img src={'/assets/icons/assign-reviewers-24.png'} alt="User Icon" className="icon" />
                      <span>Assign Reviewer</span>
                    </div>
                    <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewsubmissions`)}>
                      <img src={'/assets/icons/view-submissions-24.png'} alt="User Icon" className="icon" />
                      <span>View Submissions</span>
                    </div>
                    <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewscores`)}>
                      <img src={'/assets/icons/view-scores-24.png'} alt="User Icon" className="icon" />
                      <span>View Scores</span>
                    </div>
                    <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewreports`)}>
                      <img src={'/assets/icons/view-review-report-24.png'} alt="User Icon" className="icon" />
                      <span>View Reports</span>
                    </div>
                    <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewdelayedjobs`)}>
                      <img src={'/assets/icons/view-delayed-mailer.png'} alt="User Icon" className="icon" />
                      <span>View Delayed Jobs</span>
                    </div>
                  </div>
                </Tab>
              </Tabs>

              {/* Submit button */}
              <div className="mt-3 d-flex justify-content-start gap-2" style={{ alignItems: 'center' }}>
                <Button type="submit" variant="outline-secondary" onClick={handleSave}>
                  Save
                </Button> |
                <a href="/assignments" style={{ color: '#a4a366', textDecoration: 'none' }}>Back</a>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div >

  );

};

export default AssignmentEditor;
