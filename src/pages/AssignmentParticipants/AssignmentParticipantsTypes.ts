export enum IsEnabled {
  Yes = 'yes',
  No = 'no',
}

export enum Role {
  Student = "Student",
  Instructor = "Instructor",
  Admin = "Admin",
}

export enum ParticipantRole {
  Participant = "participant",
  Reader = "reader",
  Reviewer = "reviewer",
  Submitter = "submitter",
  Mentor = "mentor",
}

export interface ParticipantPermissions {
  review: IsEnabled;
  submit: IsEnabled;
  takeQuiz: IsEnabled;
  mentor: IsEnabled;
}

export interface Participant {
  id: number;
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
