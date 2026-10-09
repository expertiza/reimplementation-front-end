import React, { useCallback, useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { Form, Formik, FormikHelpers, useFormikContext } from "formik";
import { Button, Col, Container, Row, Tab, Tabs } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice";
import useAPI from "hooks/useAPI";
import { HttpMethod } from "utils/httpMethods";
import {
  IAssignmentFormValues,
  transformAssignmentRequest,
  REVIEW_STRATEGIES,
  REVIEW_STRATEGY_OPTIONS,
} from "./AssignmentUtil";
import RubricsContent, { QuestionnaireOption } from "./RubricsContent";
import FormInput from "components/Form/FormInput";
import FormSelect from "components/Form/FormSelect";
import FormCheckbox from "components/Form/FormCheckBox";
import FormDatePicker from "components/Form/FormDatePicker";
import ToolTip from "components/ToolTip";
import DataTable from "components/Table/Table";
import TopicsTab from "./tabs/TopicsTab";
import EtcTab from "./tabs/EtcTab";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CourseOption {
  label: string;
  value: number;
}

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
}

export interface AssignmentFormProps {
  mode: "create" | "edit";
  assignmentId?: string;
  initialValues: IAssignmentFormValues;
  courses: CourseOption[];
  questionnaires: QuestionnaireOption[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const sanitizePath = (s: string) =>
  s
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

const generateDirPath = (courseName: string, assignmentName: string): string => {
  const course = courseName.trim();
  const assignment = assignmentName.trim();
  const coursePrefix =
    course.length === 0
      ? ""
      : sanitizePath(course.length <= 18 ? course : course.slice(0, 8) + course.slice(-10));
  const assignmentPart = sanitizePath(assignment);
  if (!coursePrefix) return assignmentPart;
  return assignmentPart ? `${coursePrefix}/${assignmentPart}` : coursePrefix;
};

const validationSchema = Yup.object({
  name: Yup.string().required("Assignment name is required"),
});

// ── Sub-components ────────────────────────────────────────────────────────────

const DirectoryPathAutoFill: React.FC<{ courses: CourseOption[] }> = ({ courses }) => {
  const { values, setFieldValue } = useFormikContext<IAssignmentFormValues>();
  const lastAutoRef = useRef<string>("");
  useEffect(() => {
    const selected = courses.find((c) => c.value === Number(values.course_id));
    const courseName = selected && selected.value !== 0 ? selected.label : "";
    const auto = generateDirPath(courseName, values.name);
    if (!values.directory_path || values.directory_path === lastAutoRef.current) {
      lastAutoRef.current = auto;
      setFieldValue("directory_path", auto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.name, values.course_id]);
  return null;
};

// Resets activeTab to "general" when a tab's controlling checkbox is unchecked.
// Renders nothing — it's a Formik-context side-effect bridge.
const TabFallbackSync: React.FC<{
  hasTopics: boolean;
  isCalibrated: boolean;
  activeTab: string;
  onSetActiveTab: (t: string) => void;
}> = ({ hasTopics, isCalibrated, activeTab, onSetActiveTab }) => {
  useEffect(() => {
    if (!hasTopics && activeTab === "topics") onSetActiveTab("general");
  }, [hasTopics]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isCalibrated && activeTab === "calibration") onSetActiveTab("general");
  }, [isCalibrated]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

// ── Main component ────────────────────────────────────────────────────────────

const AssignmentForm: React.FC<AssignmentFormProps> = ({
  mode,
  assignmentId,
  initialValues,
  courses,
  questionnaires,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(mode === "edit" ? "topics" : "general");
  const [savedId, setSavedId] = useState<number | null>(
    mode === "edit" && assignmentId ? Number(assignmentId) : null
  );
  const formikRef = useRef<any>(null);

  // ── Topics state (used in edit mode; available in create after first save) ─
  const [topicsData, setTopicsData] = useState<TopicData[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  const { data: topicsResponse, error: topicsApiError, sendRequest: fetchTopics } = useAPI();
  const { data: deleteResponse, error: deleteError, sendRequest: deleteTopic } = useAPI();
  const { data: createTopicResp, error: createTopicErr, sendRequest: createTopic } = useAPI();
  const { data: updateTopicResp, error: updateTopicErr, sendRequest: updateTopic } = useAPI();
  const { data: dropTeamResp, error: dropTeamErr, sendRequest: dropTeamRequest } = useAPI();

  const effectiveId = savedId ?? (assignmentId ? Number(assignmentId) : null);

  const loadTopics = useCallback(() => {
    if (effectiveId) {
      setTopicsLoading(true);
      fetchTopics({ url: `/project_topics?assignment_id=${effectiveId}` });
    }
  }, [effectiveId, fetchTopics]);

  useEffect(() => {
    if (effectiveId) loadTopics();
  }, [effectiveId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (topicsResponse?.data) {
      setTopicsData(
        (topicsResponse.data || []).map((t: any) => ({
          id: t.topic_identifier?.toString?.() || String(t.id),
          databaseId: Number(t.id),
          name: t.topic_name,
          url: t.link,
          description: t.description,
          category: t.category,
          assignedTeams: t.confirmed_teams || [],
          waitlistedTeams: t.waitlisted_teams || [],
          questionnaire: "Default rubric",
          numSlots: t.max_choosers,
          availableSlots: t.available_slots || 0,
          bookmarks: [],
        }))
      );
      setTopicsLoading(false);
    }
  }, [topicsResponse]);

  useEffect(() => {
    if (topicsApiError) {
      setTopicsError(topicsApiError);
      setTopicsLoading(false);
    }
  }, [topicsApiError]);

  useEffect(() => {
    if (deleteResponse) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Topic deleted" }));
      loadTopics();
    }
  }, [deleteResponse]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (deleteError) dispatch(alertActions.showAlert({ variant: "danger", message: deleteError }));
  }, [deleteError, dispatch]);

  useEffect(() => {
    if (createTopicResp) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Topic created" }));
      loadTopics();
    }
  }, [createTopicResp]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (createTopicErr)
      dispatch(alertActions.showAlert({ variant: "danger", message: createTopicErr }));
  }, [createTopicErr, dispatch]);

  useEffect(() => {
    if (updateTopicResp) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Topic updated" }));
      loadTopics();
    }
  }, [updateTopicResp]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (updateTopicErr)
      dispatch(alertActions.showAlert({ variant: "danger", message: updateTopicErr }));
  }, [updateTopicErr, dispatch]);

