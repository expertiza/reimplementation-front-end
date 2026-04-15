import { AssignmentProperties, IsEnabled, ParticipantRole, Role } from "./AssignmentParticipantsTypes";
import type { IAssignmentResponse } from "utils/interfaces";

/** Resolves a row label when /users omits or blanks full_name and name (common with seeds). */
export function displayNameForUser(user: {
  full_name?: string | null;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
}): string {
  const trimmed = [user.full_name, user.fullName, user.name]
    .find((v) => typeof v === "string" && v.trim().length > 0);
  if (trimmed) return trimmed.trim();
  const email = user.email?.trim() ?? "";
  if (!email) return "";
  const local = email.split("@")[0];
  return local || email;
}

/** Match login, full name, or email (case-insensitive) for add-participant lookup. */
export function findUserByIdentifier<T extends { id: number; name?: string | null; full_name?: string | null; email?: string | null }>(
  users: T[],
  query: string
): T | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return users.find((u) => {
    const name = (u.name ?? "").trim().toLowerCase();
    const full = (u.full_name ?? "").trim().toLowerCase();
    const email = (u.email ?? "").trim().toLowerCase();
    return name === q || full === q || email === q;
  });
}

/** Table column visibility for quiz / mentor from GET /assignments/:id (snake_case from API). */
export function assignmentTableFlagsFromResponse(assignment: IAssignmentResponse): AssignmentProperties {
  return {
    hasQuiz: Boolean(assignment.require_quiz) || Boolean(assignment.has_quizzes),
    hasMentor: Boolean(assignment.has_mentors),
  };
}

export function assignmentColSpan(assignmentProps: AssignmentProperties): number {
  return assignmentProps.hasQuiz && assignmentProps.hasMentor ? 12 : assignmentProps.hasQuiz || assignmentProps.hasMentor ? 11 : 10;
}

export function classForRole(role: Role): string {
  switch (role) {
    case Role.Student:
      return "role-student";
    case Role.Instructor:
      return "role-instructor";
    case Role.Admin:
      return "role-admin";
    default:
      return "";
  }
}

export function iconForRole(role: Role): JSX.Element {
  // Role icons are intentionally omitted to follow the project icon guidelines
  // (use the standardized icon assets under public/assets/icons for actions).
  return <></>;
}

export function classForStatus(isEnabled: IsEnabled): string {
  return isEnabled === IsEnabled.Yes ? "status-yes" : "status-no";
}

export function participantRoleInfo(role: ParticipantRole): string {
  switch (role) {
    case ParticipantRole.Participant:
      return "A participant can submit artifacts, review artifacts and take a quiz.";
    case ParticipantRole.Reader:
      return "A reader can review artifacts and take a quiz, but cannot submit artifacts.";
    case ParticipantRole.Reviewer:
      return "A reviewer can only review artifacts.";
    case ParticipantRole.Submitter:
      return "A submitter can only submit artifacts.";
    case ParticipantRole.Mentor:
      return "A mentor can submit, review, take quizzes, and has mentor permissions.";
    default:
      return "";
  }
}

export function getNestedValue<T>(obj: T, path: string): any {
  return path.split('.').reduce((acc: any, key: string) => (acc ? acc[key as keyof typeof acc] : undefined), obj);
}
