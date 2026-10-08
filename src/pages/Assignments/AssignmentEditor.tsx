import * as Yup from "yup";

import { Button, Dropdown, Tab, Tabs } from "react-bootstrap";
import { Form, Formik, FormikHelpers, useFormikContext } from "formik";
import { IAssignmentFormValues, transformAssignmentRequest, REVIEW_STRATEGIES, REVIEW_STRATEGY_OPTIONS } from "./AssignmentUtil";
import RubricsContent, { QuestionnaireOption } from "./RubricsContent";
import { IEditor } from "../../utils/interfaces";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLoaderData, useLocation, useNavigate, useParams } from "react-router-dom";
import FormInput from "../../components/Form/FormInput";
import FormSelect from "../../components/Form/FormSelect";
import { HttpMethod } from "../../utils/httpMethods";
import { alertActions } from "../../store/slices/alertSlice";
import useAPI from "../../hooks/useAPI";
import FormCheckbox from "../../components/Form/FormCheckBox";
import '../../custom.scss';
import Table from "../../components/Table/Table";
import FormDatePicker from "../../components/Form/FormDatePicker";
import ToolTip from "../../components/ToolTip";
import EtcTab from './tabs/EtcTab';
import axiosClient from "../../utils/axios_client";
import TopicsTab from "./tabs/TopicsTab";
import DutyEditor from "pages/Duties/DutyEditor";

interface TopicSettings {
  allowTopicSuggestions: boolean;
  enableBidding: boolean;
  enableAuthorsReview: boolean;
  allowReviewerChoice: boolean;
  allowBiddingForReviewers: boolean;
  allowAdvertiseForPartners: boolean;
  allowBookmarks: boolean;
}

interface TopicData {
  id: string;
  databaseId: number;
  name: string;
  url?: string;
  description?: string;
  category?: string;
  assignedTeams: any[];
  waitlistedTeams: any[];
  questionnaire: string;
  numSlots: number;
  availableSlots: number;
  bookmarks: any[];
  partnerAd?: any;
  createdAt?: string;
  updatedAt?: string;
}

/** Syncs instructor_grade_min_score and instructor_grade_max_score from the selected
 *  questionnaire's own min/max when they haven't been set yet, so the grade scale
 *  defaults to the rubric's range without the instructor needing to type it manually. */
const GradeScaleSync: React.FC<{ questionnaires: any[] }> = ({ questionnaires }) => {
  const { values, setFieldValue } = useFormikContext<IAssignmentFormValues>();
  useEffect(() => {
    const qid = (values as any).questionnaire_round_1;
    if (!qid) return;
    const q = questionnaires.find((x: any) => x.id === qid);
    if (!q) return;
    if (values.instructor_grade_min_score == null) {
      setFieldValue('instructor_grade_min_score', q.min_question_score);
    }
    if (values.instructor_grade_max_score == null) {
      setFieldValue('instructor_grade_max_score', q.max_question_score);
    }
  }, [(values as any).questionnaire_round_1]);
  return null;
};

