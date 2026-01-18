/**
 * @author Ankur Mundra on June, 2023
 */

export interface IEditor {
  mode: "create" | "update";
}

export interface IRole {
  id?: number;
  name: string;
  parent_id: number;
}

export interface IInstitution {
  id?: number;
  name: string;
}

export interface IInstructor {
  id?: number;
  name: string;
}

export interface ITA {
  id?: number;
  name: string;
}

export interface IUserResponse {
  id: number;
  name: string;
  email: string;
  full_name: string;
  email_on_review: boolean;
  email_on_submission: boolean;
  email_on_review_of_review: boolean;
  role: { id: number; name: string };
  parent: { id: number | null; name: string | null };
  institution: { id: number | null; name: string | null };
  date_format_pref: string;
  created_at: string;
  updated_at: string;
}


export interface IParticipantResponse {
  id: number;
  name: string;
  email: string;
  full_name: string;
  email_on_review: boolean;
  email_on_submission: boolean;
  email_on_review_of_review: boolean;
  role: { id: number; name: string };
  parent: { id: number | null; name: string | null };
  institution: { id: number | null; name: string | null };
}

export interface IUserRequest {
  name: string;
  email: string;
  full_name: string;
  role_id: number;
  parent_id?: number | null;
  institution_id: number;
  email_on_review?: boolean;
  email_on_submission?: boolean;
  email_on_review_of_review?: boolean;
  date_format_pref?: string;
}

export interface IParticipantRequest {
  name: string;
  email: string;
  full_name: string;
  role_id: number;
  parent_id?: number | null;
  institution_id: number;
  email_on_review?: boolean;
  email_on_submission?: boolean;
  email_on_review_of_review?: boolean;
}
export interface IAssignmentRequest {
  // Core fields
  name: string;
  directory_path: string;
  spec_location: string;
  course_id?: number;

  // Visibility / basic flags
  private: boolean;
  show_template_review: boolean;
  require_quiz: boolean;
  has_badge: boolean;
  staggered_deadline: boolean;
  is_calibrated: boolean;

  // Team / mentor / topic configuration
  has_teams?: boolean;
  max_team_size?: number;
  show_teammate_review?: boolean;
  is_pair_programming?: boolean;
  has_mentors?: boolean;
  has_topics?: boolean;
  auto_assign_mentors?: boolean;

  // Review strategy / limits
  review_topic_threshold?: number;
  maximum_number_of_reviews_per_submission?: number;
  review_strategy?: string | number;
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

  // JSON-configured deadline settings
  weights?: number[];
  notification_limits?: number[];
  use_date_updater?: boolean[];
  submission_allowed?: any[];
  review_allowed?: any[];
  teammate_allowed?: any[];
  metareview_allowed?: any[];
  reminder?: any[];

  // Misc flags matching tabs
  allow_tag_prompts?: boolean;
  has_quizzes?: boolean;
  calibration_for_training?: boolean;
  available_to_students?: boolean;
  allow_topic_suggestion_from_students?: boolean;
  enable_bidding_for_topics?: boolean;
  enable_bidding_for_reviews?: boolean;
  enable_authors_to_review_other_topics?: boolean;
  allow_reviewer_to_choose_topic_to_review?: boolean;
  allow_participants_to_create_bookmarks?: boolean;
  staggered_deadline_assignment?: boolean;

  // Per-round rubric configuration
  vary_by_round?: boolean;
  rounds_of_reviews?: number;
  assignment_questionnaires_attributes?: {
    id?: number;
    questionnaire_id: number;
    used_in_round: number;
    questionnaire_weight?: number;
    notification_limit?: number;
    _destroy?: boolean;
  }[];
}

export interface ITAResponse {
  id: number;
  name: string;
  email: string;
  full_name: string;
  email_on_review: boolean;
  email_on_submission: boolean;
  email_on_review_of_review: boolean;
  role: { id: number; name: string };
  parent: { id: number | null; name: string | null };
  institution: { id: number | null; name: string | null };
}

