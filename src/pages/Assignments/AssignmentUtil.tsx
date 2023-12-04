import { IInstitution, IRole, IUserRequest, IUserResponse } from "../../utils/interfaces";

import { IFormOption } from "components/Form/interfaces";
import axiosClient from "../../utils/axios_client";

export interface IAssignmentRequest {
  id?: number;
  name: string; 
  description: string;
  dueDate: string; 
}

export interface IAssignmentResponse {
  id: number;
  name: string; 
  description: string;
  dueDate: string; 
  course_id: number;
  course_name:string;
}



export const transformAssignmentRequest = (values: IAssignmentRequest) => {
  const assignment: IAssignmentRequest = {
    name: values.name,
    description: values.description,
    dueDate: values.dueDate,
    
  };
  return JSON.stringify(assignment);
};

export const transformAssignmentResponse = (assignmentResponse: string) => {
  const assignment: IAssignmentResponse = JSON.parse(assignmentResponse);
  
  return assignment;
};


export enum EmailPreference {
  EMAIL_ON_REVIEW = "email_on_review",
  EMAIL_ON_SUBMISSION = "email_on_submission",
  EMAIL_ON_META_REVIEW = "email_on_review_of_review",
}

type PermittedEmailPreferences =
  | EmailPreference.EMAIL_ON_REVIEW
  | EmailPreference.EMAIL_ON_SUBMISSION
  | EmailPreference.EMAIL_ON_META_REVIEW;
