import { IFormOption } from "../../components/Form/interfaces";
import axiosClient from "../../utils/axios_client";
import {
  IInstitution,
  IParticipantRequest,
  IParticipantResponse,
  IRole,
} from "../../utils/interfaces";

/**
 * @author Divit Kalathil on October, 2023
 */

export enum EmailPreference {
  EMAIL_ON_REVIEW = "email_on_review",
  EMAIL_ON_SUBMISSION = "email_on_submission",
  EMAIL_ON_META_REVIEW = "email_on_review_of_review",
}

type PermittedEmailPreferences =
  | EmailPreference.EMAIL_ON_REVIEW
  | EmailPreference.EMAIL_ON_SUBMISSION
  | EmailPreference.EMAIL_ON_META_REVIEW;

export interface IParticipantFormValues {
  id?: number;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  role_id: number;
  parent_id?: number | null;
  institution_id: number;
  emailPreferences: Array<PermittedEmailPreferences>;
}

export const emailOptions: IFormOption[] = [
  { label: "When someone else reviews my work", value: EmailPreference.EMAIL_ON_REVIEW },
  {
    label: "When someone else submits work I am assigned to review",
    value: EmailPreference.EMAIL_ON_SUBMISSION,
  },
  {
    label: "When someone else reviews one of my reviews (meta-reviews my work)",
    value: EmailPreference.EMAIL_ON_META_REVIEW,
  },
];

export const transformInstitutionsResponse = (institutionsList: string) => {
  let institutionsData: IFormOption[] = [{ label: "Select an Institution", value: "" }];
  let institutions: IInstitution[] = JSON.parse(institutionsList);
  institutions.forEach((institution) =>
    institutionsData.push({ label: institution.name, value: institution.id! })
  );
  return institutionsData;
};

export const transformRolesResponse = (rolesList: string) => {
  let rolesData: IFormOption[] = [{ label: "Select a Role", value: "" }];
  let roles: IRole[] = JSON.parse(rolesList);
  roles.forEach((role) => rolesData.push({ label: role.name, value: role.id! }));
  return rolesData;
};

export const transformParticipantRequest = (values: IParticipantFormValues) => {
  // const parent_id = values.parent_id ? values.parent_id : null;
  const participant: IParticipantRequest = {
    username: values.name,
    name: values.lastName + ", " + values.firstName,
    email: values.email,
    role_id: values.role_id,
    parent_id: values.parent_id,
    institution_id: values.institution_id,
    email_on_review: values.emailPreferences.includes(EmailPreference.EMAIL_ON_REVIEW),
    email_on_submission: values.emailPreferences.includes(EmailPreference.EMAIL_ON_SUBMISSION),
    email_on_review_of_review: values.emailPreferences.includes(
      EmailPreference.EMAIL_ON_META_REVIEW
    ),
  };
  return JSON.stringify(participant);
};

export const transformParticipantResponse = (participantResponse: string) => {
  const participant: IParticipantResponse = JSON.parse(participantResponse);
  const parent_id = participant.parent.id ? participant.parent.id : null;
  const institution_id = participant.institution.id ? participant.institution.id : -1;
  const participantValues: IParticipantFormValues = {
    id: participant.id,
    name: participant.username,
    email: participant.email,
    firstName: participant.name.split(",")[1].trim(),
    lastName: participant.name.split(",")[0].trim(),
    role_id: participant.role.id,
    parent_id: parent_id,
    institution_id: institution_id,
    emailPreferences: [],
  };
  if (participant.email_on_review) {
    participantValues.emailPreferences.push(EmailPreference.EMAIL_ON_REVIEW);
  }
  if (participant.email_on_submission) {
    participantValues.emailPreferences.push(EmailPreference.EMAIL_ON_SUBMISSION);
  }
  return participantValues;
};

// GET /participants/assignment/:assignment_id nests the user under each participant;
// flatten it into the row shape the participants table reads
export const transformAssignmentParticipant = (participant: any): IParticipantResponse => {
  const user = participant.user ?? {};
  return {
    id: participant.id,
    username: user.username ?? "",
    name: user.name ?? "",
    email: user.email ?? "",
    email_on_review: !!user.email_on_review,
    email_on_submission: !!user.email_on_submission,
    role: { id: user.role?.id, name: user.role?.name },
    parent: { id: user.parent?.id ?? null, name: user.parent?.username ?? null },
    institution: { id: null, name: null },
  };
};

// Authorizations accepted by PATCH /participants/:id/:authorization
export const authorizationOptions: IFormOption[] = [
  { label: "Select an Authorization", value: "" },
  { label: "Reader", value: "reader" },
  { label: "Reviewer", value: "reviewer" },
  { label: "Submitter", value: "submitter" },
  { label: "Mentor", value: "mentor" },
];

export interface IParticipantAuthorization {
  id: number;
  username: string;
  name: string;
  authorization: string;
}

export async function loadParticipantAuthorization({ params }: any) {
  const { data } = await axiosClient.get(`/participants/${params.id}`);
  const participant: IParticipantAuthorization = {
    id: data.id,
    username: data.user?.username ?? "",
    name: data.user?.name ?? "",
    authorization: data.authorization ?? "",
  };
  return participant;
}

export async function loadParticipantDataRolesAndInstitutions({ params }: any) {
  let participantData = {};
  // if params contains id, then we are editing a participant, so we need to load the participant data
  if (params.id) {
    const participantResponse = await axiosClient.get(`/participants/${params.id}`, {
      transformResponse: transformParticipantResponse,
    });
    participantData = await participantResponse.data;
  }
  const institutionsResponse = await axiosClient.get("/institutions", {
    transformResponse: transformInstitutionsResponse,
  });
  const rolesResponse = await axiosClient.get("/roles/subordinate_roles", {
    transformResponse: transformRolesResponse,
  });

  const institutions = await institutionsResponse.data;
  const roles = await rolesResponse.data;
  return { participantData, roles, institutions };
}
