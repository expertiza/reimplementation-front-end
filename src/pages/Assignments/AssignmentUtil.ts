import axiosClient from "../../utils/axios_client";

export interface IAssignmentFormValues {
  id?: number;
  instructor_id: number;
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
}


export async function loadAssignment({ params }: any) {
  let assignmentData = {};
  // if params contains id, then we are editing a user, so we need to load the user data
  if (params.id) {
    const userResponse = await axiosClient.get(`/assignments/${params.id}`);
    assignmentData = await userResponse.data;
  }

  return assignmentData;
}

