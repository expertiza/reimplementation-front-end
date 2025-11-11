import { IAssignmentRequest, IAssignmentResponse } from "../../utils/interfaces";
import axiosClient from "../../utils/axios_client";

export interface IAssignmentFormValues {
  id?: number;
  name: string;
  directory_path: string;
  spec_location: string;
  private: boolean;
  show_template_review: boolean;
  require_quiz: boolean;
  has_badge: boolean;
  staggered_deadline: boolean;
  is_calibrated: boolean;
  has_teams?: boolean;
  max_team_size?: number;
  show_teammate_review?: boolean;
  is_pair_programming?: boolean;
  has_mentors?: boolean;
  has_topics?: boolean;
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
  days_between_submissions?: number;
  late_policy_id?: number;
  is_penalty_calculated?: boolean;
  calculate_penalty?: boolean;
  use_signup_deadline?: boolean;
  use_drop_topic_deadline?: boolean;
  use_team_formation_deadline?: boolean;
  weights?: number[];
  notification_limits?: number[];
  use_date_updater?: boolean[];
  submission_allowed?: boolean[];
  review_allowed?: boolean[];
  teammate_allowed?: boolean[];
  metareview_allowed?: boolean[];
  reminder?: number[];
}


export const transformAssignmentRequest = (values: IAssignmentFormValues) => {
  const assignment: IAssignmentRequest = {
    name: values.name,
    directory_path: values.directory_path,
    spec_location: values.spec_location,
    private: values.private,
    show_template_review: values.show_template_review,
    require_quiz: values.require_quiz,
    has_badge: values.has_badge,
    staggered_deadline: values.staggered_deadline,
    is_calibrated: values.is_calibrated,

  };
  console.log(assignment);
  return JSON.stringify(assignment);
};

export const transformAssignmentResponse = (assignmentResponse: string) => {
  const assignment: IAssignmentResponse = JSON.parse(assignmentResponse);
  const assignmentValues: IAssignmentFormValues = {
    id: assignment.id,
    name: assignment.name,
    directory_path: assignment.directory_path,
    spec_location: assignment.spec_location,
    private: assignment.private,
    show_template_review: assignment.show_template_review,
    require_quiz: assignment.require_quiz,
    has_badge: assignment.has_badge,
    staggered_deadline: assignment.staggered_deadline,
    is_calibrated: assignment.is_calibrated,

  };
  return assignmentValues;
};

export async function loadAssignment({ params }: any) {
  let assignmentData = {};
  // if params contains id, then we are editing a user, so we need to load the user data
  if (params.id) {
    const userResponse = await axiosClient.get(`/assignments/${params.id}`, {
      transformResponse: transformAssignmentResponse,
    });
    assignmentData = await userResponse.data;
  }

  return assignmentData;
}

