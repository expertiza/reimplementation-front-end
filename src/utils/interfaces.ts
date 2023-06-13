/**
 * @author Ankur Mundra on June, 2023
 */

export interface IEditor {
  mode: "create" | "update";
}

export interface IRole {
  id?: number;
  name: string;
  parent_id: number;
}

export interface IInstitution {
  id?: number;
  name: string;
}

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
