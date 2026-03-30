import * as Yup from "yup";

import { Alert, Button, Form as RBForm, InputGroup } from "react-bootstrap";
import { Form, Formik, FormikHelpers, Field } from "formik";
import {
  IAssignmentFormValues,
  normalizeReviewStrategyForSelect,
  transformAssignmentRequest,
} from "./AssignmentUtil";
import { IEditor } from "../../utils/interfaces";
import type { AxiosResponse } from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLoaderData, useLocation, useNavigate, useParams } from "react-router-dom";
import FormInput from "../../components/Form/FormInput";
import FormSelect from "../../components/Form/FormSelect";
import { HttpMethod } from "../../utils/httpMethods";
import { RootState } from "../../store/store";
import { alertActions } from "../../store/slices/alertSlice";
import useAPI from "../../hooks/useAPI";
import axiosClient from "../../utils/axios_client";
import FormCheckbox from "../../components/Form/FormCheckBox";
import { Tabs, Tab } from 'react-bootstrap';
import '../../custom.scss';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { FaPlus } from 'react-icons/fa';
import Table from "../../components/Table/Table";
import FormDatePicker from "../../components/Form/FormDatePicker";
import ToolTip from "../../components/ToolTip";
import EtcTab from './tabs/EtcTab';
import TopicsTab from "./tabs/TopicsTab";
import { fileDisplayName } from "../../utils/fileDisplayName";

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
  review_strategy: "1",
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

/** Rails returns a JSON array (legacy) or { calibration_response_maps, has_review_rubric_for_calibration }. */
function calibrationMapsPayloadToArray(resData: unknown): any[] {
  if (Array.isArray(resData)) return resData;
  if (resData && typeof resData === "object") {
    const o = resData as Record<string, unknown>;
    if (Array.isArray(o.calibration_response_maps)) return o.calibration_response_maps as any[];
    if (Array.isArray(o.maps)) return o.maps as any[];
    if (Array.isArray(o.data)) return o.data as any[];
  }
  return [];
}

function calibrationListHasRubricFlag(resData: unknown): boolean | null {
  if (!resData || typeof resData !== "object" || Array.isArray(resData)) return null;
  const v = (resData as Record<string, unknown>).has_review_rubric_for_calibration;
  if (v === true) return true;
  if (v === false) return false;
  return null;
}

function assignmentQuestionnairesHaveLinkedRubric(assignmentData: unknown): boolean {
  const aqs = (assignmentData as { assignment_questionnaires?: unknown })?.assignment_questionnaires;
  if (!Array.isArray(aqs)) return false;
  return aqs.some((aq: any) => {
    const qid = aq?.questionnaire?.id ?? aq?.questionnaire_id;
    return qid != null && qid !== "" && Number(qid) > 0;
  });
}

function calibrationResponseAssignmentId(res: { config?: { url?: string } } | undefined): string | null {
  const url = res?.config?.url ?? "";
  const m = url.match(/\/assignments\/([^/]+)\/calibration_response_maps(?:\?|$)/);
  return m ? m[1] : null;
}

