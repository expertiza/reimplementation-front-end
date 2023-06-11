import {IFormOption} from "components/Form/interfaces";
import axiosClient from "../../utils/axios_client";

/**
 * @author Ankur Mundra on April, 2023
 */
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
}

export enum EmailPreference {
  EMAIL_ON_REVIEW = "email_on_review",
  EMAIL_ON_SUBMISSION = "email_on_submission",
  EMAIL_ON_META_REVIEW = "email_on_review_of_review",
}

type PermittedEmailPreferences =
  | EmailPreference.EMAIL_ON_REVIEW
  | EmailPreference.EMAIL_ON_SUBMISSION
  | EmailPreference.EMAIL_ON_META_REVIEW;

export interface IUserFormValues {
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

export interface IRole {
  id: number;
  name: string;
  parent_id: number;
}

export interface IInstitution {
  id: number;
  name: string;
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
    institutionsData.push({ label: institution.name, value: institution.id })
  );
  return institutionsData;
};

export const transformRolesResponse = (rolesList: string) => {
  let rolesData: IFormOption[] = [{ label: "Select a Role", value: "" }];
  let roles: IRole[] = JSON.parse(rolesList);
  roles.forEach((role) => rolesData.push({ label: role.name, value: role.id }));
  return rolesData;
};

export const transformUserRequest = (values: IUserFormValues) => {
  // const parent_id = values.parent_id ? values.parent_id : null;
  const user: IUserRequest = {
    name: values.name,
    email: values.email,
    role_id: values.role_id,
    parent_id: values.parent_id,
    institution_id: values.institution_id,
    full_name: values.lastName + ", " + values.firstName,
    email_on_review: values.emailPreferences.includes(EmailPreference.EMAIL_ON_REVIEW),
    email_on_submission: values.emailPreferences.includes(EmailPreference.EMAIL_ON_SUBMISSION),
    email_on_review_of_review: values.emailPreferences.includes(
      EmailPreference.EMAIL_ON_META_REVIEW
    ),
  };
  return JSON.stringify(user);
};

export const transformUserResponse = (userResponse: string) => {
  const user: IUserResponse = JSON.parse(userResponse);
  const parent_id = user.parent.id ? user.parent.id : null;
  const institution_id = user.institution.id ? user.institution.id : -1;
  const userValues: IUserFormValues = {
    id: user.id,
    name: user.name,
    email: user.email,
    firstName: user.full_name.split(",")[1].trim(),
    lastName: user.full_name.split(",")[0].trim(),
    role_id: user.role.id,
    parent_id: parent_id,
    institution_id: institution_id,
    emailPreferences: [],
  };
  if (user.email_on_review) {
    userValues.emailPreferences.push(EmailPreference.EMAIL_ON_REVIEW);
  }
  if (user.email_on_submission) {
    userValues.emailPreferences.push(EmailPreference.EMAIL_ON_SUBMISSION);
  }
  if (user.email_on_review_of_review) {
    userValues.emailPreferences.push(EmailPreference.EMAIL_ON_META_REVIEW);
  }
  return userValues;
};

export async function loadUserDataRolesAndInstitutions({ params }: any) {
  let userData = {};
  // if params contains id, then we are editing a user, so we need to load the user data
  if (params.id) {
    const userResponse = await axiosClient.get(`/users/${params.id}`);
    userData = await userResponse.data;
  }
  const institutionsResponse = await axiosClient.get("/institutions", {
    transformResponse: transformInstitutionsResponse,
  });
  const rolesResponse = await axiosClient.get("/roles", {
    transformResponse: transformRolesResponse,
  });

  const institutions = await institutionsResponse.data;
  const roles = await rolesResponse.data;

  return { userData, roles, institutions };
}
