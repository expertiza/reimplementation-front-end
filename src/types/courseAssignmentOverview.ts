/*
 * Shared type contract for the course report feature, covering the API response
 * shape, the frontend row model, and the checkbox visibility state.
 */

// Per-assignment structural info returned by the backend, including has_topics for the column exclusion rule.
export interface AssignmentMetadata {
  assignment_id: number;
  assignment_name: string;
  has_topics: boolean;
}

// One student's data for one assignment, sourced from Teams, review response maps, and teammate review maps.
export interface AssignmentFieldData {
  participant_id: number;
  peer_grade: number | null;
  instructor_grade: number | null;
  avg_teammate_score: number | null;
  avg_author_feedback_score: number | null;
  topic?: string;
}

// One student's full report data, with assignments keyed by assignment ID as a string; null means no participation.
export interface StudentReportEntry {
  user_id: number;
  user_name: string;
  assignments: { [assignmentId: string]: AssignmentFieldData | null };
}

// Full response shape returned by GET /course_reports.
export interface CourseReportApiResponse {
  course_id: number;
  course_name: string;
  assignments: AssignmentMetadata[];
  students: StudentReportEntry[];
}

// Mirrors the checkbox toolbar state, with one boolean per field type.
export type VisibleFields = {
  topic: boolean;
  peerGrade: boolean;
  instructorGrade: boolean;
  avgTeammateScore: boolean;
  avgAuthorFeedbackScore: boolean;
};

// Initial checkbox state when the report first loads.
export const DEFAULT_VISIBLE_FIELDS: VisibleFields = {
  topic: true,
  peerGrade: true,
  instructorGrade: true,
  avgTeammateScore: true,
  avgAuthorFeedbackScore: true,
};
