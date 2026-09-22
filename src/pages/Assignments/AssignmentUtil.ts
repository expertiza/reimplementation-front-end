import { IAssignmentRequest, IAssignmentResponse } from "../../utils/interfaces";
import axiosClient from "../../utils/axios_client";

export interface IAssignmentFormValues {
  id?: number;
  instructor_id?: number;
  name: string;
  directory_path: string;
  spec_location: string;
  private: boolean;
  show_template_review: boolean;
  require_quiz: boolean;
  has_badge: boolean;
  staggered_deadline: boolean;
  is_calibrated: boolean;
  // Teams / mentors / topics
  has_teams?: boolean;
  max_team_size?: number;
  show_teammate_review?: boolean;
  is_pair_programming?: boolean;
  has_mentors?: boolean;
  has_topics?: boolean;
  // Review strategy / limits
  review_topic_threshold?: number;
  maximum_number_of_reviews_per_submission?: number;
  review_strategy?: string;
  instructor_grade_min_score?: number | null;
  instructor_grade_max_score?: number | null;
  review_rubric_varies_by_round?: boolean;
  review_rubric_varies_by_topic?: boolean;
  review_rubric_varies_by_role?: boolean;
  is_role_based?: boolean;
  has_max_review_limit?: boolean;
  set_allowed_number_of_reviews_per_reviewer?: number;
  set_required_number_of_reviews_per_reviewer?: number;
  is_review_anonymous?: boolean;
  is_review_done_by_teams?: boolean;
  allow_self_reviews?: boolean;
  reviews_visible_to_other_reviewers?: boolean;
  number_of_review_rounds?: number;
  // Dates / penalties
  days_between_submissions?: number;
  late_policy_id?: number;
  is_penalty_calculated?: boolean;
  calculate_penalty?: boolean;
  apply_late_policy?: boolean;
  // Deadline toggles
  use_signup_deadline?: boolean;
  use_drop_topic_deadline?: boolean;
  use_team_formation_deadline?: boolean;
  // Rubric weights / notification limits / display style
  weights?: number[];
  notification_limits?: number[];
  dropdowns?: boolean[];
  use_date_updater?: boolean[];
   // Misc flags from the form
  allow_tag_prompts?: boolean;
  course_id?: number;
  available_to_students?: boolean;
  allow_topic_suggestion_from_students?: boolean;
  enable_bidding_for_topics?: boolean;
  enable_bidding_for_reviews?: boolean;
  enable_authors_to_review_other_topics?: boolean;
  allow_reviewer_to_choose_topic_to_review?: boolean;
  allow_participants_to_create_bookmarks?: boolean;
  auto_assign_mentors?: boolean;
  staggered_deadline_assignment?: boolean;
  // Rubrics tab
  is_peer_reviewed?: boolean;
  review_questionnaire_id?: number;
  review_questionnaire_dropdown?: boolean;
  author_feedback_questionnaire_id?: number;
  author_feedback_questionnaire_dropdown?: boolean;
  teammate_questionnaire_id?: number;
  teammate_questionnaire_dropdown?: boolean;
  bookmark_questionnaire_id?: number;
  bookmark_questionnaire_dropdown?: boolean;
  // These are used only in tables; keep them loose
  questionnaire?: any;
  date_time?: Record<string | number, Date | null>;
  due_dates?: { id: number; deadline_type_id: number; round?: number }[];
  assignment_questionnaires?: {
    id: number;
    used_in_round?: number;
    questionnaire?: { id: number; name: string };
  }[];
  [key: string]: any;
}

const DEADLINE_TYPE = {
  SUBMISSION: 1,
  REVIEW: 2,
  DROP_TOPIC: 7,
  SIGNUP: 8,
  TEAM_FORMATION: 9,
} as const;

const ALLOWED = 3;

type DueDateAttr = {
  id?: number;
  deadline_type_id: number;
  due_at?: string;
  round?: number;
  submission_allowed_id: number;
  review_allowed_id: number;
  teammate_review_allowed_id: number;
};

export type RubricEntry = {
  id?: number;
  questionnaire_id: number;
  used_in_round: number;
  questionnaire_weight: number;
  notification_limit: number;
  dropdown: boolean;
};

