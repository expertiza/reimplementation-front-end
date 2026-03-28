import { IFormOption } from "../../components/Form/interfaces";
import axiosClient from "../../utils/axios_client";
import { IInstitution, IRole, IUserRequest, IUserResponse } from "../../utils/interfaces";

/**
 * @author Ankur Mundra on April, 2023
 */

export enum EmailPreference {
  /** Form-only: maps to both email_on_review and email_on_submission on the API. */
  EMAIL_ON_ASSIGNMENTS = "email_on_assignments",
}

type PermittedEmailPreferences = EmailPreference.EMAIL_ON_ASSIGNMENTS;

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
  /** Loaded from API and sent back unchanged; not shown in the UI. */
  email_on_review_of_review: boolean;
  date_format_pref?: string;
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
  let rolesData: IFormOption[] = [{ label: "Select a role", value: "" }];
  let roles: IRole[] = JSON.parse(rolesList);
  roles.forEach((role) => rolesData.push({ label: role.name, value: role.id! }));
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
    email_on_review: values.emailPreferences.includes(EmailPreference.EMAIL_ON_ASSIGNMENTS),
    email_on_submission: values.emailPreferences.includes(EmailPreference.EMAIL_ON_ASSIGNMENTS),
    email_on_review_of_review: values.email_on_review_of_review,
    date_format_pref: values.date_format_pref,
  };
  return JSON.stringify(user);
};

export const transformUserResponse = (userResponse: string) => {
  const user: IUserResponse = JSON.parse(userResponse);
  const parent_id = user.parent?.id != null ? user.parent.id : null;
  const institution_id = user.institution?.id != null ? user.institution.id : -1;
  const full = user.full_name ?? "";
  const nameParts = full.split(",");
  const lastName = nameParts[0]?.trim() ?? "";
  const firstName = nameParts.length > 1 ? nameParts[1].trim() : full.trim();
  const userValues: IUserFormValues = {
    id: user.id,
    name: user.name,
    email: user.email,
    firstName,
    lastName,
    role_id: user.role?.id ?? -1,
    parent_id: parent_id,
    institution_id: institution_id,
    emailPreferences: [],
    email_on_review_of_review: Boolean(user.email_on_review_of_review),
    date_format_pref: user.date_format_pref,
  };
  if (user.email_on_review || user.email_on_submission) {
    userValues.emailPreferences.push(EmailPreference.EMAIL_ON_ASSIGNMENTS);
  }
  return userValues;
};

export async function loadUserDataRolesAndInstitutions({ params }: any) {
  let userData = {};
  // if params contains id, then we are editing a user, so we need to load the user data
  if (params.id) {
    const userResponse = await axiosClient.get(`/users/${params.id}`, {
      transformResponse: transformUserResponse,
    });
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
