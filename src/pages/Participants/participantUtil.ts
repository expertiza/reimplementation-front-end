import { IFormOption } from "components/Form/interfaces";
import axiosClient from "../../utils/axios_client";
import { IParticipantRequest, IParticipantResponse } from "../../utils/interfaces";
import { IUserFormValues } from "pages/Users/userUtil";

/**
 * @author Divit Kalathil on October, 2023
 */

export enum EmailPreference {
  EMAIL_ON_REVIEW = "email_on_review",
  EMAIL_ON_SUBMISSION = "email_on_submission",
  EMAIL_ON_META_REVIEW = "email_on_review_of_review",
}

export interface IParticipantFormValues {
  id?: number,
  type?: string,
  assignment_id?: number,
  course_id?: number,
  user_id: number,
  name?: string
}

export const transformUsersResponse = (rolesList: string) => {
  let rolesData: IFormOption[] = [{ label: "Select a User", value: "" }];
  let users: IUserFormValues[] = JSON.parse(rolesList);
  users.forEach((user) => rolesData.push({ label: user.name, value: user.id! }));
  return rolesData;
};

export const transformParticipantRequest = (values: IParticipantFormValues) => {
  // const parent_id = values.parent_id ? values.parent_id : null;
  let type = values.type;
  let participant:IParticipantRequest={
    user_id: values.user_id
  };
  if(type === "assignments" || type === "student_tasks")
  {
    participant = {
      assignment_id: values.assignment_id,
      user_id: values.user_id,
    };
    console.log(participant)
  }
  else if(type === "courses")
  {
    participant = {
      course_id: values.course_id,
      user_id: values.user_id,
    };
  }
  
  return JSON.stringify(participant);
};

export const transformParticipantResponse = (participantResponse: string) => {
  const participant: IParticipantResponse = JSON.parse(participantResponse);
  const participantValues: IParticipantFormValues = {
    id: participant.id,
    user_id: participant.user.id,
    assignment_id: participant.assignment_id,
    course_id: participant.course_id,
    name: participant.user.name
  };
 
  return participantValues;
};

export async function loadParticipantDataRolesAndInstitutions({ params }: any) {
  let participantData = {};
  // if params contains id, then we are editing a participant, so we need to load the participant data
  if (params.id) {
    const participantResponse = await axiosClient.get(`/participants/${params.id}`, {
      transformResponse: transformParticipantResponse,
    });
    participantData = await participantResponse.data;
  }
  const userResponse = await axiosClient.get("/users", {
    transformResponse: transformUsersResponse,
  });
  
  
  

  const users = await userResponse.data;
  return { participantData, users};
}