function buildRubricAttributes(values: IAssignmentFormValues): (RubricEntry | { id: number; _destroy: true })[] {
  const rubrics: RubricEntry[] = [];
  const roundCount = values.number_of_review_rounds ?? 1;
  const variesByRound = values.review_rubric_varies_by_round && roundCount > 1;

  if (values.is_peer_reviewed !== false) {
    if (variesByRound) {
      for (let i = 1; i <= roundCount; i++) {
        const qId = values[`questionnaire_round_${i}`];
        if (qId) {
          rubrics.push({
            id: values[`assignment_questionnaire_id_${i}`],
            questionnaire_id: Number(qId),
            used_in_round: i,
            questionnaire_weight: values[`review_round_${i}_weight`] ?? 0,
            notification_limit: values[`review_round_${i}_notification_limit`] ?? 0,
            dropdown: values[`review_round_${i}_dropdown`] ?? false,
          });
        }
      }
    } else if (values.review_questionnaire_id) {
      rubrics.push({
        id: values.review_assignment_questionnaire_id,
        questionnaire_id: Number(values.review_questionnaire_id),
        used_in_round: 1,
        questionnaire_weight: values.review_questionnaire_weight ?? 0,
        notification_limit: values.review_questionnaire_notification_limit ?? 0,
        dropdown: values.review_questionnaire_dropdown ?? false,
      });
    }
  }

  if (values.author_feedback_questionnaire_id) {
    rubrics.push({
      id: values.author_feedback_assignment_questionnaire_id,
      questionnaire_id: Number(values.author_feedback_questionnaire_id),
      used_in_round: 0,
      questionnaire_weight: values.author_feedback_questionnaire_weight ?? 0,
      notification_limit: values.author_feedback_questionnaire_notification_limit ?? 0,
      dropdown: values.author_feedback_questionnaire_dropdown ?? false,
    });
  }
  if (values.has_teams && values.teammate_questionnaire_id) {
    rubrics.push({
      id: values.teammate_assignment_questionnaire_id,
      questionnaire_id: Number(values.teammate_questionnaire_id),
      used_in_round: 0,
      questionnaire_weight: values.teammate_questionnaire_weight ?? 0,
      notification_limit: values.teammate_questionnaire_notification_limit ?? 0,
      dropdown: values.teammate_questionnaire_dropdown ?? false,
    });
  }
  if (values.allow_participants_to_create_bookmarks && values.bookmark_questionnaire_id) {
    rubrics.push({
      id: values.bookmark_assignment_questionnaire_id,
      questionnaire_id: Number(values.bookmark_questionnaire_id),
      used_in_round: 0,
      questionnaire_weight: values.bookmark_questionnaire_weight ?? 0,
      notification_limit: values.bookmark_questionnaire_notification_limit ?? 0,
      dropdown: values.bookmark_questionnaire_dropdown ?? false,
    });
  }

  // Destroy any existing records not in the kept set (prevents duplicates on repeated saves)
  const keptIds = new Set(rubrics.map((r) => r.id).filter((id): id is number => id != null));
  const destroyEntries = (values.assignment_questionnaires || [])
    .filter((aq: any) => !keptIds.has(aq.id))
    .map((aq: any) => ({ id: aq.id, _destroy: true as const }));

  return [...rubrics, ...destroyEntries];
}

const toAllowedId = (v: string | undefined): number => {
  const n = Number(v);
  return n === 1 || n === 2 || n === 3 ? n : ALLOWED;
};

function buildDueDateAttributes(values: IAssignmentFormValues): DueDateAttr[] {
  const dateTime = values.date_time || {};
  const numRounds = values.number_of_review_rounds ?? 1;
  const existingDueDates: any[] = values.due_dates || [];
  const subMap = values.submission_allowed as Record<string | number, string> | undefined;
  const revMap = values.review_allowed as Record<string | number, string> | undefined;
  const teamMap = values.teammate_allowed as Record<string | number, string> | undefined;

  const findExistingId = (typeId: number, round?: number): number | undefined =>
    existingDueDates.find((d: any) =>
      d.deadline_type_id === typeId && (round == null ? !d.round : d.round === round)
    )?.id;

  const attrs: DueDateAttr[] = [];

  for (let i = 0; i < numRounds; i++) {
    const round = i + 1;
    const submissionDate = dateTime[2 * i];
    if (submissionDate) {
      const rowId = 2 * i;
      attrs.push({
        id: findExistingId(DEADLINE_TYPE.SUBMISSION, round),
        deadline_type_id: DEADLINE_TYPE.SUBMISSION,
        due_at: new Date(submissionDate).toISOString(),
        round,
        submission_allowed_id: toAllowedId(subMap?.[rowId]),
        review_allowed_id: toAllowedId(revMap?.[rowId]),
        teammate_review_allowed_id: toAllowedId(teamMap?.[rowId]),
      });
    }
    const reviewDate = dateTime[2 * i + 1];
    if (reviewDate) {
      const rowId = 2 * i + 1;
      attrs.push({
        id: findExistingId(DEADLINE_TYPE.REVIEW, round),
        deadline_type_id: DEADLINE_TYPE.REVIEW,
        due_at: new Date(reviewDate).toISOString(),
        round,
        submission_allowed_id: toAllowedId(subMap?.[rowId]),
        review_allowed_id: toAllowedId(revMap?.[rowId]),
        teammate_review_allowed_id: toAllowedId(teamMap?.[rowId]),
      });
    }
  }

  const namedDeadlines: [string, number][] = [
    ['signup_deadline', DEADLINE_TYPE.SIGNUP],
    ['drop_topic_deadline', DEADLINE_TYPE.DROP_TOPIC],
    ['team_formation_deadline', DEADLINE_TYPE.TEAM_FORMATION],
  ];
  for (const [key, typeId] of namedDeadlines) {
    const date = dateTime[key];
    const existingId = findExistingId(typeId);
    // Include if a date is set (create/update) or if record already exists (update dropdowns only).
    // due_at is required by the backend, so omit it when there's no date and let the existing value stand.
    if (date || existingId) {
      attrs.push({
        id: existingId,
        deadline_type_id: typeId,
        ...(date ? { due_at: new Date(date).toISOString() } : {}),
        submission_allowed_id: toAllowedId(subMap?.[key]),
        review_allowed_id: toAllowedId(revMap?.[key]),
        teammate_review_allowed_id: toAllowedId(teamMap?.[key]),
      });
    }
  }

  return attrs;
}

