import { IInstitution, IRole, IUserRequest, IUserResponse } from "../../utils/interfaces";

import { IFormOption } from "components/Form/interfaces";
import axiosClient from "../../utils/axios_client";

export interface IAssignmentRequest {
    id?: number;
    title: string;
    description: string;
    due_date: string; // You may want to use a specific date type instead of string
    // Add other properties specific to assignments
  }
  
  export interface IAssignmentResponse {
    id: number;
    title: string;
    description: string;
    due_date: string; // You may want to use a specific date type instead of string
    // Add other properties specific to assignments
  }
  
  // Add any other interfaces related to assignments as needed
  
  export const transformAssignmentRequest = (values: IAssignmentRequest) => {
    const assignment: IAssignmentRequest = {
      title: values.title,
      description: values.description,
      due_date: values.due_date,
      // Add other properties specific to assignments
    };
    return JSON.stringify(assignment);
  };
  
  export const transformAssignmentResponse = (assignmentResponse: string) => {
    const assignment: IAssignmentResponse = JSON.parse(assignmentResponse);
    // Transform response as needed
    return assignment;
  };
  
  // Add any other utility functions related to assignments as needed
  export enum EmailPreference {
    EMAIL_ON_REVIEW = "email_on_review",
    EMAIL_ON_SUBMISSION = "email_on_submission",
    EMAIL_ON_META_REVIEW = "email_on_review_of_review",
  }
  
  type PermittedEmailPreferences =
    | EmailPreference.EMAIL_ON_REVIEW
    | EmailPreference.EMAIL_ON_SUBMISSION
    | EmailPreference.EMAIL_ON_META_REVIEW;
 