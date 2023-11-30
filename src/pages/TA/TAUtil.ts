import { IFormOption } from "components/Form/interfaces";
import axiosClient from "../../utils/axios_client";
import { IInstitution, IRole, ITARequest, ITAResponse } from "../../utils/interfaces";

/**
 * @author Ankur Mundra on April, 2023
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

export interface ITAFormValues {
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

export const transformTARequest = (values: ITAFormValues) => {
  // const parent_id = values.parent_id ? values.parent_id : null;
  const TA: ITARequest = {
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
  return JSON.stringify(TA);
};

export const transformTAResponse = (TAResponse: string) => {
  const TA: ITAResponse = JSON.parse(TAResponse);
  const parent_id = TA.parent.id ? TA.parent.id : null;
  const institution_id = TA.institution.id ? TA.institution.id : -1;
  const TAValues: ITAFormValues = {
    id: TA.id,
    name: TA.name,
    email: TA.email,
    firstName: TA.full_name.split(",")[1].trim(),
    lastName: TA.full_name.split(",")[0].trim(),
    role_id: TA.role.id,
    parent_id: parent_id,
    institution_id: institution_id,
    emailPreferences: [],
  };
  if (TA.email_on_review) {
    TAValues.emailPreferences.push(EmailPreference.EMAIL_ON_REVIEW);
  }
  if (TA.email_on_submission) {
    TAValues.emailPreferences.push(EmailPreference.EMAIL_ON_SUBMISSION);
  }
  if (TA.email_on_review_of_review) {
    TAValues.emailPreferences.push(EmailPreference.EMAIL_ON_META_REVIEW);
  }
  return TAValues;
};

export async function loadTADataRolesAndInstitutions({ params }: any) {
  let TAData = {};
  // if params contains id, then we are editing a TA, so we need to load the TA data
  if (params.id) {
    const TAResponse = await axiosClient.get(`/TAs/${params.id}`, {
      transformResponse: transformTAResponse,
    });
    TAData = await TAResponse.data;
  }
  const institutionsResponse = await axiosClient.get("/institutions", {
    transformResponse: transformInstitutionsResponse,
  });
  const rolesResponse = await axiosClient.get("/roles/subordinate_roles", {
    transformResponse: transformRolesResponse,
  });

  const institutions = await institutionsResponse.data;
  const roles = await rolesResponse.data;
  return { TAData, roles, institutions };
}