export const transformAssignmentRequest = (values: IAssignmentFormValues): string => {
  const rubricAttrs = buildRubricAttributes(values);
  const dueDateAttrs = buildDueDateAttributes(values);

  const assignment: IAssignmentRequest = {
    // Core fields
    name: values.name,
    directory_path: values.directory_path,
    spec_location: values.spec_location,
    course_id: values.course_id,

    // Visibility / basic flags
    private: values.private,
    show_template_review: values.show_template_review ?? false,
    require_quiz: values.require_quiz ?? false,
    has_badge: values.has_badge ?? false,
    staggered_deadline: values.staggered_deadline ?? false,
    is_calibrated: values.is_calibrated ?? false,

    // Team / mentor / topic configuration
    has_teams: values.has_teams ?? false,
    max_team_size: values.max_team_size,
    show_teammate_review: values.show_teammate_review ?? false,
    is_pair_programming: values.is_pair_programming ?? false,
    has_mentors: values.has_mentors ?? false,
    has_topics: values.has_topics ?? false,
    auto_assign_mentors: values.auto_assign_mentors ?? false,

    // Review strategy / limits
    review_topic_threshold: values.review_topic_threshold,
    maximum_number_of_reviews_per_submission: values.maximum_number_of_reviews_per_submission,
    review_strategy: values.review_strategy,
    instructor_grade_min_score: values.instructor_grade_min_score ?? null,
    instructor_grade_max_score: values.instructor_grade_max_score ?? null,
    review_rubric_varies_by_round: values.review_rubric_varies_by_round ?? false,
    review_rubric_varies_by_topic: values.review_rubric_varies_by_topic ?? false,
    review_rubric_varies_by_role: values.review_rubric_varies_by_role ?? false,
    is_role_based: values.is_role_based ?? false,
    set_allowed_number_of_reviews_per_reviewer: values.set_allowed_number_of_reviews_per_reviewer,
    set_required_number_of_reviews_per_reviewer: values.set_required_number_of_reviews_per_reviewer,
    is_review_anonymous: values.is_review_anonymous ?? false,
    is_review_done_by_teams: values.is_review_done_by_teams ?? false,
    allow_self_reviews: values.allow_self_reviews ?? false,
    reviews_visible_to_other_reviewers: values.reviews_visible_to_other_reviewers ?? false,
    number_of_review_rounds: values.number_of_review_rounds,

    // Dates / penalties
    days_between_submissions: values.days_between_submissions,
    late_policy_id: values.late_policy_id,
    // apply_late_policy is the UI checkbox; persist it through is_penalty_calculated (the real DB column)
    is_penalty_calculated: values.apply_late_policy ?? false,
    calculate_penalty: values.calculate_penalty ?? false,

    // Deadline toggles
    use_signup_deadline: values.use_signup_deadline ?? false,
    use_drop_topic_deadline: values.use_drop_topic_deadline ?? false,
    use_team_formation_deadline: values.use_team_formation_deadline ?? false,

    // Misc flags
    allow_tag_prompts: values.allow_tag_prompts ?? false,
    available_to_students: values.available_to_students ?? false,
    allow_topic_suggestion_from_students: values.allow_topic_suggestion_from_students ?? false,
    enable_bidding_for_topics: values.enable_bidding_for_topics ?? false,
    enable_bidding_for_reviews: values.enable_bidding_for_reviews ?? false,
    enable_authors_to_review_other_topics: values.enable_authors_to_review_other_topics ?? false,
    allow_reviewer_to_choose_topic_to_review: values.allow_reviewer_to_choose_topic_to_review ?? false,
    allow_participants_to_create_bookmarks: values.allow_participants_to_create_bookmarks ?? false,
    staggered_deadline_assignment: values.staggered_deadline_assignment ?? false,

    ...(rubricAttrs.length > 0 && { assignment_questionnaires_attributes: rubricAttrs }),
    ...(dueDateAttrs.length > 0 && { due_dates_attributes: dueDateAttrs }),
  };

  return JSON.stringify({ assignment });
};

