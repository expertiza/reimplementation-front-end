import { AssignmentProperties, IsEnabled, ParticipantRole, Role } from "./AssignmentParticipantsTypes";
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield } from 'react-icons/fa';

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
  switch (role) {
    case Role.Student:
      return <FaUserGraduate />;
    case Role.Instructor:
      return <FaChalkboardTeacher />;
    case Role.Admin:
      return <FaUserShield />;
    default:
      return <></>;
  }
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