  useEffect(() => {
    if (dropTeamResp) {
      dispatch(alertActions.showAlert({ variant: "success", message: "Team removed from topic" }));
      loadTopics();
    }
  }, [dropTeamResp]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (dropTeamErr) dispatch(alertActions.showAlert({ variant: "danger", message: dropTeamErr }));
  }, [dropTeamErr, dispatch]);

  const topicSettingFieldMap: Record<string, string> = {
    allowTopicSuggestions: "allow_topic_suggestion_from_students",
    enableBidding: "topics_assigned_by_bidding",
    enableAuthorsReview: "can_review_same_topic",
    allowReviewerChoice: "allow_reviewer_to_choose_topic_to_review",
    allowBiddingForReviewers: "enable_bidding_for_reviews",
  };

  const handleTopicSettingChange = useCallback((setting: string, value: boolean) => {
    const formikField = topicSettingFieldMap[setting];
    if (formikField && formikRef.current) {
      formikRef.current.setFieldValue(formikField, value);
    }
  }, []);

  const handleDropTeam = useCallback(
    (topicId: string, teamId: string) => {
      dropTeamRequest({
        url: `/signed_up_teams/drop_team_from_topic`,
        method: "DELETE",
        params: { topic_id: topicId, team_id: teamId },
      });
    },
    [dropTeamRequest]
  );

  const handleDeleteTopic = useCallback(
    (topicIdentifier: string) => {
      if (effectiveId) {
        deleteTopic({
          url: `/project_topics`,
          method: "DELETE",
          params: { assignment_id: effectiveId, "topic_ids[]": [topicIdentifier] },
        });
      }
    },
    [effectiveId, deleteTopic]
  );

  const handleEditTopic = useCallback(
    (dbId: string, updatedData: any) => {
      updateTopic({
        url: `/project_topics/${dbId}`,
        method: "PATCH",
        data: { project_topic: { ...updatedData, assignment_id: effectiveId } },
      });
    },
    [effectiveId, updateTopic]
  );

  const handleCreateTopic = useCallback(
    (topicData: any) => {
      if (!effectiveId) return;
      createTopic({
        url: `/project_topics`,
        method: "POST",
        data: {
          project_topic: {
            topic_identifier: topicData.topic_identifier || topicData.id,
            topic_name: topicData.topic_name || topicData.name,
            category: topicData.category,
            max_choosers: topicData.max_choosers ?? topicData.numSlots,
            assignment_id: effectiveId,
            description: topicData.description,
            link: topicData.link,
          },
          micropayment: topicData.micropayment ?? 0,
        },
      });
    },
    [effectiveId, createTopic]
  );

  // ── API hooks for form save ────────────────────────────────────────────────
  const { error: createErr, sendRequest: createReq } = useAPI();
  const { error: updateErr, sendRequest: updateReq } = useAPI();

  useEffect(() => {
    if (createErr) dispatch(alertActions.showAlert({ variant: "danger", message: createErr }));
  }, [createErr, dispatch]);
  useEffect(() => {
    if (updateErr) dispatch(alertActions.showAlert({ variant: "danger", message: updateErr }));
  }, [updateErr, dispatch]);

  // ── Save helpers ───────────────────────────────────────────────────────────
  const doSave = async (values: IAssignmentFormValues) => {
    if (!values.name) return;
    if (effectiveId) {
      await updateReq({
        url: `/assignments/${effectiveId}`,
        method: HttpMethod.PATCH,
        data: values,
        transformRequest: transformAssignmentRequest,
      });
    } else {
      const response = await createReq({
        url: "/assignments",
        method: HttpMethod.POST,
        data: values,
        transformRequest: transformAssignmentRequest,
      });
      const newId = response?.data?.id;
      if (newId) setSavedId(newId);
    }
  };

  const handleTabSelect = async (newKey: string | null) => {
    const key = newKey ?? (mode === "edit" ? "topics" : "general");
    const vals = formikRef.current?.values;
    if ((key === "topics" && !vals?.has_topics) || (key === "calibration" && !vals?.is_calibrated))
      return;
    if (formikRef.current) await doSave(formikRef.current.values);
    setActiveTab(key);
  };

  // ── Rubric weight fields for the currently active rows ────────────────────
  const getActiveWeightFields = (values: IAssignmentFormValues): string[] => {
    const fields: string[] = [];
    const roundCount = values.number_of_review_rounds ?? 1;
    if (values.review_rubric_varies_by_round && roundCount > 1) {
      for (let i = 1; i <= roundCount; i++) fields.push(`review_round_${i}_weight`);
    } else {
      fields.push("review_questionnaire_weight");
    }
    fields.push("author_feedback_questionnaire_weight");
    if (values.has_teams) fields.push("teammate_questionnaire_weight");
    return fields;
  };

  // ── Final submit ───────────────────────────────────────────────────────────
  const onSubmit = async (
    values: IAssignmentFormValues,
    helpers: FormikHelpers<IAssignmentFormValues>
  ) => {
    // Rubric weight validation: must sum to 100%; auto-assign remaining to zero-weight rows
    const weightFields = getActiveWeightFields(values);
    const weights = weightFields.map((f) => Number(values[f] ?? 0));
    const total = weights.reduce((s, w) => s + w, 0);
    if (total !== 100) {
      const remaining = 100 - total;
      const zeroIndices = weights.map((w, i) => (w === 0 ? i : -1)).filter((i) => i >= 0);
      if (zeroIndices.length > 0) {
        // Distribute remaining weight equally among zero-weight rubrics
        const share = Math.floor(remaining / zeroIndices.length);
        const extra = remaining - share * zeroIndices.length;
        const updated = { ...values };
        zeroIndices.forEach((idx, pos) => {
          updated[weightFields[idx]] = share + (pos === 0 ? extra : 0);
        });
        helpers.setValues(updated);
        dispatch(
          alertActions.showAlert({
            variant: "info",
            message: `Rubric weights auto-adjusted to sum to 100%.`,
          })
        );
        helpers.setSubmitting(false);
        return;
      } else {
        dispatch(
          alertActions.showAlert({
            variant: "danger",
            message: `Rubric weights sum to ${total}% — they must sum to 100%. Adjust the weights and try again.`,
          })
        );
        helpers.setSubmitting(false);
        return;
      }
    }
    try {
      await doSave(values);
      const finalId = savedId ?? (assignmentId ? Number(assignmentId) : null);
      if (mode === "create") {
        dispatch(
          alertActions.showAlert({
            variant: "success",
            message: `Assignment "${values.name}" created!`,
          })
        );
        navigate(finalId ? `/assignments/edit/${finalId}` : location.state?.from ?? "/courses");
      } else {
        dispatch(
          alertActions.showAlert({
            variant: "success",
            message: `Assignment "${values.name}" saved!`,
          })
        );
      }
    } catch {
      // errors handled via useEffect
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const handleCancel = () => navigate(location.state?.from ?? "/courses");

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Container fluid className="px-md-4">
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        validateOnChange={false}
        enableReinitialize
      >
        {(formik) => (
          <Form noValidate>
            <DirectoryPathAutoFill courses={courses} />
            <TabFallbackSync
              hasTopics={!!formik.values.has_topics}
              isCalibrated={!!formik.values.is_calibrated}
              activeTab={activeTab}
              onSetActiveTab={setActiveTab}
            />

            <Tabs
              activeKey={activeTab}
              onSelect={(k) => {
                const key = k ?? (mode === "edit" ? "topics" : "general");
                if (
                  (key === "topics" && !formik.values.has_topics) ||
                  (key === "calibration" && !formik.values.is_calibrated)
                )
                  return;
                handleTabSelect(key);
              }}
              id="assignment-form-tabs"
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
                        <div className="d-flex align-items-center gap-1">
                          <FormCheckbox
                            controlId="assignment-has_mentors"
                            label="Has mentors?"
                            name="has_mentors"
                          />
                          <ToolTip
                            id="has-mentors"
                            info="Each team is assigned a mentor who can guide the team but does not contribute to the submission."
                          />
                        </div>
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

                    {formik.values.has_topics && (
                      <div className="ms-4">
                        <div className="d-flex align-items-center gap-1">
                          <FormCheckbox
                            controlId="assignment-staggered_deadline"
                            label="Staggered deadline assignment?"
                            name="staggered_deadline"
                          />
                          <ToolTip
                            id="staggered-deadline"
                            info="Each topic gets its own set of submission and review deadlines instead of sharing a single schedule."
                          />
                        </div>
                      </div>
                    )}

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

              {/* ── Topics (conditional) ─────────────────────────────────── */}
              {formik.values.has_topics && (
                <Tab eventKey="topics" title="Topics">
                  {effectiveId ? (
                    <TopicsTab
                      assignmentName={formik.values.name}
                      assignmentId={String(effectiveId)}
                      topicSettings={{
                        allowTopicSuggestions:
                          formik.values.allow_topic_suggestion_from_students ?? false,
                        enableBidding: formik.values.topics_assigned_by_bidding ?? false,
                        enableAuthorsReview: formik.values.can_review_same_topic ?? false,
                        allowReviewerChoice:
                          formik.values.allow_reviewer_to_choose_topic_to_review ?? false,
                        allowBiddingForReviewers: formik.values.enable_bidding_for_reviews ?? false,
                        allowAdvertiseForPartners: false,
                        allowBookmarks: false,
                      }}
                      topicsData={topicsData}
                      topicsLoading={topicsLoading}
                      topicsError={topicsError}
                      onTopicSettingChange={handleTopicSettingChange}
                      onDropTeam={handleDropTeam}
                      onDeleteTopic={handleDeleteTopic}
                      onEditTopic={handleEditTopic}
                      onCreateTopic={handleCreateTopic}
                      onApplyPartnerAd={() => {}}
                      onTopicsChanged={loadTopics}
                    />
                  ) : (
                    <div className="mt-4">
                      <p className="text-muted">
                        Enter an assignment name and switch tabs to save first, then you can manage
                        topics here.
                      </p>
                    </div>
                  )}
                </Tab>
              )}

              {/* ── Rubrics ──────────────────────────────────────────────── */}
              <Tab eventKey="rubrics" title="Rubrics">
                <RubricsContent questionnaires={questionnaires} />
              </Tab>

              {/* ── Review Strategy ──────────────────────────────────────── */}
              <Tab eventKey="review-strategy" title="Review Strategy">
                <div className="mt-4" style={{ maxWidth: 640 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "max-content 1fr",
                      alignItems: "center",
                      columnGap: 16,
                      rowGap: 8,
                    }}
                  >
                    <div className="d-flex align-items-center gap-1">
                      <label className="form-label mb-0">Review strategy:</label>
                      <ToolTip
                        id="review-strategy"
                        info="Static: each reviewer is pre-assigned submissions. Dynamic: reviewer selects before reviewing."
                      />
                    </div>
                    <div style={{ width: 220 }}>
                      <FormSelect
                        controlId="assignment-review_strategy"
                        name="review_strategy"
                        options={REVIEW_STRATEGY_OPTIONS}
                      />
                    </div>

                    {formik.values.review_strategy === REVIEW_STRATEGIES.AUTO_SELECTED &&
                      formik.values.has_topics && (
                        <>
                          <label className="form-label mb-0">Review topic threshold (k):</label>
                          <div style={{ width: 70 }}>
                            <FormInput
                              controlId="assignment-review_topic_threshold"
                              label=""
                              name="review_topic_threshold"
                              type="number"
                            />
                          </div>
                        </>
                      )}

                    <label className="form-label mb-0">Maximum reviews per submission:</label>
                    <div style={{ width: 70 }}>
                      <FormInput
                        controlId="assignment-maximum_number_of_reviews_per_submission"
                        label=""
                        name="maximum_number_of_reviews_per_submission"
                        type="number"
                      />
                    </div>
                  </div>

                  {formik.values.review_strategy === REVIEW_STRATEGIES.AUTO_SELECTED && (
                    <div className="mt-3">
                      <FormCheckbox
                        controlId="assignment-has_max_review_limit"
                        label="Has max review limit?"
                        name="has_max_review_limit"
                      />
                      {formik.values.has_max_review_limit && (
                        <div
                          className="ms-4 mt-1"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "max-content 80px max-content",
                            alignItems: "center",
                            columnGap: 8,
                            rowGap: 4,
                          }}
                        >
                          <label className="form-label mb-0">Required reviews per reviewer:</label>
                          <FormInput
                            controlId="assignment-set_required_number_of_reviews_per_reviewer"
                            label=""
                            name="set_required_number_of_reviews_per_reviewer"
                            type="number"
                          />
                          <ToolTip
                            id="required-reviews"
                            info="How many reviews a reviewer must complete for full credit."
                          />
                          <label className="form-label mb-0">Allowed reviews per reviewer:</label>
                          <FormInput
                            controlId="assignment-set_allowed_number_of_reviews_per_reviewer"
                            label=""
                            name="set_allowed_number_of_reviews_per_reviewer"
                            type="number"
                          />
                          <ToolTip
                            id="allowed-reviews"
                            info="Maximum reviews a reviewer may do (including for extra credit)."
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-2">
                    <div className="d-flex align-items-center gap-1">
                      <FormCheckbox
                        controlId="assignment-is_review_anonymous"
                        label="Is review anonymous?"
                        name="is_review_anonymous"
                      />
                      <ToolTip
                        id="is-review-anonymous"
                        info="The submitter cannot see who reviewed their submission."
                      />
                    </div>
                    {formik.values.has_teams && (
                      <>
                        <FormCheckbox
                          controlId="assignment-is_review_done_by_teams"
                          label="Is review done by teams?"
                          name="is_review_done_by_teams"
                        />
                        <div className="d-flex align-items-center gap-1">
                          <FormCheckbox
                            controlId="assignment-is_role_based"
                            label="Is role based?"
                            name="is_role_based"
                          />
                          <ToolTip
                            id="is-role-based"
                            info="Divides peer-review work among team members by assigned review role (e.g. reviewer, meta-reviewer). This is separate from system roles like student or instructor. Duty assignments are configured after saving the assignment."
                          />
                        </div>
                      </>
                    )}
                    <div className="d-flex align-items-center gap-1">
                      <FormCheckbox
                        controlId="assignment-allow_self_reviews"
                        label="Self-reviews required?"
                        name="allow_self_reviews"
                      />
                      <ToolTip
                        id="allow-self-reviews"
                        info="When enabled, reviewers must also review their own submission."
                      />
                    </div>
                  </div>

                  <div className="mt-3 d-flex align-items-center gap-3">
                    <label className="form-label mb-0">Instructor grade scale:</label>
                    <label className="form-label mb-0">Min:</label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: 80 }}
                      value={formik.values.instructor_grade_min_score ?? ""}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "instructor_grade_min_score",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                    />
                    <label className="form-label mb-0">Max:</label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: 80 }}
                      value={formik.values.instructor_grade_max_score ?? ""}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "instructor_grade_max_score",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              </Tab>

              {/* ── Due Dates ─────────────────────────────────────────────── */}
              <Tab eventKey="due-dates" title="Due Dates">
                <div className="mt-4">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <label className="form-label mb-0">Number of review rounds:</label>
                    <div style={{ width: 70 }}>
                      <FormInput
                        controlId="assignment-number_of_review_rounds"
                        label=""
                        name="number_of_review_rounds"
                        type="number"
                      />
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <FormCheckbox
                      controlId="assignment-use_signup_deadline"
                      label="Use signup deadline"
                      name="use_signup_deadline"
                    />
                    <ToolTip
                      id="signup-deadline"
                      info="The deadline by which students must sign up for a topic before it becomes unavailable."
                    />
                  </div>
                  {formik.values.has_topics && (
                    <div className="d-flex align-items-center gap-1">
                      <FormCheckbox
                        controlId="assignment-use_drop_topic_deadline"
                        label="Use drop-topic deadline"
                        name="use_drop_topic_deadline"
                      />
                      <ToolTip
                        id="drop-topic-deadline"
                        info="The deadline by which students may drop their chosen topic and select another."
                      />
                    </div>
                  )}
                  {formik.values.has_teams && (
                    <div className="d-flex align-items-center gap-1">
                      <FormCheckbox
                        controlId="assignment-use_team_formation_deadline"
                        label="Use team-formation deadline"
                        name="use_team_formation_deadline"
                      />
                      <ToolTip
                        id="team-formation-deadline"
                        info="The deadline by which all team members must be confirmed. Teams cannot be changed after this point."
                      />
                    </div>
                  )}

                  <div className="mt-3" style={{ width: "75%" }}>
                    <DataTable
                      showColumnFilter={false}
                      showGlobalFilter={false}
                      showPagination={false}
                      getRowId={(row) => String(row.id)}
                      data={[
                        ...Array.from(
                          { length: formik.values.number_of_review_rounds ?? 0 },
                          (_, i) => [
                            { id: 2 * i, deadline_type: `Review ${i + 1}: Submission` },
                            { id: 2 * i + 1, deadline_type: `Review ${i + 1}: Review` },
                          ]
                        ).flat(),
                        ...(formik.values.use_signup_deadline
                          ? [{ id: "signup_deadline", deadline_type: "Signup deadline" }]
                          : []),
                        ...(formik.values.has_topics && formik.values.use_drop_topic_deadline
                          ? [{ id: "drop_topic_deadline", deadline_type: "Drop topic deadline" }]
                          : []),
                        ...(formik.values.has_teams && formik.values.use_team_formation_deadline
                          ? [
                              {
                                id: "team_formation_deadline",
                                deadline_type: "Team formation deadline",
                              },
                            ]
                          : []),
                      ]}
                      columns={[
                        {
                          accessorKey: "deadline_type",
                          header: "Deadline type",
                          enableSorting: false,
                          enableColumnFilter: false,
                        },
                        {
                          cell: ({ row }: any) => (
                            <FormDatePicker
                              controlId={`date_time_${row.original.id}`}
                              name={`date_time.${row.original.id}`}
                            />
                          ),
                          accessorKey: "date_time",
                          header: "Date & Time",
                          enableSorting: false,
                          enableColumnFilter: false,
                        },
                        {
                          cell: ({ row }: any) => (
                            <FormSelect
                              controlId={`submission_allowed_${row.original.id}`}
                              name={`submission_allowed[${row.original.id}]`}
                              options={[
                                { label: "Yes", value: "3" },
                                { label: "Late", value: "2" },
                                { label: "No", value: "1" },
                              ]}
                            />
                          ),
                          accessorKey: "submission_allowed",
                          header: "Submission allowed?",
                          enableSorting: false,
                          enableColumnFilter: false,
                        },
                        {
                          cell: ({ row }: any) => (
                            <FormSelect
                              controlId={`review_allowed_${row.original.id}`}
                              name={`review_allowed[${row.original.id}]`}
                              options={[
                                { label: "Yes", value: "3" },
                                { label: "Late", value: "2" },
                                { label: "No", value: "1" },
                              ]}
                            />
                          ),
                          accessorKey: "review_allowed",
                          header: "Review allowed?",
                          enableSorting: false,
                          enableColumnFilter: false,
                        },
                        ...(formik.values.has_teams
                          ? [
                              {
                                cell: ({ row }: any) => (
                                  <FormSelect
                                    controlId={`teammate_allowed_${row.original.id}`}
                                    name={`teammate_allowed[${row.original.id}]`}
                                    options={[
                                      { label: "Yes", value: "3" },
                                      { label: "Late", value: "2" },
                                      { label: "No", value: "1" },
                                    ]}
                                  />
                                ),
                                accessorKey: "teammate_allowed",
                                header: "Teammate Review Allowed?",
                                enableSorting: false as const,
                                enableColumnFilter: false as const,
                              },
                            ]
                          : []),
                      ]}
                    />
                  </div>

                  <div className="mt-3 d-flex align-items-center gap-2">
                    <FormCheckbox
                      controlId="assignment-apply_late_policy"
                      label="Apply late policy:"
                      name="apply_late_policy"
                    />
                    <FormSelect
                      controlId="assignment-late_policy_id"
                      name="late_policy_id"
                      options={[{ label: "-- None --", value: 0 }]}
                    />
                  </div>
                </div>
              </Tab>

              {/* ── Calibration (conditional) ─────────────────────────────── */}
              {formik.values.is_calibrated && (
                <Tab eventKey="calibration" title="Calibration">
                  <div className="mt-4">
                    <p className="text-muted">Calibration settings — coming soon.</p>
                  </div>
                </Tab>
              )}

              {/* ── Etc. ──────────────────────────────────────────────────── */}
              <Tab eventKey="etc" title="Etc.">
                <Row className="mt-4">
                  <Col>
                    {effectiveId ? (
                      <EtcTab assignmentId={effectiveId} />
                    ) : (
                      <div className="alert alert-secondary">
                        <h5>Actions</h5>
                        <p className="mb-0">
                          Save the assignment first to unlock participants, teams, and reviewer
                          assignment.
                        </p>
                      </div>
                    )}
                  </Col>
                </Row>
              </Tab>
            </Tabs>

            {/* ── Footer ────────────────────────────────────────────────── */}
            <Row className="mt-4 mb-4">
              <Col className="d-flex gap-2">
                {mode === "create" && (
                  <Button variant="outline-secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
                <Button variant="primary" type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting
                    ? "Saving..."
                    : mode === "create"
                    ? "Create Assignment"
                    : "Save Assignment"}
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default AssignmentForm;
