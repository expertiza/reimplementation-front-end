import { IAssignmentRequest, IAssignmentResponse } from "../../utils/interfaces";
import axiosClient from "../../utils/axios_client";

export interface IAssignmentFormValues {
  id?: number;
  name: string;
  directory_path: string;
  spec_location:string;
  private:boolean;
  show_template_review: boolean;
  require_quiz:boolean;
  has_badge:boolean;
  staggered_deadline:boolean;
  is_calibrated:boolean;
  max_team_size: number; 
}


export const transformAssignmentRequest = (values: IAssignmentFormValues) => {
  const assignment: IAssignmentRequest = {
    name: values.name,
    directory_path: values.directory_path,
    spec_location:values.spec_location,
    private:values.private,
    show_template_review: values.show_template_review,
    require_quiz:values.require_quiz,
    has_badge:values.has_badge,
    staggered_deadline:values.staggered_deadline,
    is_calibrated:values.is_calibrated,
     submitter_count: values.submitter_count,
    num_reviews: values.num_reviews,
    num_review_of_reviews: values.num_review_of_reviews,
    num_review_of_reviewers: values.num_review_of_reviewers,
    num_reviewers: values.num_reviewers,
    max_team_size: values.max_team_size,
    days_between_submissions: values.days_between_submissions,
    review_assignment_strategy: values.review_assignment_strategy,
    max_reviews_per_submission: values.max_reviews_per_submission,
    review_topic_threshold: values.review_topic_threshold,
    rounds_of_reviews: values.rounds_of_reviews,
    num_quiz_questions: values.num_quiz_questions,
    late_policy_id: values.late_policy_id,
    max_bids: values.max_bids,
    reviews_visible_to_all: values.reviews_visible_to_all,
    allow_suggestions: values.allow_suggestions,
    copy_flag: values.copy_flag,
    microtask: values.microtask,
    is_coding_assignment: values.is_coding_assignment,
    is_intelligent: values.is_intelligent,
    calculate_penalty: values.calculate_penalty,
    is_penalty_calculated: values.is_penalty_calculated,
    availability_flag: values.availability_flag,
    use_bookmark: values.use_bookmark,
    can_review_same_topic: values.can_review_same_topic,
    can_choose_topic_to_review: values.can_choose_topic_to_review,
  };
  return assignment;
};

    
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
    spec_location:assignment.spec_location,
    private:assignment.private,
    show_template_review: assignment.show_template_review,
    require_quiz:assignment.require_quiz,
    has_badge:assignment.has_badge,
    staggered_deadline:assignment.staggered_deadline,
    is_calibrated:assignment.is_calibrated,
    
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