export interface ITARequest {
  name: string;
}

export interface ILoggedInUser {
  id: number;
  name: string;
  full_name: string;
  role: string;
  institution_id: number;
}

export interface ICourseResponse{
  id: number;
  name: string;
  directory_path: string;
  info: string;
  private: boolean;
  created_at: Date;
  updated_at: Date;
  institution_id: number;
  instructor_id: number;
  institution: { id: number | null; name: string | null };
  instructor: { id: number | null; name: string | null };
  date_format_pref: string;
}

export interface ICourseRequest{
  name: string;
  directory_path: string;
  info: string;
  private: boolean;
  institution_id: number;
  instructor_id: number;
}

export interface IInstitutionResponse {
  id: number;
  name: string;
}

export interface IInstructorResponse {
  id: number;
  name: string;
}

export enum ROLE {
  SUPER_ADMIN = "Super Administrator",
  ADMIN = "Administrator",
  INSTRUCTOR = "Instructor",
  TA = "Teaching Assistant",
  STUDENT = "Student",
}

export interface IAssignmentResponse {
  id: number;
  name: string;
  course_id: number;
  courseName: string;
  created_at: Date; 
  updated_at: Date; 
  directory_path: string;
  spec_location:string;
  private:boolean;
  show_template_review: boolean;
  require_quiz:boolean;
  has_badge:boolean;
  staggered_deadline:boolean;
  is_calibrated:boolean;
  vary_by_round?: boolean;
  varying_rubrics_by_round?: boolean;
  rounds_of_reviews?: number;
  due_dates?: { id: number; deadline_type_id: number }[];
  assignment_questionnaires?: {
    id: number;
    used_in_round?: number;
    questionnaire?: { id: number; name: string };
  }[];
  num_review_rounds?: number;
  
}

export interface StudentTeamsProps { }

// Define the structure of a team member object
export interface TeamMember {
  username: string;
  fullName: string;
  email: string;
}

// Define the structure of the team details object
export interface TeamDetails {
  id: string;
  projectName: string;
  teamName: string;
  teamMembers: TeamMember[];
}

export interface Invitation {
  assignment_id: number;
  username: string;
  fullName?: string;
  status?: string;
}

// SignupSheet interfaces
export interface SignUpTopic {
  id: number;
  topic_name: string;
  topic_identifier: string;
  assignment_id: number;
  max_choosers: number;
  category: string;
  description?: string;
  micropayment?: number;
  private_to?: string;
  created_at: string;
  updated_at: string;
}

export interface SignedUpTeam {
  id: number;
  sign_up_topic_id: number;
  team_id: number;
  is_waitlisted: boolean;
  preference_priority_number?: number;
  comments_for_advertisement?: string;
  advertise_for_partner: boolean;
  created_at: string;
  updated_at: string;
  team?: {
    id: number;
    name: string;
    team_size: number;
    max_size?: number;
    parent_id: number;
    users?: Array<{
      id: number;
      name: string;
      full_name: string;
    }>;
  };
  sign_up_topic?: SignUpTopic;
}

export interface TopicWithTeams {
  topic: SignUpTopic;
  signedUpTeams: SignedUpTeam[];
  availableSlots: number;
  waitlistCount: number;
}

export interface AdvertisementDetails {
  signedUpTeam: SignedUpTeam;
  topic: SignUpTopic;
}

export interface JoinTeamRequest {
  id: number;
  comments: string;
  reply_status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  created_at: string;
  updated_at: string;
  participant: {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    handle: string;
  };
  team: {
    id: number;
    name: string;
    type: string;
    team_size: number;
    max_size: number | null;
    is_full: boolean;
  };
}

// Assuming that your transformation function for assignment responses might look like this
export const transformAssignmentResponse = (assignmentResponse: string): IAssignmentResponse => {
  const assignment: IAssignmentResponse = JSON.parse(assignmentResponse);
  // Transform response as needed
  return assignment;
};