// Alias kept so existing imports in CreateAssignment.tsx continue to work
export const transformCreateRequest = transformAssignmentRequest;

export const transformAssignmentResponse = (assignmentResponse: string): IAssignmentFormValues => {
  const assignment: any = JSON.parse(assignmentResponse);

  // Build date_time and allowed maps from due_dates so the Due dates tab pre-fills on edit
  const dateTimeMap: Record<string | number, Date> = {};
  const submissionAllowedMap: Record<string | number, string> = {};
  const reviewAllowedMap: Record<string | number, string> = {};
  const teammateAllowedMap: Record<string | number, string> = {};

  for (const due of (assignment.due_dates || [])) {
    let rowKey: string | number;
    if (typeof due.round === 'number') {
      // Even row index = submission, odd = review; rows are 0-indexed, rounds are 1-indexed
      rowKey = due.deadline_type_id === DEADLINE_TYPE.REVIEW
        ? 2 * (due.round - 1) + 1
        : 2 * (due.round - 1);
    } else {
      const name: string = due.deadline_name || '';
      if (/signup/i.test(name)) rowKey = 'signup_deadline';
      else if (/drop[\s_]?topic/i.test(name)) rowKey = 'drop_topic_deadline';
      else if (/team[\s_]?formation/i.test(name)) rowKey = 'team_formation_deadline';
      else continue;
    }
    if (due.due_at) dateTimeMap[rowKey] = new Date(due.due_at);
    submissionAllowedMap[rowKey] = String(due.submission_allowed_id ?? ALLOWED);
    reviewAllowedMap[rowKey] = String(due.review_allowed_id ?? ALLOWED);
    teammateAllowedMap[rowKey] = String(due.teammate_review_allowed_id ?? ALLOWED);
  }

  const dueDateTypeIds = new Set((assignment.due_dates || []).map((d: any) => d.deadline_type_id));

  return {
    // Spread all persisted columns from API response
    ...assignment,
    // Handle legacy field names that older API responses may use
    review_rubric_varies_by_round: assignment.review_rubric_varies_by_round ?? assignment.vary_by_round,
    number_of_review_rounds: assignment.number_of_review_rounds ?? assignment.num_review_rounds,
    // Virtual fields not returned by the API
    show_template_review: assignment.show_template_review ?? false,
    is_role_based: assignment.is_role_based ?? false,
    // Derive from the actual limit value: positive integer means a limit was configured
    has_max_review_limit: (assignment.set_allowed_number_of_reviews_per_reviewer != null &&
                           assignment.set_allowed_number_of_reviews_per_reviewer > 0),
    // Derive from is_penalty_calculated: the DB boolean that corresponds to this UI toggle
    apply_late_policy: assignment.is_penalty_calculated ?? false,
    // Derive deadline toggle checkboxes from whether those due_date records exist
    use_signup_deadline: dueDateTypeIds.has(DEADLINE_TYPE.SIGNUP),
    use_drop_topic_deadline: dueDateTypeIds.has(DEADLINE_TYPE.DROP_TOPIC),
    use_team_formation_deadline: dueDateTypeIds.has(DEADLINE_TYPE.TEAM_FORMATION),
    // Computed fields for the Due dates tab
    date_time: dateTimeMap,
    submission_allowed: submissionAllowedMap,
    review_allowed: reviewAllowedMap,
    teammate_allowed: teammateAllowedMap,
  };
};

export async function loadAssignment({ params }: any) {
  let assignmentData = {};
  let questionnaires = []; // fetch questionnaire list for dropdown selections in Rubrics tab

  if (params.id) {
    try {
      const userResponse = await axiosClient.get(`/assignments/${params.id}`, {
        transformResponse: transformAssignmentResponse,
      });
      assignmentData = userResponse.data;
    } catch (error) {
      console.error("Error loading assignment:", error);
      assignmentData = { id: params.id };
    }
  }

  const questionnairesRes = await axiosClient.get("/questionnaires");
  questionnaires = questionnairesRes.data || [];

  return { ...assignmentData, questionnaires, weights: [] };
}
