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

// Represents an individual member in a team
export interface TeamMember {
  id: number;
  name: string;
}

// Represents each submission returned by the API
export interface TeamSubmission {
  id: number;
  name: string; // Team name
  team_id: number;
  topic: string | null;
  members: TeamMember[];
}

// Transformed data structure used for table rows
export interface ITeamRow {
  id: number; // Assignment ID
  team_id: number;
  teamName: string;
  teamMembers: { id: number; name: string }[];
  historyLink: string;
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

// Middleware to fetch teams for assignment 
export async function loadAssignmentTeams({ params }: any) {
  let teamsData = [];

  if (params.id) {
    const response = await axiosClient.get(`/assignments/${params.id}/teams`);
    teamsData = response.data;
  }

  return teamsData;
}

export async function loadAssignmentAndTeamReviews({ params }: any) {
  const assignmentId = params.id;
  const teamId = params.team;

  let assignmentData = null;
  let reviewData = {};

  try {
    if (assignmentId && teamId) {
      // Fetch assignment details
      const assignmentRes = await axiosClient.get(`/assignments/${assignmentId}`);
      assignmentData = assignmentRes.data;

      // Fetch filtered reviews for the assignment and team
      const reviewRes = await axiosClient.get(`/assignments/${assignmentId}/reviews`, {
        params: { team_id: teamId },
      });
      reviewData = reviewRes.data;
    }
  } catch (error) {
    console.error('Failed to load assignment or reviews:', error);
  }

  return {
    assignment: assignmentData,
    reviews: reviewData,
    teamId,
  };
}