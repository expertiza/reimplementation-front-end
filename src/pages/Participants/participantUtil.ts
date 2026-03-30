import { IFormOption } from "../../components/Form/interfaces";
import axiosClient from "../../utils/axios_client";
import { IInstitution, IParticipantRequest, IParticipantResponse, IRole } from "../../utils/interfaces";

/**
 * @author Divit Kalathil on October, 2023
 */

export enum EmailPreference {
  /** Form-only: maps to both email_on_review and email_on_submission on the API. */
  EMAIL_ON_ASSIGNMENTS = "email_on_assignments",
}

type PermittedEmailPreferences = EmailPreference.EMAIL_ON_ASSIGNMENTS;

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
  /** Loaded from API and sent back unchanged; not shown in the UI. */
  email_on_review_of_review: boolean;
}

export const emailOptions: IFormOption[] = [
  {
    label: "When there are updates on my assignments (new reviews or new submissions)",
    value: EmailPreference.EMAIL_ON_ASSIGNMENTS,
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
    name: values.name,
    email: values.email,
    role_id: values.role_id,
    parent_id: values.parent_id,
    institution_id: values.institution_id,
    full_name: values.lastName + ", " + values.firstName,
    email_on_review: values.emailPreferences.includes(EmailPreference.EMAIL_ON_ASSIGNMENTS),
    email_on_submission: values.emailPreferences.includes(EmailPreference.EMAIL_ON_ASSIGNMENTS),
    email_on_review_of_review: values.email_on_review_of_review,
  };
  return JSON.stringify(participant);
};

export const transformParticipantResponse = (participantResponse: string) => {
  const participant: IParticipantResponse = JSON.parse(participantResponse);
  const parent_id = participant.parent.id ? participant.parent.id : null;
  const institution_id = participant.institution.id ? participant.institution.id : -1;
  const participantValues: IParticipantFormValues = {
    id: participant.id,
    name: participant.name,
    email: participant.email,
    firstName: participant.full_name.split(",")[1].trim(),
    lastName: participant.full_name.split(",")[0].trim(),
    role_id: participant.role.id,
    parent_id: parent_id,
    institution_id: institution_id,
    emailPreferences: [],
    email_on_review_of_review: Boolean(participant.email_on_review_of_review),
  };
  if (participant.email_on_review || participant.email_on_submission) {
    participantValues.emailPreferences.push(EmailPreference.EMAIL_ON_ASSIGNMENTS);
  }
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
