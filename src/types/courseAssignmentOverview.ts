export interface AssignmentMetadata {
  assignment_id: number;
  assignment_name: string;
  has_topics: boolean;
}

export interface AssignmentFieldData {
  participant_id: number;
  peer_grade: number | null;
  instructor_grade: number | null;
  avg_teammate_score: number | null;
  topic?: string;
}

export interface StudentReportEntry {
  user_id: number;
  user_name: string;
  assignments: { [assignmentId: string]: AssignmentFieldData | null };
}

export interface CourseReportApiResponse {
  course_id: number;
  course_name: string;
  assignments: AssignmentMetadata[];
  students: StudentReportEntry[];
}

export type VisibleFields = {
  topic: boolean;
  peerGrade: boolean;
  instructorGrade: boolean;
  avgTeammateScore: boolean;
};

export const DEFAULT_VISIBLE_FIELDS: VisibleFields = {
  topic: true,
  peerGrade: true,
  instructorGrade: true,
  avgTeammateScore: true,
};
