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
  review_rubric_varies_by_round?: boolean;
  review_rubric_varies_by_topic?: boolean;
  review_rubric_varies_by_role?: boolean;
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
  // Rubric weights / notification limits
  weights?: number[];
  notification_limits?: number[];
  use_date_updater?: boolean[];
  // Per-deadline permissions
  submission_allowed?: boolean[];
  review_allowed?: boolean[];
  teammate_allowed?: boolean[];
  metareview_allowed?: boolean[];
  reminder?: number[];
   // Misc flags from the form
  allow_tag_prompts?: boolean;
  course_id?: number;
  has_quizzes?: boolean;
  calibration_for_training?: boolean;
  available_to_students?: boolean;
  allow_topic_suggestion_from_students?: boolean;
  enable_bidding_for_topics?: boolean;
  enable_bidding_for_reviews?: boolean;
  enable_authors_to_review_other_topics?: boolean;
  allow_reviewer_to_choose_topic_to_review?: boolean;
  allow_participants_to_create_bookmarks?: boolean;
  auto_assign_mentors?: boolean;
  staggered_deadline_assignment?: boolean;
  // These are used only in tables; keep them loose
  questionnaire?: any;
  date_time?: any[];
  due_dates?: { id: number; deadline_type_id: number; round?: number }[];
  assignment_questionnaires?: {
    id: number;
    used_in_round?: number;
    questionnaire?: { id: number; name: string };
  }[];
  [key: string]: any;
}


export const transformAssignmentRequest = (values: IAssignmentFormValues) => {
  // Build nested attributes for assignment_questionnaires from the per-round form fields to create or update corresponding rows
  const assignmentQuestionnaires: { id?: number; questionnaire_id: number; used_in_round: number }[] = [];
  const roundCount = values.number_of_review_rounds ?? 0;
  for (let i = 1; i <= roundCount; i += 1) {
    const questionnaireId = values[`questionnaire_round_${i}`];
    if (questionnaireId) {
      const existingId = values[`assignment_questionnaire_id_${i}`];
      assignmentQuestionnaires.push({
        id: existingId,
        questionnaire_id: questionnaireId,
        used_in_round: i,
      });
    }
  }

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
    review_rubric_varies_by_round: values.review_rubric_varies_by_round ?? false,
    review_rubric_varies_by_topic: values.review_rubric_varies_by_topic ?? false,
    review_rubric_varies_by_role: values.review_rubric_varies_by_role ?? false,
    has_max_review_limit: values.has_max_review_limit ?? false,
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
    is_penalty_calculated: values.is_penalty_calculated ?? false,
    calculate_penalty: values.calculate_penalty ?? false,
    apply_late_policy: values.apply_late_policy ?? false,

    // Deadline toggles
    use_signup_deadline: values.use_signup_deadline ?? false,
    use_drop_topic_deadline: values.use_drop_topic_deadline ?? false,
    use_team_formation_deadline: values.use_team_formation_deadline ?? false,

    // JSON-configured deadline settings (default to empty arrays so backend always sees a consistent shape)
    weights: values.weights ?? [],
    notification_limits: values.notification_limits ?? [],
    use_date_updater: values.use_date_updater ?? [],
    submission_allowed: values.submission_allowed ?? [],
    review_allowed: values.review_allowed ?? [],
    teammate_allowed: values.teammate_allowed ?? [],
    metareview_allowed: values.metareview_allowed ?? [],
    reminder: values.reminder ?? [],

    // Misc flags from other tabs
    allow_tag_prompts: values.allow_tag_prompts ?? false,
    has_quizzes: values.has_quizzes ?? false,
    calibration_for_training: values.calibration_for_training ?? false,
    available_to_students: values.available_to_students ?? false,
    allow_topic_suggestion_from_students: values.allow_topic_suggestion_from_students ?? false,
    enable_bidding_for_topics: values.enable_bidding_for_topics ?? false,
    enable_bidding_for_reviews: values.enable_bidding_for_reviews ?? false,
    enable_authors_to_review_other_topics: values.enable_authors_to_review_other_topics ?? false,
    allow_reviewer_to_choose_topic_to_review: values.allow_reviewer_to_choose_topic_to_review ?? false,
    allow_participants_to_create_bookmarks: values.allow_participants_to_create_bookmarks ?? false,
    staggered_deadline_assignment: values.staggered_deadline_assignment ?? false,

    // Per-round rubric configuration
    vary_by_round: values.review_rubric_varies_by_round,
    rounds_of_reviews: values.number_of_review_rounds,
    assignment_questionnaires_attributes: assignmentQuestionnaires,

  };
  return JSON.stringify({ assignment });
};

export const transformAssignmentResponse = (assignmentResponse: string) => {
  const assignment: IAssignmentResponse = JSON.parse(assignmentResponse);

  // Map legacy DueDate records to the form's date_time[...] structure so
  // date pickers are pre-filled when editing.
  const dateTimeMap: Record<string | number, Date> = {};
  const dueDates: any[] = (assignment as any).due_dates || [];

  dueDates.forEach((due: any) => {
    const dueAt: string | undefined = due.due_at;
    if (!dueAt) return;

    const dueDateObj = new Date(dueAt);

    // Round-based submission / review rows
    if (typeof due.round === "number") {
      const roundIndex = due.round; // 1-based
      const isReviewDeadline = due.deadline_type_id === 2; // DueDate::REVIEW_DEADLINE_TYPE_ID
      const rowId = isReviewDeadline
        ? 2 * (roundIndex - 1) + 1 // "Review i: Review"
        : 2 * (roundIndex - 1); // "Review i: Submission"
      dateTimeMap[rowId] = dueDateObj;
      return;
    }

    // Named deadlines (signup / drop-topic / team-formation)
    const name: string = due.deadline_name || "";
    let key: string | null = null;
    if (/signup/i.test(name)) key = "signup_deadline";
    else if (/drop\s*topic/i.test(name)) key = "drop_topic_deadline";
    else if (/team\s*formation/i.test(name)) key = "team_formation_deadline";

    if (key) {
      dateTimeMap[key] = dueDateObj;
    }
  });

  const assignmentValues: IAssignmentFormValues = {
    // bring in all persisted columns (booleans, JSON fields, etc.)
    ...(assignment as any),

    // ensure core fields match our form naming
    id: assignment.id,
    name: assignment.name,
    directory_path: assignment.directory_path,
    spec_location: assignment.spec_location,
    private: assignment.private,
    show_template_review: assignment.show_template_review ?? false,
    require_quiz: assignment.require_quiz,
    has_badge: assignment.has_badge,
    staggered_deadline: assignment.staggered_deadline,
    is_calibrated: assignment.is_calibrated,

    // review rounds / rubrics
    review_rubric_varies_by_round:
      assignment.varying_rubrics_by_round ?? assignment.vary_by_round,
    number_of_review_rounds: assignment.num_review_rounds,

    // precomputed date/time fields for the Due dates tab
    date_time: dateTimeMap as any,

    // nested collections used by tabs
    due_dates: assignment.due_dates,
    assignment_questionnaires: assignment.assignment_questionnaires,
  };
  return assignmentValues;
};

export async function loadAssignment({ params }: any) {
  let assignmentData = {};
  let questionnaires = []; // fetch questionnaire list for dropdown window selections in Rubrics tab

  // if params contains id, then we are editing a user, so we need to load the user data
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
