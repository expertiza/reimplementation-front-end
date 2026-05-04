export enum IsEnabled {
  Yes = 'yes',
  No = 'no',
}

export enum Role {
  Student = "Student",
  Instructor = "Instructor",
  Admin = "Admin",
  TeachingAssistant = "Teaching Assistant",
  /** Backend sent a role name we do not model; avoid silent string casts. */
  Unknown = "Unknown",
}

export enum ParticipantRole {
  Participant = "participant",
  Reader = "reader",
  Reviewer = "reviewer",
  Submitter = "submitter",
  Mentor = "mentor",
  /** Authorization string from API did not match a known participant role. */
  Unknown = "unknown",
}

export interface ParticipantPermissions {
  review: IsEnabled;
  submit: IsEnabled;
  takeQuiz: IsEnabled;
  mentor: IsEnabled;
}

export interface Participant {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: Role;
  parent: string;
  permissions: ParticipantPermissions;
  participantRole: ParticipantRole;
}

export interface AssignmentProperties {
  hasQuiz: boolean;
  hasMentor: boolean;
}
