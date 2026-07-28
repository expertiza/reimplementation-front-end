import { AssignmentProperties, IsEnabled, ParticipantRole, Role } from "./AssignmentParticipantsTypes";
import type { IAssignmentResponse } from "utils/interfaces";

/** Pure helper functions for assignment participant mapping and display logic. */

/** Maps backend `user.role.name` to a UI role; unrecognized values become `Role.Unknown`. */
export function normalizeUserRole(apiRoleName: string | undefined | null): Role {
  if (apiRoleName == null || String(apiRoleName).trim() === "") return Role.Unknown;
  const raw = String(apiRoleName).trim();
  const aliases: Record<string, Role> = {
    Administrator: Role.Admin,
    "Super Administrator": Role.Admin,
    Student: Role.Student,
    Instructor: Role.Instructor,
    Admin: Role.Admin,
    "Teaching Assistant": Role.TeachingAssistant,
  };
  const byAlias = aliases[raw];
  if (byAlias !== undefined) return byAlias;
  const lower = raw.toLowerCase();
  if (lower === "student") return Role.Student;
  if (lower === "instructor") return Role.Instructor;
  if (lower === "admin" || lower === "administrator") return Role.Admin;
  if (lower === "teaching assistant") return Role.TeachingAssistant;
  for (const v of Object.values(Role) as Role[]) {
    if (v === Role.Unknown) continue;
    if (v === raw) return v;
  }
  return Role.Unknown;
}

/** Maps backend `participant.authorization` to `ParticipantRole`; unrecognized → `Unknown`. */
export function normalizeParticipantRole(authorization: string | undefined | null): ParticipantRole {
  if (authorization == null || String(authorization).trim() === "") {
    return ParticipantRole.Participant;
  }
  const raw = String(authorization).trim();
  for (const pr of Object.values(ParticipantRole) as ParticipantRole[]) {
    if (pr === ParticipantRole.Unknown) continue;
    if (pr === raw || pr.toLowerCase() === raw.toLowerCase()) return pr;
  }
  return ParticipantRole.Unknown;
}

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
    // Require both flags so we do not show "Take quiz" when quizzes exist but are not required.
    hasQuiz: Boolean(assignment.require_quiz) && Boolean(assignment.has_quizzes),
    hasMentor: Boolean(assignment.has_mentors),
  };
}

/** Computes table colspan based on optional quiz and mentor permission columns. */
export function assignmentColSpan(assignmentProps: AssignmentProperties): number {
  return assignmentProps.hasQuiz && assignmentProps.hasMentor ? 12 : assignmentProps.hasQuiz || assignmentProps.hasMentor ? 11 : 10;
}

/** Returns the CSS class used to color a participant's role label. */
export function classForRole(role: Role): string {
  switch (role) {
    case Role.Student:
      return "role-student";
    case Role.Instructor:
      return "role-instructor";
    case Role.Admin:
      return "role-admin";
    case Role.TeachingAssistant:
      return "role-instructor";
    case Role.Unknown:
      return "role-unknown";
    default:
      return "";
  }
}

/** Intentionally empty: role row uses text styling only (project icon guidelines). */
export function iconForRole(_role: Role): JSX.Element {
  return <></>;
}

/** Returns the CSS class used to style enabled/disabled permission cells. */
export function classForStatus(isEnabled: IsEnabled): string {
  return isEnabled === IsEnabled.Yes ? "status-yes" : "status-no";
}

/** Returns the help text shown for each participant authorization option. */
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
    case ParticipantRole.Unknown:
      return "Authorization role could not be matched to a known participant role.";
    default:
      return "";
  }
}

/** Reads a dotted path from an object; only stops on null/undefined intermediates (not on false/0/""). */
export function getNestedValue<T>(obj: T, path: string): any {
  return path.split(".").reduce((acc: any, key: string) => (acc == null ? undefined : acc[key]), obj);
}