const GradeOutOfBoundsChecker: React.FC<{ assignmentId: string | null }> = ({ assignmentId }) => {
  const { values, initialValues: formInitialValues } = useFormikContext<IAssignmentFormValues>();
  const [conflictCount, setConflictCount] = useState<number | null>(null);

  useEffect(() => {
    if (!assignmentId) return;
    const newMin = values.instructor_grade_min_score;
    const newMax = values.instructor_grade_max_score;
    const origMin = (formInitialValues as any).instructor_grade_min_score;
    const origMax = (formInitialValues as any).instructor_grade_max_score;
    if (newMin === origMin && newMax === origMax) { setConflictCount(null); return; }

    const timer = setTimeout(async () => {
      const params = new URLSearchParams();
      if (newMin != null) params.append("min", String(newMin));
      if (newMax != null) params.append("max", String(newMax));
      try {
        const { data } = await axiosClient.get(`/assignments/${assignmentId}/review_grades_out_of_bounds?${params}`);
        setConflictCount(data.conflict_count ?? 0);
      } catch {
        setConflictCount(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [values.instructor_grade_min_score, values.instructor_grade_max_score, assignmentId]);

  if (!conflictCount) return null;

  return (
    <div className="alert alert-warning mt-3" role="alert">
      <strong>Warning:</strong> {conflictCount} reviewer{conflictCount > 1 ? "s have" : " has"} already been assigned a grade outside the new scale. Those grades will remain as-is if you save.
    </div>
  );
};

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
  // Topic settings
  allow_topic_suggestion_from_students: false,
  topics_assigned_by_bidding: false,
  can_review_same_topic: false,
  allow_reviewer_to_choose_topic_to_review: false,
  enable_bidding_for_reviews: false,
  date_time: {} as Record<string | number, Date | null>,
  weights: [],
  notification_limits: [],
  submission_allowed: {} as Record<string | number, string>,
  review_allowed: {} as Record<string | number, string>,
  teammate_allowed: {} as Record<string | number, string>,
  // Rubrics
};

const validationSchema = Yup.object({
  name: Yup.string().required("Required"),
});

const AssignmentEditor: React.FC<IEditor> = ({ mode }) => {
  const { data: assignmentResponse, error: assignmentError, sendRequest } = useAPI();
  const { data: coursesResponse, error: coursesError, sendRequest: sendCoursesRequest } = useAPI();
  const { data: calibrationSubmissionsResponse, error: calibrationSubmissionsError, sendRequest: sendCalibrationSubmissionsRequest } = useAPI();
  const [courses, setCourses] = useState<any[]>([]);
  const [calibrationSubmissions, setCalibrationSubmissions] = useState<any[]>([]);

  const { data: topicsResponse, error: topicsApiError, sendRequest: fetchTopics } = useAPI();
  const { data: updateResponse, error: updateError, sendRequest: updateAssignment } = useAPI();
  const { data: deleteResponse, error: deleteError, sendRequest: deleteTopic } = useAPI();
  const { data: createResponse, error: createError, sendRequest: createTopic } = useAPI();
  const { data: updateTopicResponse, error: updateTopicError, sendRequest: updateTopic } = useAPI();
  const { data: dropTeamResponse, error: dropTeamError, sendRequest: dropTeamRequest } = useAPI();
  const { data: accessibleDutiesResponse, error: accessibleDutiesError, sendRequest: fetchAccessibleDuties } = useAPI();
  const { data: assignmentDutiesResponse, error: assignmentDutiesError, sendRequest: fetchAssignmentDuties } = useAPI();
  const { error: addAssignmentDutyError, sendRequest: addAssignmentDuty } = useAPI();
  const { error: removeAssignmentDutyError, sendRequest: removeAssignmentDuty } = useAPI();

 

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
  const { id } = useParams<{ id: string }>();
  const [assignmentName, setAssignmentName] = useState("");
  const submittedNameRef = useRef<string>("");
  const [showDutyEditor, setShowDutyEditor] = useState(false);
  const [accessibleDuties, setAccessibleDuties] = useState<any[]>([]);
  const [assignmentDuties, setAssignmentDuties] = useState<any[]>([]);
  const [selectedDutyIds, setSelectedDutyIds] = useState<number[]>([]);
  const [roleBasedLocalError, setRoleBasedLocalError] = useState<string | null>(null);
  const [topicsData, setTopicsData] = useState<TopicData[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  useEffect(() => {
    if (assignmentResponse?.data) {
      setAssignmentName(assignmentResponse.data.name || "");
    }
  }, [assignmentResponse]);

  useEffect(() => {
    if (accessibleDutiesError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: accessibleDutiesError }));
    }
  }, [accessibleDutiesError, dispatch]);

  useEffect(() => {
    if (assignmentDutiesError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: assignmentDutiesError }));
    }
  }, [assignmentDutiesError, dispatch]);

  useEffect(() => {
    if (addAssignmentDutyError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: addAssignmentDutyError }));
    }
  }, [addAssignmentDutyError, dispatch]);

  useEffect(() => {
    if (removeAssignmentDutyError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: removeAssignmentDutyError }));
    }
  }, [removeAssignmentDutyError, dispatch]);

  useEffect(() => {
    if (updateResponse) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Assignment saved successfully" }));
    }
  }, [updateResponse, dispatch]);

  useEffect(() => {
    if (updateError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: updateError }));
    }
  }, [updateError, dispatch]);

  useEffect(() => {
    if (deleteResponse) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Topic deleted successfully" }));
      // Refresh topics data
      if (id) {
        fetchTopics({ url: `/project_topics?assignment_id=${id}` });
      }
    }
  }, [deleteResponse, dispatch, id, fetchTopics]);

  useEffect(() => {
    if (deleteError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: deleteError }));
    }
  }, [deleteError, dispatch]);

  useEffect(() => {
    if (createResponse) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Topic created successfully" }));
      // Refresh topics data
      if (id) {
        fetchTopics({ url: `/project_topics?assignment_id=${id}` });
      }
    }
  }, [createResponse, dispatch, id, fetchTopics]);

  useEffect(() => {
    if (createError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: createError }));
    }
  }, [createError, dispatch]);

  useEffect(() => {
    if (updateTopicResponse) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Topic updated successfully" }));
      // Refresh topics data
      if (id) {
        fetchTopics({ url: `/project_topics?assignment_id=${id}` });
      }
    }
  }, [updateTopicResponse, dispatch, id, fetchTopics]);

  useEffect(() => {
    if (updateTopicError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: updateTopicError }));
    }
  }, [updateTopicError, dispatch]);

  useEffect(() => {
    if (dropTeamResponse) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Team removed from topic successfully" }));
      if (id) {
        fetchTopics({ url: `/project_topics?assignment_id=${id}` });
      }
    }
  }, [dropTeamResponse, dispatch, id, fetchTopics]);

  useEffect(() => {
    if (dropTeamError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: dropTeamError }));
    }
  }, [dropTeamError, dispatch]);

  // Load topics for this assignment
    useEffect(() => {
      if (id) {
        setTopicsLoading(true);
        setTopicsError(null);
        fetchTopics({ url: `/project_topics?assignment_id=${id}` });
      }
    }, [id, fetchTopics]);

  const refreshAccessibleDuties = useCallback(() => {
    fetchAccessibleDuties({ url: `/duties/accessible_duties` });
  }, [fetchAccessibleDuties]);

  const refreshAssignmentDuties = useCallback(() => {
    if (!id) return;
    fetchAssignmentDuties({ url: `/assignments/${id}/duties` });
  }, [fetchAssignmentDuties, id]);

  useEffect(() => {
    if (id) {
      refreshAccessibleDuties();
      refreshAssignmentDuties();
    }
  }, [id, refreshAccessibleDuties, refreshAssignmentDuties]);

  useEffect(() => {
    if (accessibleDutiesResponse?.data) {
      setAccessibleDuties(accessibleDutiesResponse.data || []);
    }
  }, [accessibleDutiesResponse]);

  useEffect(() => {
    if (assignmentDutiesResponse?.data) {
      setAssignmentDuties(assignmentDutiesResponse.data || []);
    }
  }, [assignmentDutiesResponse]);

     // Process topics response
      useEffect(() => {
        if (topicsResponse?.data) {
          const transformedTopics: TopicData[] = (topicsResponse.data || []).map((topic: any) => ({
            id: topic.topic_identifier?.toString?.() || topic.topic_identifier || topic.id?.toString?.() || String(topic.id),
            databaseId: Number(topic.id),
            name: topic.topic_name,
            url: topic.link,
            description: topic.description,
            category: topic.category,
            assignedTeams: topic.confirmed_teams || [],
            waitlistedTeams: topic.waitlisted_teams || [],
            questionnaire: "Default rubric",
            numSlots: topic.max_choosers,
            availableSlots: topic.available_slots || 0,
            partnerAd: undefined,
            createdAt: topic.created_at,
            updatedAt: topic.updated_at,
          }));
          setTopicsData(transformedTopics);
          setTopicsLoading(false);
        }
      }, [topicsResponse]);
    
      // Handle topics API errors
  useEffect(() => {
    if (topicsApiError) {
      setTopicsError(topicsApiError);
      setTopicsLoading(false);
    }
  }, [topicsApiError]);

  const toggleDutySelection = useCallback((dutyId: number) => {
    setSelectedDutyIds((prev) =>
      prev.includes(dutyId) ? prev.filter((id) => id !== dutyId) : [...prev, dutyId]
    );
  }, []);

  const handleAddSelectedDuties = useCallback(async () => {
    if (!id) return;
    if (selectedDutyIds.length === 0) {
      setRoleBasedLocalError("Select at least one duty to add.");
      return;
    }
    setRoleBasedLocalError(null);
    await Promise.all(
      selectedDutyIds.map((dutyId) =>
        addAssignmentDuty({
          url: `/assignments/${id}/duties`,
          method: "POST",
          data: { duty_id: dutyId },
        })
      )
    );
    setSelectedDutyIds([]);
    refreshAssignmentDuties();
  }, [addAssignmentDuty, id, refreshAssignmentDuties, selectedDutyIds]);

  const handleRemoveDuty = useCallback(
    async (dutyId: number) => {
      if (!id) return;
      await removeAssignmentDuty({
        url: `/assignments/${id}/duties/${dutyId}`,
        method: "DELETE",
      });
      refreshAssignmentDuties();
    },
    [id, refreshAssignmentDuties, removeAssignmentDuty]
  );
    

        const handleDropTeam = useCallback((topicId: string, teamId: string) => {
          if (!topicId || !teamId) return;
          dropTeamRequest({
            url: `/signed_up_teams/drop_team_from_topic`,
            method: 'DELETE',
            params: {
              topic_id: topicId,
              team_id: teamId,
            },
          });
        }, [dropTeamRequest]);
      
        const handleDeleteTopic = useCallback((topicIdentifier: string) => {
          if (id) {
            deleteTopic({
              url: `/project_topics`,
              method: 'DELETE',
              params: {
                assignment_id: Number(id),
                'topic_ids[]': [topicIdentifier]
              }
            });
          }
        }, [id, deleteTopic]);
      
        const handleEditTopic = useCallback((dbId: string, updatedData: any) => {
          updateTopic({
            url: `/project_topics/${dbId}`,
            method: 'PATCH',
            data: {
              project_topic: {
                topic_identifier: updatedData.topic_identifier,
                topic_name: updatedData.topic_name,
                category: updatedData.category,
                max_choosers: updatedData.max_choosers,
                assignment_id: id,
                description: updatedData.description,
                link: updatedData.link
              }
            }
          });
        }, [id, updateTopic]);
      
        const handleCreateTopic = useCallback((topicData: any) => {
          if (id) {
            createTopic({
              url: `/project_topics`,
              method: 'POST',
              data: {
                project_topic: {
                  topic_identifier: topicData.topic_identifier || topicData.id,
                  topic_name: topicData.topic_name || topicData.name,
                  category: topicData.category,
                  max_choosers: topicData.max_choosers ?? topicData.numSlots,
                  assignment_id: id,
                  description: topicData.description,
                  link: topicData.link
                },
                micropayment: topicData.micropayment ?? 0
              }
            });
          }
        }, [id, createTopic]);
      
        const handleApplyPartnerAd = useCallback((_topicId: string, _applicationText: string) => {
          // TODO: Implement partner ad application logic
        }, []);
      


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
          message: `Assignment ${submittedNameRef.current} ${mode}d successfully!`,
        })
      );
      navigate(location.state?.from ? location.state.from : "/courses");
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

  // Load instructor calibration reviews for this assignment
  useEffect(() => {
    if (id) {
      sendCalibrationSubmissionsRequest({
        url: `/assignments/${id}/calibration_submissions`,
        method: HttpMethod.GET,
      });
    }
  }, [id]);

  useEffect(() => {
    if (calibrationSubmissionsResponse && calibrationSubmissionsResponse.status >= 200 && calibrationSubmissionsResponse.status < 300) {
      setCalibrationSubmissions(calibrationSubmissionsResponse.data || []);
    }
  }, [calibrationSubmissionsResponse]);

  useEffect(() => {
    if (calibrationSubmissionsError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: calibrationSubmissionsError }));
    }
  }, [calibrationSubmissionsError, dispatch]);


  const onSubmit = (
    values: IAssignmentFormValues,
    submitProps: FormikHelpers<IAssignmentFormValues>
  ) => {
    if (values.is_role_based && id && assignmentDuties.length === 0) {
      dispatch(alertActions.showAlert({ variant: "danger", message: "Please add at least one duty when role-based reviews are enabled." }));
      return;
    }

    // validate sum of weights = 100% (only when at least one weight is non-zero)
    const totalWeight = values.weights?.reduce((acc: number, curr: number) => acc + curr, 0) ?? 0;
    const hasNonZeroWeights = values.weights?.some((w: number) => w !== 0) ?? false;
    if (hasNonZeroWeights && totalWeight !== 100) {
      dispatch(alertActions.showAlert({ variant: "danger", message: "Sum of weights must be 100%" }));
      return;
    }

    let method: HttpMethod = HttpMethod.POST;
    let url: string = "/assignments";
    if (mode === "update") {
      url = `/assignments/${values.id}`;
      method = HttpMethod.PATCH;
    }
    submittedNameRef.current = values.name;
    sendRequest({ url, method, data: values, transformRequest: transformAssignmentRequest });
    submitProps.setSubmitting(false);
  };

  const handleClose = () => navigate(location.state?.from ? location.state.from : "/courses");

  // Build QuestionnaireOption list for RubricsContent
  const questionnaireOptions: QuestionnaireOption[] = (assignmentData.questionnaires || []).map((q: any) => ({
    id: q.id,
    name: q.name,
    questionnaire_type: q.questionnaire_type,
  }));

  // Build initial form values from existing assignment data (update) or defaults (create)
  const formInitialValues: IAssignmentFormValues & Record<string, any> = {
    ...getInitialValues(),
  };






  return (
    <div style={{ padding: '30px', paddingTop: '1.5rem' }}>
      {
        mode === "update" && <h1 className="text-dark mb-4" style={{ fontSize: "2rem", fontWeight: "600" }}>Editing Assignment: {assignmentData.name}</h1>
      }
      {
        mode === "create" && <h1 className="text-dark mb-4" style={{ fontSize: "2rem", fontWeight: "600" }}>Creating Assignment</h1>
      }
      <Formik
        initialValues={formInitialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        validateOnChange={false}
        enableReinitialize={true}
      >
        {(formik) => {
        return (
          <Form>
            <GradeScaleSync questionnaires={assignmentData.questionnaires || []} />
            <Tabs defaultActiveKey="general" id="assignment-tabs">
              {/* General Tab */}
              <Tab eventKey="general" title="General" >
                <div style={{ width: '40%', marginTop: '20px' }}>
                  <div style={{ display: 'grid', alignItems: 'center', columnGap: '20px', gridTemplateColumns: 'max-content 1fr' }}>
                    <label className="form-label">Assignment Name</label>
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
                      <label className="form-label">Submission Directory</label>
                      <ToolTip id={`assignment-directory_path-tooltip`} info="Mandatory field. No space or special chars. Directory name will be autogenerated if not provided, in the form of assignment_[assignment_id]." />
                    </div>
                    <FormInput controlId="assignment-directory_path" name="directory_path" />
                    <label className="form-label">Description URL</label>
                    <FormInput controlId="assignment-spec_location" name="spec_location" />
                  </div>

                </div>
                <FormCheckbox controlId="assignment-private" label="Private Assignment" name="private" />

                <FormCheckbox controlId="assignment-has_teams" label="Has teams?" name="has_teams" />
                {formik.values.has_teams && (
                  <div style={{ paddingLeft: 30 }}>
                    <div style={{ display: 'flex', columnGap: '5px', alignItems: 'center' }}>
                      <label className="form-label">Max Team Size</label>
                      <div style={{ width: '100px' }}><FormInput controlId="assignment-max_team_size" name="max_team_size" type="number" /></div>
                      <ToolTip id="max-team-size" info="Maximum number of members on a team" />
                    </div>
                    <FormCheckbox controlId="assignment-has_mentors" label="Has mentors?" name="has_mentors" />
                    {formik.values.has_mentors && (
                      <div style={{ paddingLeft: 30 }}>
                        <FormCheckbox controlId="assignment-auto_assign_mentors" label="Auto-assign mentors when team hits > 50% capacity?" name="auto_assign_mentors" />
                      </div>
                    )}
                  </div>
                )}

                <FormCheckbox controlId="assignment-has_topics" label="Has topics?" name="has_topics" />
                {formik.values.has_topics && (
                  <div style={{ paddingLeft: 30 }}><FormCheckbox controlId="assignment-staggered_deadline" label="Staggered deadline assignment?" name="staggered_deadline" /></div>
                )}

                <FormCheckbox controlId="assignment-allow_tag_prompts" label="Allow tag prompts so author can tag feedback comments?" name="allow_tag_prompts" />
                <FormCheckbox controlId="assignment-available_to_students" label="Available to students?" name="available_to_students" />
              </Tab>

              {/* Topics Tab — only shown when has_topics is enabled */}
              {formik.values.has_topics && (
                <Tab eventKey="topics" title="Topics">
                  <TopicsTab
                    assignmentName={assignmentName}
                    assignmentId={id!}
                    topicSettings={{
                      allowTopicSuggestions: formik.values.allow_topic_suggestion_from_students ?? false,
                      enableBidding: formik.values.topics_assigned_by_bidding ?? false,
                      enableAuthorsReview: formik.values.can_review_same_topic ?? false,
                      allowReviewerChoice: formik.values.allow_reviewer_to_choose_topic_to_review ?? false,
                      allowBiddingForReviewers: formik.values.enable_bidding_for_reviews ?? false,
                      allowAdvertiseForPartners: false,
                      allowBookmarks: false,
                    }}
                    topicsData={topicsData}
                    topicsLoading={topicsLoading}
                    topicsError={topicsError}
                    onTopicSettingChange={(setting, value) => {
                      const fieldMap: Record<string, string> = {
                        allowTopicSuggestions: 'allow_topic_suggestion_from_students',
                        enableBidding: 'topics_assigned_by_bidding',
                        enableAuthorsReview: 'can_review_same_topic',
                        allowReviewerChoice: 'allow_reviewer_to_choose_topic_to_review',
                        allowBiddingForReviewers: 'enable_bidding_for_reviews',
                      };
                      const formikField = fieldMap[setting];
                      if (formikField) formik.setFieldValue(formikField, value);
                    }}
                    onDropTeam={handleDropTeam}
                    onDeleteTopic={handleDeleteTopic}
                    onEditTopic={handleEditTopic}
                    onCreateTopic={handleCreateTopic}
                    onApplyPartnerAd={handleApplyPartnerAd}
                    onTopicsChanged={() => id && fetchTopics({ url: `/project_topics?assignment_id=${id}` })}
                  />
                </Tab>
              )}

              {/* Rubrics Tab */}
              <Tab eventKey="rubrics" title="Rubrics">
                <RubricsContent questionnaires={questionnaireOptions} />
              </Tab>

              {/* Review Strategy Tab */}
              <Tab eventKey="review_strategy" title="Review strategy">
                <div className="mt-4" style={{ maxWidth: 640 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", alignItems: "center", columnGap: 16, rowGap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <label className="form-label mb-0">Review strategy:</label>
                      <ToolTip id="review-strategy" info="Static: each reviewer is pre-assigned a set of submissions to review. Dynamic: a reviewer selects a submission before beginning a review." />
                    </div>
                    <div style={{ width: "fit-content" }}>
                      <FormSelect
                        controlId="assignment-review_strategy"
                        name="review_strategy"
                        options={REVIEW_STRATEGY_OPTIONS}
                      />
                    </div>

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FormCheckbox controlId="assignment-is_review_anonymous" label="Is review anonymous?" name="is_review_anonymous" />
                      <ToolTip id="is-review-anonymous" info="The submitter cannot see who reviewed their submission." />
                    </div>
                    {formik.values.has_teams && (
                      <>
                        <FormCheckbox controlId="assignment-is_review_done_by_teams" label="Is review done by teams?" name="is_review_done_by_teams" />
                        <FormCheckbox controlId="assignment-is_role_based" label="Is role based?" name="is_role_based" />
                      </>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FormCheckbox controlId="assignment-allow_self_reviews" label="Self-reviews required?" name="allow_self_reviews" />
                      <ToolTip id="allow-self-reviews" info="When enabled, reviewers are required to review their own submission." />
                    </div>
                  </div>

                  {/* Instructor grade scale — auto-populated from questionnaire 1, editable by instructor */}
                  <GradeOutOfBoundsChecker assignmentId={id ?? null} />
                  <div className="mt-3" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label className="form-label mb-0">Instructor grade scale:</label>
                    <label className="form-label mb-0">Min:</label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: 80 }}
                      value={formik.values.instructor_grade_min_score ?? ''}
                      onChange={(e) => formik.setFieldValue('instructor_grade_min_score', e.target.value === '' ? null : Number(e.target.value))}
                    />
                    <label className="form-label mb-0">Max:</label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: 80 }}
                      value={formik.values.instructor_grade_max_score ?? ''}
                      onChange={(e) => formik.setFieldValue('instructor_grade_max_score', e.target.value === '' ? null : Number(e.target.value))}
                    />
                  </div>
                {formik.values.is_role_based && (
                  <div className="mt-3" style={{ paddingLeft: 30, maxWidth: '520px' }}>
                    {!id && (
                      <div className="alert alert-warning" role="alert">
                        Save the assignment before adding duties.
                      </div>
                    )}
                    {roleBasedLocalError && (
                      <div className="alert alert-danger" role="alert">
                        {roleBasedLocalError}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>Select roles(duties):</label>
                      <Button
                        variant="outline-success"
                        onClick={() => setShowDutyEditor(true)}
                        disabled={!id}
                      >
                        +
                      </Button>
                    </div>
                    <div style={{ maxHeight: '180px', overflow: 'auto', border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}>
                      {(accessibleDuties || []).length === 0 && (
                        <div className="text-muted">No duties available.</div>
                      )}
                      {(() => {
                        const assignedIds = new Set((assignmentDuties || []).map((d: any) => d.id));
                        return (accessibleDuties || []).map((duty: any) => {
                          const isAssigned = assignedIds.has(duty.id);
                          return (
                            <div key={duty.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="checkbox"
                                checked={selectedDutyIds.includes(duty.id)}
                                onChange={() => toggleDutySelection(duty.id)}
                                disabled={isAssigned || !id}
                              />
                              <span>{duty.name}</span>
                              {isAssigned && <span className="text-muted">(added)</span>}
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <Button
                        variant="outline-success"
                        onClick={handleAddSelectedDuties}
                        disabled={!id}
                      >
                        Add
                      </Button>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <label className="form-label">Assigned roles(duties):</label>
                      {(assignmentDuties || []).length === 0 ? (
                        <div className="text-muted">No duties assigned yet.</div>
                      ) : (
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th style={{ width: '80px' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(assignmentDuties || []).map((duty: any) => (
                              <tr key={duty.id}>
                                <td>{duty.name}</td>
                                <td>
                                  <Button variant="link" onClick={() => handleRemoveDuty(duty.id)} aria-label="Delete Duty" className="p-0" disabled={!id}>
                                    <img src={"/assets/images/delete-icon-24.png"} alt="Delete" style={{ width: 25, height: 20 }} />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
                </div>{/* end mt-4 wrapper */}
              </Tab>

              {/* Due dates Tab */}
              <Tab eventKey="due_dates" title="Due dates">
                <div style={{ marginTop: '20px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', columnGap: '10px', marginBottom: '10px' }}>
                  <label className="form-label">Number of review rounds:</label>
                  <div style={{ width: '70px', display: 'flex', alignItems: 'center', marginBottom: '-0.3rem' }}>
                    <FormInput controlId="assignment-number_of_review_rounds" name="number_of_review_rounds" type="number" />
                  </div>
                </div>

                <FormCheckbox controlId="assignment-use_signup_deadline" label="Use signup deadline" name="use_signup_deadline" />
                {formik.values.has_topics && <FormCheckbox controlId="assignment-use_drop_topic_deadline" label="Use drop-topic deadline" name="use_drop_topic_deadline" />}
                {formik.values.has_teams && <FormCheckbox controlId="assignment-use_team_formation_deadline" label="Use team-formation deadline" name="use_team_formation_deadline" />}

                <div>
                  <div style={{ marginTop: '30px', width: '75%' }}>
                    <Table
                      showColumnFilter={false}
                      showGlobalFilter={false}
                      showPagination={false}
                      getRowId={(row) => String(row.id)}
                      data={[
                        ...Array.from({ length: formik.values.number_of_review_rounds ?? 0 }, (_, i) => ([
                          {
                            id: 2 * i,
                            deadline_type: `Review ${i + 1}: Submission`,
                          },
                          {
                            id: 2 * i + 1,
                            deadline_type: `Review ${i + 1}: Review`,
                          },
                        ])).flat(),
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
                      ]}
                      columns={[
                        { accessorKey: "deadline_type", header: "Deadline type", enableSorting: false, enableColumnFilter: false },
                        {
                          cell: ({ row }) => (
                            <>
                              <FormDatePicker
                                controlId={`assignment-date_time_${row.original.id}`}
                                name={`date_time.${row.original.id}`}
                              />
                            </>
                          ),
                          accessorKey: "date_time", header: "Date & Time", enableSorting: false, enableColumnFilter: false
                        },
                        {
                          cell: ({ row }) => <>
                            <FormSelect controlId={`assignment-submission_allowed_${row.original.id}`} name={`submission_allowed[${row.original.id}]`} options={[
                              { label: "Yes", value: "3" },
                              { label: "Late", value: "2" },
                              { label: "No", value: "1" },
                            ]} />
                          </>,
                          accessorKey: "submission_allowed", header: "Submission allowed?", enableSorting: false, enableColumnFilter: false
                        },
                        {
                          cell: ({ row }) => <>
                            <FormSelect controlId={`assignment-review_allowed_${row.original.id}`} name={`review_allowed[${row.original.id}]`} options={[
                              { label: "Yes", value: "3" },
                              { label: "Late", value: "2" },
                              { label: "No", value: "1" },
                            ]} />
                          </>,
                          accessorKey: "review_allowed", header: "Review allowed?", enableSorting: false, enableColumnFilter: false
                        },
                        {
                          cell: ({ row }) => <>
                            <FormSelect controlId={`assignment-teammate_allowed_${row.original.id}`} name={`teammate_allowed[${row.original.id}]`} options={[
                              { label: "Yes", value: "3" },
                              { label: "Late", value: "2" },
                              { label: "No", value: "1" },
                            ]} />
                          </>,
                          accessorKey: "teammate_allowed", header: "Teammate allowed?", enableSorting: false, enableColumnFilter: false
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="mt-3 d-flex align-items-center" style={{ columnGap: 10 }}>
                  <FormCheckbox controlId="assignment-apply_late_policy" label="Apply late policy:" name="apply_late_policy" />
                  <FormSelect controlId="assignment-late_policy_id" name="late_policy_id" options={[{ label: "-- None --", value: 0 }]} />
                </div>


              </Tab>

              {/* Calibration Tab */}
                <Tab eventKey="calibration" title="Calibration">

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
                      <span>Add Participants</span>
                    </div>
                    <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/createteams`)}>
                      <img src={'/assets/icons/create-teams-24.png'} alt="User Icon" className="icon" />
                      <span>Create Teams</span>
                    </div>
                    <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/assignreviewer`)}>
                      <img src={'/assets/icons/assign-reviewers-24.png'} alt="User Icon" className="icon" />
                      <span>Assign Reviewers</span>
                    </div>
                    <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewsubmissions`)}>
                      <img src={'/assets/icons/view-submissions-24.png'} alt="User Icon" className="icon" />
                      <span>View Submissions</span>
                    </div>
                    <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewscores`)}>
                      <img src={'/assets/icons/view-scores-24.png'} alt="User Icon" className="icon" />
                      <span>View Scores</span>
                    </div>
                    <Dropdown className="custom-tab-button" style={{ padding: 0 }}>
                      <Dropdown.Toggle as="div" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", cursor: "pointer" }} id="view-reports-dropdown">
                        <img src={'/assets/icons/view-review-report-24.png'} alt="User Icon" className="icon" />
                        <span>View Reports</span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => navigate(`/assignments/${assignmentData.id}/review`)}>
                          Review Report
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => navigate(`/assignments/${assignmentData.id}/teammate-review`)}>
                          Teammate Review Report
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    <div className="custom-tab-button" onClick={() => navigate(`/assignments/edit/${assignmentData.id}/viewdelayedjobs`)}>
                      <img src={'/assets/icons/view-delayed-mailer.png'} alt="User Icon" className="icon" />
                      <span>View Delayed Jobs</span>
                    </div>
                  </div>
                </Tab>
              </Tabs>

            {/* Submit button */}
              <div className="mt-3 d-flex justify-content-start gap-2" style={{ alignItems: 'center' }}>
                <Button type="submit" variant="outline-secondary">
                  Save
                </Button> |
                <a href="/courses" style={{ color: '#a4a366', textDecoration: 'none' }}>Back</a>
              </div>
              {showDutyEditor && (
                <DutyEditor
                  mode="create"
                  onClose={() => setShowDutyEditor(false)}
                  fetchDuties={refreshAccessibleDuties}
                />
              )}
            </Form>
        )}
        }
      </Formik>
    </div >

  );
};

export default AssignmentEditor;
