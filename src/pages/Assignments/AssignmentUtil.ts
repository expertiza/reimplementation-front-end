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
    max_team_size: 999 //placeholder
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

