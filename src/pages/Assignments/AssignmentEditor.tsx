import * as Yup from "yup";

import { Button, Modal } from "react-bootstrap";
import { Form, Formik, FormikHelpers } from "formik";
import { IAssignmentFormValues, transformAssignmentRequest } from "./AssignmentUtil";
import { IEditor } from "../../utils/interfaces";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLoaderData, useLocation, useNavigate, useParams } from "react-router-dom";
import FormInput from "../../components/Form/FormInput";
import FormSelect from "../../components/Form/FormSelect";
import { HttpMethod } from "../../utils/httpMethods";
import { RootState } from "../../store/store";
import { alertActions } from "../../store/slices/alertSlice";
import useAPI from "../../hooks/useAPI";
import FormCheckbox from "../../components/Form/FormCheckBox";
import { Tabs, Tab } from 'react-bootstrap';
import '../../custom.scss';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import Table from "../../components/Table/Table";
import FormDatePicker from "../../components/Form/FormDatePicker";
import ToolTip from "../../components/ToolTip";
import EtcTab from './tabs/EtcTab';
import TopicsTab from "./tabs/TopicsTab";
import DutyEditor from "pages/Duties/DutyEditor";

interface TopicSettings {
  allowTopicSuggestions: boolean;
  enableBidding: boolean;
  enableAuthorsReview: boolean;
  allowReviewerChoice: boolean;
  allowBookmarks: boolean;
  allowBiddingForReviewers: boolean;
  allowAdvertiseForPartners: boolean;
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
  is_role_based: false,
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

 

  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  // authentication state not required in this editor
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
  const [showDutyEditor, setShowDutyEditor] = useState(false);
  const [accessibleDuties, setAccessibleDuties] = useState<any[]>([]);
  const [assignmentDuties, setAssignmentDuties] = useState<any[]>([]);
  const [selectedDutyIds, setSelectedDutyIds] = useState<number[]>([]);
  const [roleBasedLocalError, setRoleBasedLocalError] = useState<string | null>(null);


   useEffect(() => {
    if (assignmentResponse?.data) {
      setAssignmentName(assignmentResponse.data.name || "");
      // Load allow_bookmarks setting from backend
      if (assignmentResponse.data.allow_bookmarks !== undefined && assignmentResponse.data.advertising_for_partners_allowed !== undefined) {
        setTopicSettings(prev => ({ ...prev, allowBookmarks: assignmentResponse.data.allow_bookmarks,allowAdvertiseForPartners: assignmentResponse.data.advertising_for_partners_allowed }));
      }
    }
  }, [assignmentResponse]);