function parseAssignmentIdFromCalibrationAddRequest(res: AxiosResponse): string | null {
  const base = res.config?.baseURL ?? "";
  const path = res.config?.url ?? "";
  const full = `${base}${path}`;
  const m = full.match(/\/assignments\/([^/?#]+)\/(?:add_calibration_participant|calibration_response_maps)(?:\?|$|#)/);
  return m ? m[1] : null;
}

function reviewedObjectIdFromAddBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const rm = (b.response_map ?? b.responseMap) as Record<string, unknown> | undefined;
  if (!rm || typeof rm !== "object") return null;
  const rid = rm.reviewed_object_id ?? rm.reviewedObjectId;
  if (rid == null) return null;
  return String(rid);
}

function calibrationTableRowFromAddBody(body: unknown, fallbackUsername: string): Record<string, unknown> | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const rm = (b.response_map ?? b.responseMap) as Record<string, unknown> | undefined;
  const mapId = rm?.id;
  if (mapId == null) return null;
  const p = b.participant as Record<string, unknown> | undefined;
  const u = (p?.user as Record<string, unknown> | undefined) ?? undefined;
  const participantName =
    (u?.full_name as string) ||
    (u?.fullName as string) ||
    (u?.name as string) ||
    (p?.name as string) ||
    fallbackUsername ||
    "Unknown";
  const team = b.team as Record<string, unknown> | undefined;
  const sc = b.submitted_content as Record<string, unknown> | undefined;
  return {
    id: mapId,
    participant_name: participantName,
    review_status: (rm.review_status as string) || (rm.reviewStatus as string) || "not_started",
    submitted_content: {
      hyperlinks: (Array.isArray(team?.hyperlinks) ? team?.hyperlinks : sc?.hyperlinks) || [],
      files: (Array.isArray(sc?.files) ? sc.files : []) || [],
    },
  };
}

/** Rubrics tab uses `weights[1]`, `weights[100]`, etc. — Formik often yields an object or sparse array; naive `.reduce` hits `undefined` and becomes NaN. */
function sumAssignmentRubricWeights(weights: unknown): number {
  if (weights == null) return 0;
  const add = (acc: number, v: unknown) => {
    if (v === "" || v === undefined || v === null) return acc;
    const n = typeof v === "number" ? v : Number(v);
    return acc + (Number.isFinite(n) ? n : 0);
  };
  if (Array.isArray(weights)) {
    return weights.reduce((acc, curr) => add(acc, curr), 0);
  }
  if (typeof weights === "object") {
    return Object.values(weights as Record<string, unknown>).reduce((acc, v) => add(acc, v), 0);
  }
  return 0;
}

function mergeAssignmentQuestionnaires(
  assignmentData: any,
  assignmentResponse: { data?: any } | undefined
): any[] {
  const fromLoader = Array.isArray(assignmentData?.assignment_questionnaires)
    ? assignmentData.assignment_questionnaires
    : [];
  const fromSave = Array.isArray(assignmentResponse?.data?.assignment_questionnaires)
    ? assignmentResponse.data.assignment_questionnaires
    : [];
  const seen = new Set<string>();
  const out: any[] = [];
  for (const aq of [...fromSave, ...fromLoader]) {
    if (!aq || typeof aq !== "object") continue;
    const id = (aq as { id?: unknown }).id;
    const qid = (aq as { questionnaire_id?: unknown }).questionnaire_id ?? (aq as { questionnaire?: { id?: unknown } }).questionnaire?.id;
    const key = id != null ? `id:${id}` : `q:${String(qid ?? "")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(aq);
  }
  return out;
}

/**
 * Any Rubrics-tab dropdown that is a real review round (not author/teammate rows 900+).
 */
function formHasCalibrationQuestionnaireSelection(formValues: Record<string, unknown>): boolean {
  for (const key of Object.keys(formValues)) {
    const m = /^questionnaire_round_(\d+)$/.exec(key);
    if (!m) continue;
    const rowId = Number(m[1]);
    if (!Number.isFinite(rowId) || rowId >= 900) continue;
    const raw = formValues[key];
    if (raw === undefined || raw === null || raw === "") continue;
    const n = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(n) && n > 0) return true;
  }
  return false;
}

/**
 * True if calibration can use the same rubric as Assignment#review_rubric_questionnaire.
 * Prefer the server flag; fall back to merged assignment_questionnaires and Formik rubric fields.
 */
function assignmentHasReviewQuestionnaireForCalibration(
  assignmentData: any,
  assignmentResponse: { data?: any } | undefined,
  formValues: Record<string, unknown>,
  calibrationListHasRubric: boolean | null
): boolean {
  if (calibrationListHasRubric === true) return true;
  if (assignmentResponse?.data?.has_review_rubric_for_calibration === true) return true;
  if (assignmentData?.has_review_rubric_for_calibration === true) return true;

  const list = mergeAssignmentQuestionnaires(assignmentData, assignmentResponse);
  const fromApi = list.some((aq: any) => {
    const qid = aq?.questionnaire?.id ?? aq?.questionnaire_id;
    return qid != null && qid !== "" && Number(qid) > 0;
  });
  if (fromApi) return true;

  return formHasCalibrationQuestionnaireSelection(formValues);
}

const AssignmentEditor: React.FC<IEditor> = ({ mode }) => {
  const { data: assignmentResponse, error: assignmentError, sendRequest } = useAPI();
  const { data: coursesResponse, error: coursesError, sendRequest: sendCoursesRequest } = useAPI();
  const { data: calibrationSubmissionsResponse, error: calibrationSubmissionsError, sendRequest: sendCalibrationSubmissionsRequest } = useAPI();
  // useAPI instance for adding calibration participant
  const { data: addParticipantResponse, error: addParticipantError, sendRequest: sendAddParticipantRequest } = useAPI();
  const { data: removeParticipantResponse, error: removeParticipantError, sendRequest: sendRemoveParticipantRequest } =
    useAPI();
  const [courses, setCourses] = useState<any[]>([]);
  const [calibrationSubmissions, setCalibrationSubmissions] = useState<any[]>([]);
  /** From GET calibration_response_maps (fresh per load); null = unknown / legacy array body. */
  const [calibrationListRubricReady, setCalibrationListRubricReady] = useState<boolean | null>(null);
  const [usernameSearch, setUsernameSearch] = useState<string>("");
  /** Set when Add is clicked so we accept the matching POST response even if URL/body shape varies. */
  const pendingCalibrationAddForAssignmentIdRef = useRef<string | null>(null);
  const lastCalibrationUsernameRef = useRef<string>("");

  const { data: topicsResponse, error: topicsApiError, sendRequest: fetchTopics } = useAPI();
  const { data: updateResponse, error: updateError, sendRequest: updateAssignment } = useAPI();
  const { data: deleteResponse, error: deleteError, sendRequest: deleteTopic } = useAPI();
  const { data: createResponse, error: createError, sendRequest: createTopic } = useAPI();
  const { data: updateTopicResponse, error: updateTopicError, sendRequest: updateTopic } = useAPI();
  const { data: dropTeamResponse, error: dropTeamError, sendRequest: dropTeamRequest } = useAPI();



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
        // Controlled <select> only has options "1"|"2"|"3"; "" breaks syncing and saves.
        if (key === "review_strategy" && (value === "" || value === null || value === undefined)) {
          merged[key] = initialValues.review_strategy;
        }
      }
    );

    // Prefer DB column `review_assignment_strategy` when present so we never show a stale
    // `review_strategy` after React Router serves cached loader data or partial shapes omit it.
    const apiStrategy = merged.review_assignment_strategy;
    const hasApiStrategy =
      apiStrategy !== undefined && apiStrategy !== null && String(apiStrategy).trim() !== "";
    merged.review_strategy = normalizeReviewStrategyForSelect(
      hasApiStrategy ? apiStrategy : merged.review_strategy
    );

    return merged as IAssignmentFormValues;
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [assignmentName, setAssignmentName] = useState("");


  useEffect(() => {
    if (assignmentResponse?.data) {
      setAssignmentName(assignmentResponse.data.name || "");
      // Load allow_bookmarks setting from backend
      if (assignmentResponse.data.allow_bookmarks !== undefined && assignmentResponse.data.advertising_for_partners_allowed !== undefined) {
        setTopicSettings(prev => ({ ...prev, allowBookmarks: assignmentResponse.data.allow_bookmarks, allowAdvertiseForPartners: assignmentResponse.data.advertising_for_partners_allowed }));
      }
    }
  }, [assignmentResponse]);

  useEffect(() => {
    if (assignmentError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: assignmentError }));
    }
  }, [assignmentError, dispatch]);

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
    setCalibrationListRubricReady(null);
    if (id) {
      sendCalibrationSubmissionsRequest({
        url: `/assignments/${id}/calibration_response_maps`,
        method: HttpMethod.GET,
      });
    }
  }, [id, sendCalibrationSubmissionsRequest]);

  // Handle calibration submissions response
  useEffect(() => {
    if (calibrationSubmissionsResponse && calibrationSubmissionsResponse.status >= 200 && calibrationSubmissionsResponse.status < 300) {
      const reqAid = calibrationResponseAssignmentId(calibrationSubmissionsResponse);
      if (reqAid != null && id != null && String(reqAid) !== String(id)) {
        return;
      }

      const body = calibrationSubmissionsResponse.data;
      let rubricFlag = calibrationListHasRubricFlag(body);
      if (rubricFlag === null) {
        if (Array.isArray(body)) {
          rubricFlag = assignmentQuestionnairesHaveLinkedRubric(assignmentData) ? true : null;
        } else if (body && typeof body === "object" && !("has_review_rubric_for_calibration" in body)) {
          rubricFlag = assignmentQuestionnairesHaveLinkedRubric(assignmentData) ? true : null;
        }
      }
      if (rubricFlag !== null) {
        setCalibrationListRubricReady(rubricFlag);
      }
      const rows = calibrationMapsPayloadToArray(calibrationSubmissionsResponse.data);
      const normalizedData = rows.map((raw: any) => {
        const participantName =
          raw?.participant_name ||
          raw?.reviewee?.user?.full_name ||
          raw?.reviewee?.user?.name ||
          raw?.reviewee?.user?.fullName ||
          raw?.reviewee?.user?.username ||
          raw?.reviewee?.name ||
          raw?.username ||
          raw?.name ||
          raw?.fullName ||
          raw?.user_name ||
          raw?.user?.username ||
          raw?.user?.name ||
          raw?.participant?.username ||
          raw?.participant?.user?.name ||
          raw?.participant?.name ||
          "";

        return {
          ...raw,
          participant_name: participantName,
          review_status: raw.review_status ?? "not_started",
          submitted_content: raw.submitted_content ?? { hyperlinks: [], files: [] },
        };
      });
      setCalibrationSubmissions(normalizedData);
    }
  }, [calibrationSubmissionsResponse, id, assignmentData]);

  // Show calibration submissions error message
  useEffect(() => {
    calibrationSubmissionsError && dispatch(alertActions.showAlert({ variant: "danger", message: calibrationSubmissionsError }));
  }, [calibrationSubmissionsError, dispatch]);

  // Explicit search handler — call backend only when Add is clicked
  const handleAddClick = useCallback(() => {
    if (!id) return;
    const username = usernameSearch.trim();

    if (!username) return; // button should be disabled, but guard anyway

    pendingCalibrationAddForAssignmentIdRef.current = String(id);
    lastCalibrationUsernameRef.current = username;
    sendAddParticipantRequest({
      url: `/assignments/${id}/add_calibration_participant`,
      method: HttpMethod.POST,
      data: {
        username,
      },
    });
  }, [id, usernameSearch, sendAddParticipantRequest]);

  // After Add: merge row from POST when possible, then always reload list from GET (source of truth).
  useEffect(() => {
    if (!addParticipantResponse || addParticipantResponse.status < 200 || addParticipantResponse.status >= 300) {
      return;
    }
    if (!id) return;

    const pending = pendingCalibrationAddForAssignmentIdRef.current;
    const urlAid = parseAssignmentIdFromCalibrationAddRequest(addParticipantResponse);
    const bodyAid = reviewedObjectIdFromAddBody(addParticipantResponse.data);

    const userInitiatedThisAssignment = pending === String(id);

    if (!userInitiatedThisAssignment) {
      return;
    }
    if (urlAid != null && String(urlAid) !== String(id)) {
      return;
    }
    if (bodyAid != null && bodyAid !== String(id)) {
      return;
    }

    pendingCalibrationAddForAssignmentIdRef.current = null;

    const merged = calibrationTableRowFromAddBody(
      addParticipantResponse.data,
      lastCalibrationUsernameRef.current
    );
    if (merged) {
      setCalibrationSubmissions((prev) => {
        if (prev.some((p) => String(p.id) === String(merged.id))) {
          return prev;
        }
        return [merged, ...prev];
      });
    }

    dispatch(alertActions.showAlert({ variant: 'success', message: 'Calibration participant added successfully' }));
    sendCalibrationSubmissionsRequest({
      url: `/assignments/${id}/calibration_response_maps`,
      method: HttpMethod.GET,
    });
    setUsernameSearch('');
  }, [addParticipantResponse, dispatch, id, sendCalibrationSubmissionsRequest]);

  useEffect(() => {
    if (addParticipantError) {
      pendingCalibrationAddForAssignmentIdRef.current = null;
      dispatch(alertActions.showAlert({ variant: 'danger', message: addParticipantError }));
    }
  }, [addParticipantError, dispatch]);

  const handleRemoveCalibrationClick = useCallback(
    (mapId: number) => {
      if (!id || !window.confirm("Are you sure you want to remove this calibration participant?")) return;

      sendRemoveParticipantRequest({
        url: `/assignments/${id}/calibration_response_maps/${mapId}`,
        method: HttpMethod.DELETE,
      });
    },
    [id, sendRemoveParticipantRequest]
  );

  useEffect(() => {
    if (!removeParticipantResponse || removeParticipantResponse.status < 200 || removeParticipantResponse.status >= 300) {
      return;
    }
    dispatch(alertActions.showAlert({ variant: "success", message: "Calibration participant removed successfully" }));
    sendCalibrationSubmissionsRequest({
      url: `/assignments/${id}/calibration_response_maps`,
      method: HttpMethod.GET,
    });
  }, [removeParticipantResponse, dispatch, id, sendCalibrationSubmissionsRequest]);

  useEffect(() => {
    if (removeParticipantError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: removeParticipantError }));
    }
  }, [removeParticipantError, dispatch]);

  const onSubmit = (
    values: IAssignmentFormValues,
    submitProps: FormikHelpers<IAssignmentFormValues>
  ) => {

    // Rubrics weights must total 100% when any weight field has a value (handles object + sparse arrays).
    const totalWeight = sumAssignmentRubricWeights(values.weights);
    if (totalWeight > 0 && totalWeight !== 100) {
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

  // calibration notes removed; keep only username search field
  // small username search field (prefill empty)
  formInitialValues.calibration_username_search = '';

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
                              id: 1,
                              title: "Review rubric:",
                              questionnaire_options: questionnaireOptions,
                              selected_questionnaire: roundSelections[1]?.id,
                              questionnaire_type: 'dropdown',
                            },
                            {
                              id: 2,
                              title: "Add tag prompts",
                              questionnaire_type: 'tag_prompts',
                            }
                          ];
                        })(),
                        // IDs must not collide with review round 1 (`questionnaire_round_1`). When
                        // number_of_review_rounds is 0, (0+1) was 1 and overwrote the real review rubric field.
                        {
                          id: 901,
                          title: "Author feedback:",
                          questionnaire_options: [{ label: 'Standard author feedback', value: 'Standard author feedback' }],
                          questionnaire_type: 'dropdown',
                        },
                        {
                          id: 902,
                          title: "Add tag prompts",
                          questionnaire_type: 'tag_prompts',
                        },
                        {
                          id: 903,
                          title: "Teammate review:",
                          questionnaire_options: [{ label: 'Review with Github metrics', value: 'Review with Github metrics' }],
                          questionnaire_type: 'dropdown',
                        },
                        {
                          id: 904,
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
                <Tab eventKey="tab-review-strategy" title="Review strategy">
                  <div style={{ marginTop: '20px' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', columnGap: '10px' }}>
                    <label className="form-label">Review strategy:</label>
                    <FormSelect
                      controlId="assignment-review_strategy"
                      name="review_strategy"
                      options={[
                        { label: "Review Strategy 1", value: "1" },
                        { label: "Review Strategy 2", value: "2" },
                        { label: "Review Strategy 3", value: "3" },
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
                  {!assignmentHasReviewQuestionnaireForCalibration(
                    assignmentData,
                    assignmentResponse,
                    formik.values as Record<string, unknown>,
                    calibrationListRubricReady
                  ) && (
                    <Alert variant="warning" className="mt-2">
                      Link a <strong>review questionnaire</strong> on the <strong>Rubrics</strong> tab (round 1 for a
                      single review round) and save the assignment. Without it, Begin / save calibration review will fail.
                    </Alert>
                  )}
                  {calibrationSubmissions.length === 0 && (
                    <Alert variant="info" className="mt-2">
                      <strong>Begin</strong> appears on each row after you add a calibration participant: enter a student’s{" "}
                      <strong>username</strong> above and click <strong>Add</strong>. Then use <strong>Begin</strong> in the
                      Review column for that row.
                    </Alert>
                  )}
                  <Field name="calibration_username_search">
                    {({ field, form }: any) => {
                      return (
                        <div style={{ marginTop: '10px', marginBottom: '10px', maxWidth: '200px' }}>
                          <div className="form-label">Search by username</div>
                          <InputGroup style={{ marginTop: '6px' }}>
                            <RBForm.Control
                              type="text"
                              placeholder="Enter username"
                              {...field}
                              onChange={(e: any) => {
                                const v = e.target.value;
                                form.setFieldValue(field.name, v);
                                setUsernameSearch(v.trim());
                              }}
                              aria-label="Calibration username"
                              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, height: '38px' }}
                            />
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={handleAddClick}
                              disabled={!usernameSearch}
                              title="Add calibration participant"
                              aria-label="Add calibration participant"
                              style={{
                                margin: 0,
                                whiteSpace: 'nowrap',
                                height: '38px',
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                                padding: '0 10px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              Add
                            </Button>
                          </InputGroup>
                        </div>
                      );
                    }}
                  </Field>
                  <h3>Select participants for submitting calibration artifacts</h3>

                  <div>
                    <div style={{ display: 'ruby', marginTop: '30px' }}>
                      <Table
                        showColumnFilter={false}
                        showGlobalFilter={false}
                        showPagination={false}
                        data={[
                          ...calibrationSubmissions.map((calibrationSubmission: any) => {
                            const pName =
                              calibrationSubmission.participant_name ||
                              calibrationSubmission.username ||
                              calibrationSubmission.name ||
                              calibrationSubmission.fullName ||
                              calibrationSubmission.user?.username ||
                              calibrationSubmission.user?.name ||
                              calibrationSubmission.participant?.username ||
                              calibrationSubmission.participant?.user?.name ||
                              calibrationSubmission.participant?.name ||
                              "";

                            return {
                              id: calibrationSubmission.id,
                              participant_name: pName,
                              review_status: calibrationSubmission.review_status || "not_started",
                              submitted_content: calibrationSubmission.submitted_content || { hyperlinks: [], files: [] },
                            };
                          }),
                        ]}
                        columns={[
                          {
                            accessorKey: "participant_name",
                            header: "Participant name",
                            enableSorting: false,
                            enableColumnFilter: false,
                            cell: ({ row }) => <>Team_{row.original.participant_name}</>
                          },
                          {
                            cell: ({ row }) => {
                              const calLink = `/assignments/edit/${assignmentData.id}/calibration/${row.original.id}`;
                              const reviewLink = `${calLink}/review`;
                              const linkStyle = { color: "#986633", textDecoration: "none", cursor: "pointer" } as const;

                              const handleBeginClick = async (e: React.MouseEvent) => {
                                e.preventDefault();
                                try {
                                  const res = await axiosClient.post(
                                    `/assignments/${assignmentData.id}/calibration_response_maps/${row.original.id}/begin`
                                  );
                                  const path =
                                    res.data &&
                                    typeof res.data === "object" &&
                                    "redirect_to" in res.data &&
                                    typeof (res.data as { redirect_to?: unknown }).redirect_to === "string"
                                      ? (res.data as { redirect_to: string }).redirect_to
                                      : reviewLink;
                                  navigate(path);
                                  sendCalibrationSubmissionsRequest({
                                    url: `/assignments/${assignmentData.id}/calibration_response_maps`,
                                    method: HttpMethod.GET,
                                  });
                                } catch (err) {
                                  console.error("Failed to begin calibration:", err);
                                  alert("Failed to begin calibration. Please try again.");
                                }
                              };

                              if (row.original.review_status === "not_started") {
                                return (
                                  <a style={linkStyle} onClick={handleBeginClick} href={reviewLink}>
                                    Begin
                                  </a>
                                );
                              }
                              return (
                                <div style={{ display: "flex", alignItems: "center", columnGap: "5px" }}>
                                  <Link style={linkStyle} to={calLink} title="Comparison charts vs instructor gold standard">
                                    View
                                  </Link>
                                  |
                                  <Link style={linkStyle} to={reviewLink} title="Enter or edit instructor review">
                                    Edit
                                  </Link>
                                </div>
                              );
                            },
                            accessorKey: "action",
                            header: "Review",
                            enableSorting: false,
                            enableColumnFilter: false,
                          },
                          {
                            cell: ({ row }) => {
                              const reportLink = `/assignments/edit/${assignmentData.id}/calibration/${row.original.id}`;
                              const linkStyle = { color: "#986633", textDecoration: "none" } as const;
                              const st = row.original.review_status;
                              const showReport =
                                st === "Completed" || st === "submitted" || st === "completed";
                              if (showReport) {
                                return (
                                  <Link style={linkStyle} to={reportLink}>
                                    View review report
                                  </Link>
                                );
                              }
                              return null;
                            },
                            accessorKey: "calibration_report",
                            header: "Report",
                            enableSorting: false,
                            enableColumnFilter: false,
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
                                    const label = typeof item === 'string' ? item : String(item);
                                    return (
                                      <span style={{ color: '#986633' }} key={index} className="text-break">
                                        {fileDisplayName(label)}
                                      </span>
                                    );
                                  })
                                }
                              </div>
                            </>,
                            accessorKey: "submitted_content", header: "Submitted items(s)", enableSorting: false, enableColumnFilter: false
                          },
                          {
                            cell: ({ row }) => (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveCalibrationClick(row.original.id)}
                              >
                                Remove
                              </Button>
                            ),
                            accessorKey: "remove_calibration",
                            header: "",
                            enableSorting: false,
                            enableColumnFilter: false,
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

              <div className="mt-3 d-flex justify-content-start gap-2" style={{ alignItems: 'center' }}>
                <Button type="submit" variant="outline-secondary">
                  Save
                </Button> |
                <a href="/assignments" style={{ color: '#a4a366', textDecoration: 'none' }}>Back</a>
              </div>
            </Form>
          )
        }
        }
      </Formik>
    </div >

  );
};

export default AssignmentEditor;