  useEffect(() => {
    if (assignmentError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: assignmentError }));
    }
  }, [assignmentError, dispatch]);

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
      dispatch(alertActions.showAlert({ variant: "success", message: "Bookmark setting saved successfully" }));
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
            bookmarks: [],
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
     const handleTopicSettingChange = useCallback((setting: string, value: boolean) => {
        setTopicSettings((prev) => ({ ...prev, [setting]: value }));
        
        // Save allow_bookmarks setting to backend immediately
        if (setting === 'allowBookmarks' && id) {
          updateAssignment({
            url: `/assignments/${id}`,
            method: 'PATCH',
            data: {
              assignment: {
                allow_bookmarks: value
              }
            }
          });
        }
        // Save advertising_for_partners_allowed setting to backend immediately
        if (setting === 'allowAdvertiseForPartners' && id) {
          updateAssignment({
            url: `/assignments/${id}`,
            method: 'PATCH',
            data: {
              assignment: {
                advertising_for_partners_allowed: value
              }
            }
          });
        }
    
      }, [id, updateAssignment]);
    

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
          console.log(`Delete topic ${topicIdentifier}`);
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
          console.log(`Edit topic DB id ${dbId}`, updatedData);
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
          console.log(`Create topic`, topicData);
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
      
        const handleApplyPartnerAd = useCallback((topicId: string, applicationText: string) => {
          console.log(`Applying to partner ad for topic ${topicId}: ${applicationText}`);
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


  const onSubmit = (
    values: IAssignmentFormValues,
    submitProps: FormikHelpers<IAssignmentFormValues>
  ) => {
    if (values.is_role_based && id && assignmentDuties.length === 0) {
      dispatch(alertActions.showAlert({ variant: "danger", message: "Please add at least one duty when role-based reviews are enabled." }));
      return;
    }

    // validate sum of weights = 100%
    const totalWeight = values.weights?.reduce((acc: number, curr: number) => acc + curr, 0) || 0;

    const hasWeights = (values.weights?.length ?? 0) > 0;

    if (hasWeights && totalWeight !== 100) {
      dispatch(alertActions.showAlert({ variant: "danger", message: "Sum of weights must be 100%" }));
      return;
    }

    let method: HttpMethod = HttpMethod.POST;
    let url: string = "/assignments";
    if (mode === "update") {
      url = `/assignments/${values.id}`;
      method = HttpMethod.PATCH;
    }
    // to be used to display message when assignment is created
    assignmentData.name = values.name;
    console.log(values);
    sendRequest({
      url: url,
      method: method,
      data: values,
      transformRequest: transformAssignmentRequest,
    });
    submitProps.setSubmitting(false);
  };

  const handleClose = () => navigate(location.state?.from ? location.state.from : "/assignments");

  // Map the currently selected questionnaire for each round (used to prefill dropdowns)
  const roundSelections: Record<number, { id: number; name: string }> = {};
  (assignmentData.assignment_questionnaires || []).forEach((aq: any) => {
    if (aq.used_in_round && aq.questionnaire) {
      roundSelections[aq.used_in_round] = { id: aq.questionnaire.id, name: aq.questionnaire.name };
    }
  });

  // Build dropdown options from the questionnaires
  const questionnaireOptions = (assignmentData.questionnaires || []).map((q: any) => ({
    label: q.name,
    value: q.id,
  }));

  const reviewRounds = assignmentData.number_of_review_rounds;

  // Build initial form values from existing assignment data (update) or defaults (create)
  const formInitialValues: IAssignmentFormValues & Record<string, any> = {
    ...getInitialValues(),
  };

  if (mode === "update") {
    // Prefill per-round questionnaire selections and ids
    (assignmentData.assignment_questionnaires || []).forEach((aq: any) => {
      if (aq.used_in_round && aq.questionnaire) {
        formInitialValues[`questionnaire_round_${aq.used_in_round}`] = aq.questionnaire.id;
        formInitialValues[`assignment_questionnaire_id_${aq.used_in_round}`] = aq.id;
      }
    });
  }


  // Topic settings state
    const [topicSettings, setTopicSettings] = useState<TopicSettings>({
      allowTopicSuggestions: false,
      enableBidding: false,
      enableAuthorsReview: true,
      allowReviewerChoice: true,
      allowBookmarks: false,
      allowBiddingForReviewers: false,
      allowAdvertiseForPartners: false,
    });
  
    // Topics data state
    const [topicsData, setTopicsData] = useState<TopicData[]>([]);
    const [topicsLoading, setTopicsLoading] = useState(false);
    const [topicsError, setTopicsError] = useState<string | null>(null);



  return (
    <div style={{ padding: '30px' }}>
      {
        mode === "update" && <h1>Editing Assignment: {assignmentData.name}</h1>
      }
      {
        mode === "create" && <h1>Creating Assignment</h1>
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
                <TopicsTab
                  assignmentName={assignmentName}
            assignmentId={id!}
            topicSettings={topicSettings}
            topicsData={topicsData}
            topicsLoading={topicsLoading}
            topicsError={topicsError}
            onTopicSettingChange={handleTopicSettingChange}
            onDropTeam={handleDropTeam}
            onDeleteTopic={handleDeleteTopic}
            onEditTopic={handleEditTopic}
            onCreateTopic={handleCreateTopic}
            onApplyPartnerAd={handleApplyPartnerAd}
            onTopicsChanged={() => id && fetchTopics({ url: `/project_topics?assignment_id=${id}` })}
                />
              </Tab>

              {/* Rubrics Tab */}
              <Tab eventKey="rubrics" title="Rubrics">
                <div style={{ marginTop: '20px' }}></div>
                <FormCheckbox controlId="assignment-review_rubric_varies_by_round" label="Review rubric varies by round?" name="review_rubric_varies_by_round" />
                <FormCheckbox controlId="assignment-review_rubric_varies_by_topic" label="Review rubric varies by topic?" name="review_rubric_varies_by_topic" />
                <FormCheckbox controlId="assignment-review_rubric_varies_by_role" label="Review rubric varies by role?" name="review_rubric_varies_by_role" />

                <div style={{ marginTop: '20px' }}>
                  <Table
                    showColumnFilter={false}
                    showGlobalFilter={false}
                    showPagination={false}
                    data={[
                      ...(() => {
                        // Determine how many review rounds to show in the Rubrics table.
                        // For "vary by round", if the count is 0/undefined, still show one round
                        // so the user can configure at least the first round's rubric.
                        const baseRounds =
                          (mode === "update"
                            ? reviewRounds
                            : formik.values.number_of_review_rounds) ?? 0;
                        const rounds = formik.values.review_rubric_varies_by_round
                          ? (baseRounds || 1)
                          : baseRounds;
                        if (formik.values.review_rubric_varies_by_round) {
                          return Array.from({ length: rounds }, (_, i) => ([
                            {
                              id: i + 1,
                              title: `Review round ${i + 1}:`,
                              questionnaire_options: questionnaireOptions,
                              selected_questionnaire: roundSelections[i + 1]?.id,
                              questionnaire_type: 'dropdown',
                            },
                            {
                              id: i + 1,
                              title: `Add tag prompts`,
                              questionnaire_type: 'tag_prompts',
                            }
                          ])).flat();
                        }
                        return [
                          {
                            id: 0,
                            title: "Review rubric:",
                            questionnaire_options: questionnaireOptions,
                            selected_questionnaire: roundSelections[1]?.id,
                            questionnaire_type: 'dropdown',
                          },
                          {
                            id: 0,
                            title: "Add tag prompts",
                            questionnaire_type: 'tag_prompts',
                          }
                        ];
                      })(),
                      {
                        id: formik.values.number_of_review_rounds ?? 0,
                        title: "Author feedback:",
                        questionnaire_options: [{ label: 'Standard author feedback', value: 'Standard author feedback' }],
                        questionnaire_type: 'dropdown',
                      },
                      {
                        id: formik.values.number_of_review_rounds ?? 0,
                        title: "Add tag prompts",
                        questionnaire_type: 'tag_prompts',
                      },
                      {
                        id: (formik.values.number_of_review_rounds ?? 0) + 1,
                        title: "Teammate review:",
                        questionnaire_options: [{ label: 'Review with Github metrics', value: 'Review with Github metrics' }],
                        questionnaire_type: 'dropdown',
                      },
                      {
                        id: (formik.values.number_of_review_rounds ?? 0) + 1,
                        title: "Add tag prompts",
                        questionnaire_type: 'tag_prompts',
                      },
                    ]}
                    columns={[
                      {
                        cell: ({ row }) => <div style={{ marginRight: '10px' }}>{row.original.title}</div>,
                        accessorKey: "title", header: "", enableSorting: false, enableColumnFilter: false
                      },
                      {
                        cell: ({ row }) => <div style={{ marginRight: '10px' }}>{row.original.questionnaire_type === 'dropdown' &&
                          <FormSelect
                            controlId={`assignment-questionnaire_${row.original.id}`}
                            name={`questionnaire_round_${row.original.id}`}
                            options={row.original.questionnaire_options || []}
                          // Formik initialValues handles prefill via questionnaire_round_X fields
                          />}
                          {row.original.questionnaire_type === 'tag_prompts' &&
                            <div style={{ marginBottom: '10px' }}><Button variant="outline-secondary">+Tag prompt+</Button>
                              <Button variant="outline-secondary">-Tag prompt-</Button></div>}</div>,
                        accessorKey: "questionnaire", header: "Questionnaire", enableSorting: false, enableColumnFilter: false
                      },
                      {
                        cell: ({ row }) => {
                          if (row.original.questionnaire_type !== 'dropdown') {
                            return <div style={{ marginRight: '10px' }} />;
                          }

                          // Use distinct indices in the weights array so that
                          // different rows (review rubric, author feedback,
                          // teammate review, etc.) do not overwrite each other.
                          let weightIndex: number;
                          if (row.original.title === "Author feedback:") {
                            weightIndex = 100; // separate slot for author feedback
                          } else if (row.original.title === "Teammate review:") {
                            weightIndex = 101; // separate slot for teammate review
                          } else {
                            weightIndex = row.original.id;
                          }

                          return (
                            <div style={{ marginRight: '10px' }}>
                              <div style={{ width: '70px', display: 'flex', alignItems: 'center' }}>
                                <FormInput
                                  controlId={`assignment-weight_${row.original.id}`}
                                  name={`weights[${weightIndex}]`}
                                  type="number"
                                />
                                %
                              </div>
                            </div>
                          );
                        },
                        accessorKey: `weights`, header: "Weight", enableSorting: false, enableColumnFilter: false
                      },
                      {
                        cell: ({ row }) => <>{row.original.questionnaire_type === 'dropdown' &&
                          <><div style={{ width: '70px', display: 'flex', alignItems: 'center' }}><FormInput controlId={`assignment-notification_limit_${row.original.id}`} name={`notification_limits[${row.original.id}]`} type="number" />%</div></>}</>,
                        accessorKey: "notification_limits", header: "Notification Limit", enableSorting: false, enableColumnFilter: false
                      },
                    ]}
                  />
                </div>
              </Tab>

              {/* Review Strategy Tab */}
              <Tab eventKey="review_strategy" title="Review strategy">
                <div style={{ marginTop: '20px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>
                  <label className="form-label">Review strategy:</label>
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
                    <label className="form-label">Review topic threshold (k):</label>
                    <div style={{ width: '70px', display: 'flex', alignItems: 'center' }}>
                      <FormInput controlId="assignment-review_topic_threshold" name="review_topic_threshold" type="number" />
                    </div>
                  </div>
                )}
                <div style={{ display: 'grid', alignItems: 'center', columnGap: '10px', gridTemplateColumns: 'max-content 1fr' }}>
                  <label className="form-label">Maximum number of reviews per submission:</label>
                  <div style={{ width: '70px', display: 'flex', alignItems: 'center' }}>
                    <FormInput controlId="assignment-maximum_number_of_reviews_per_submission" name="maximum_number_of_reviews_per_submission" type="number" />
                  </div>
                  <FormCheckbox controlId="assignment-has_max_review_limit" label="Has max review limit?" name="has_max_review_limit" />
                  <div></div>
                  <label className="form-label">Set allowed number of reviews per reviewer:</label>
                  <div style={{ width: '70px', display: 'flex', alignItems: 'center' }}>
                    <FormInput controlId="assignment-set_allowed_number_of_reviews_per_reviewer" name="set_allowed_number_of_reviews_per_reviewer" type="number" />
                  </div>
                  <label className="form-label">Set required number of reviews per reviewer:</label>
                  <div style={{ width: '70px', display: 'flex', alignItems: 'center' }}>
                    <FormInput controlId="assignment-set_required_number_of_reviews_per_reviewer" name="set_required_number_of_reviews_per_reviewer" type="number" />
                  </div>
                </div>
                <FormCheckbox controlId="assignment-is_review_anonymous" label="Is review anonymous?" name="is_review_anonymous" />
                <FormCheckbox controlId="assignment-is_review_done_by_teams" label="Is review done by teams?" name="is_review_done_by_teams" />
                <FormCheckbox controlId="assignment-allow_self_reviews" label="Allow self-reviews?" name="allow_self_reviews" />
                <FormCheckbox controlId="assignment-reviews_visible_to_other_reviewers" label="Reviews visible to other reviewers?" name="reviews_visible_to_other_reviewers" />

                <FormCheckbox controlId="assignment-is_role_based" label="Is role based?" name="is_role_based" />
                {formik.values.is_role_based && (
                  <div style={{ marginTop: '10px', paddingLeft: 30, maxWidth: '520px' }}>
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

                <div>
                  <div style={{ marginTop: '30px' }}>
                    <Table
                      showColumnFilter={false}
                      showGlobalFilter={false}
                      showPagination={false}
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
                          cell: ({ row }) => <><FormCheckbox controlId={`assignment-use_date_updater_${row.original.id}`} name={`use_date_updater[${row.original.id}]`} /></>,
                          accessorKey: `use_date_updater`, header: "Use date updater?", enableSorting: false, enableColumnFilter: false
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
                            <FormSelect controlId={`assignment-review_allowed_${row.original.id}`} name={`review_allowed[${row.original.id}]`} options={[
                              { label: "Yes", value: "yes" },
                              { label: "No", value: "no" },
                            ]} />
                          </>,
                          accessorKey: "review_allowed", header: "Review allowed?", enableSorting: false, enableColumnFilter: false
                        },
                        {
                          cell: ({ row }) => <>
                            <FormSelect controlId={`assignment-teammate_allowed_${row.original.id}`} name={`teammate_allowed[${row.original.id}]`} options={[
                              { label: "Yes", value: "yes" },
                              { label: "No", value: "no" },
                            ]} />
                          </>,
                          accessorKey: "teammate_allowed", header: "Teammate allowed?", enableSorting: false, enableColumnFilter: false
                        },
                        {
                          cell: ({ row }) => <>
                            <FormSelect controlId={`assignment-metareview_allowed_${row.original.id}`} name={`metareview_allowed[${row.original.id}]`} options={[
                              { label: "Yes", value: "yes" },
                              { label: "No", value: "no" },
                            ]} />
                          </>,
                          accessorKey: "metareview_allowed", header: "Meta-review allowed?", enableSorting: false, enableColumnFilter: false
                        },
                        {
                          cell: ({ row }) => <>
                            <FormSelect controlId={`assignment-reminder_${row.original.id}`} name={`reminder[${row.original.id}]`} options={[
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
                          accessorKey: "reminder", header: "Reminder (hrs)", enableSorting: false, enableColumnFilter: false
                        },
                      ]}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>
                  <FormCheckbox controlId={`assignment-apply_late_policy`} label="Apply late policy:" name={`apply_late_policy?`} />
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
                <Button type="submit" variant="outline-secondary">
                  Save
                </Button> |
                <a href="/assignments" style={{ color: '#a4a366', textDecoration: 'none' }}>Back</a>
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

  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{mode === "update" ? `Update Assignment - ${assignmentData.name}` : "Create Assignment"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {assignmentError && <p className="text-danger">{assignmentError}</p>}
        <Tabs defaultActiveKey="general" id="assignment-tabs">
          <Tab eventKey="general" title="General">
            <Formik
              initialValues={mode === "update" ? assignmentData : initialValues}
              onSubmit={onSubmit}
              validationSchema={validationSchema}
              validateOnChange={false}
              enableReinitialize={true}
            >
              {(formik) => {
                return (
                  <Form>
                    <FormInput controlId="assignment-name" label="Assignment Name" name="name" />
                    <FormInput controlId="assignment-directory_path" label="Submission Directory" name="directory_path" />
                    <FormInput controlId="assignment-spec_location" label="Description URL" name="spec_location" />
                    <FormInput controlId="assignment-submitter_count" label="Submitter Count" name="submitter_count" type="number" />
                    <FormInput controlId="assignment-num_reviews" label="Number of Reviews" name="num_reviews" type="number" />
                    <FormInput controlId="assignment-num_review_of_reviews" label="Number of Review of Reviews" name="num_review_of_reviews" type="number" />
                    <FormInput controlId="assignment-num_review_of_reviewers" label="Number of Review of Reviewers" name="num_review_of_reviewers" type="number" />
                    <FormInput controlId="assignment-num_reviewers" label="Number of Reviewers" name="num_reviewers" type="number" />
                    <FormInput controlId="assignment-max_team_size" label="Max Team Size" name="max_team_size" type="number" />
                    <FormInput controlId="assignment-days_between_submissions" label="Days Between Submissions" name="days_between_submissions" type="number" />
                    <FormInput controlId="assignment-review_assignment_strategy" label="Review Assignment Strategy" name="review_assignment_strategy" />
                    <FormInput controlId="assignment-max_reviews_per_submission" label="Max Reviews Per Submission" name="max_reviews_per_submission" type="number" />
                    <FormInput controlId="assignment-review_topic_threshold" label="Review Topic Threshold" name="review_topic_threshold" type="number" />
                    <FormInput controlId="assignment-rounds_of_reviews" label="Rounds of Reviews" name="rounds_of_reviews" type="number" />
                    <FormInput controlId="assignment-num_quiz_questions" label="Number of Quiz Questions" name="num_quiz_questions" type="number" />
                    <FormInput controlId="assignment-late_policy_id" label="Late Policy ID" name="late_policy_id" type="number" />
                    <FormInput controlId="assignment-max_bids" label="Max Bids" name="max_bids" type="number" />
                    <FormCheckbox controlId="assignment-private" label="Private Assignment" name="private" />
                    <FormCheckbox controlId="assignment-show_teammate_review" label="Show Teammate Reviews?" name="show_teammate_review" />
                    <FormCheckbox controlId="assignment-require_quiz" label="Has quiz?" name="require_quiz" />
                    <FormCheckbox controlId="assignment-has_badge" label="Has badge?" name="has_badge" />
                    <FormCheckbox controlId="assignment-staggered_deadline" label="Staggered deadline assignment?" name="staggered_deadline" />
                    <FormCheckbox controlId="assignment-is_calibrated" label="Calibration for training?" name="is_calibrated" />
                    <FormCheckbox controlId="assignment-reviews_visible_to_all" label="Reviews Visible to All" name="reviews_visible_to_all" />
                    <FormCheckbox controlId="assignment-allow_suggestions" label="Allow Suggestions" name="allow_suggestions" />
                    <FormCheckbox controlId="assignment-copy_flag" label="Copy Flag" name="copy_flag" />
                    <FormCheckbox controlId="assignment-microtask" label="Microtask" name="microtask" />
                    <FormCheckbox controlId="assignment-is_coding_assignment" label="Is Coding Assignment" name="is_coding_assignment" />
                    <FormCheckbox controlId="assignment-is_intelligent" label="Is Intelligent" name="is_intelligent" />
                    <FormCheckbox controlId="assignment-calculate_penalty" label="Calculate Penalty" name="calculate_penalty" />
                    <FormCheckbox controlId="assignment-is_penalty_calculated" label="Is Penalty Calculated" name="is_penalty_calculated" />
                    <FormCheckbox controlId="assignment-availability_flag" label="Availability Flag" name="availability_flag" />
                    <FormCheckbox controlId="assignment-use_bookmark" label="Use Bookmark" name="use_bookmark" />
                    <FormCheckbox controlId="assignment-can_review_same_topic" label="Can Review Same Topic" name="can_review_same_topic" />
                    <FormCheckbox controlId="assignment-can_choose_topic_to_review" label="Can Choose Topic to Review" name="can_choose_topic_to_review" />
                    <Modal.Footer>
                      <Button variant="outline-secondary" onClick={handleClose}>
                        Close
                      </Button>

                      <Button
                        variant="outline-success"
                        type="submit"
                        disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                      >
                        {mode === "update" ? "Update Assignment" : "Create Assignment"}
                      </Button>
                    </Modal.Footer>
                  </Form>
                );
              }}
            </Formik>
          </Tab>
          <Tab eventKey="etc" title="Etc">
            <EtcTab assignmentId={assignmentData?.id} />
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default AssignmentEditor;
