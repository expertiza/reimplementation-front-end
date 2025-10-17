/**
 * Simple localStorage-backed mock data store for development.
 * Provides assignments, submissions and submission history persistence.
 */

import { IAssignmentResponse } from "./interfaces";

const ASSIGNMENTS_KEY = "mock:assignments";
const SUBMISSIONS_KEY = "mock:submissions";
const HISTORY_KEY = "mock:submissionHistory";

function read<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureInitialized() {
  if (!read(ASSIGNMENTS_KEY)) {
    const defaultAssignments: IAssignmentResponse[] = [
      {
        id: 1,
        name: "Mock Assignment",
        directory_path: "mock/path",
        spec_location: "",
        private: false,
        show_template_review: false,
        require_quiz: false,
        has_badge: false,
        staggered_deadline: false,
        is_calibrated: false,
        created_at: new Date(),
        updated_at: new Date(),
        course_id: 1,
        courseName: "Mock Course",
        institution_id: 1,
        instructor_id: 1,
        info: "",
      } as any,
    ];
    write(ASSIGNMENTS_KEY, defaultAssignments);
  }

  if (!read(SUBMISSIONS_KEY)) {
    // create a few dummy submissions for assignment 1
    const subs = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      assignmentId: 1,
      teamName: `Anonymized_Team_${38121 + i}`,
      assignment: `Assignment ${(i % 5) + 1}`,
      members: Array.from({ length: ((i % 3) + 1) }, (__, j) => ({ id: 10000 + i * 10 + j, name: `Student ${10000 + i * 10 + j}` })),
      links: [
        { url: `https://github.com/example/repo${i + 1}`, displayName: "GitHub Repository" },
      ],
      fileInfo: [{ name: `README.md`, size: `${(Math.random() * 15 + 10).toFixed(1)} KB`, dateModified: new Date().toISOString() }],
    }));
    write(SUBMISSIONS_KEY, subs);
  }

  if (!read(HISTORY_KEY)) {
    const history: Record<string, any[]> = {};
    const subs = read<any[]>(SUBMISSIONS_KEY) || [];
    subs.forEach((s) => {
      history[String(s.id)] = [
        { id: 1, name: `file_${s.id}_1.txt`, size: `${(Math.random() * 10 + 1).toFixed(1)} KB`, date: new Date().toISOString() },
      ];
    });
    write(HISTORY_KEY, history);
  }
}

export function getAssignments() {
  ensureInitialized();
  return read<IAssignmentResponse[]>(ASSIGNMENTS_KEY) || [];
}

export function getAssignment(id: number) {
  ensureInitialized();
  const arr = read<IAssignmentResponse[]>(ASSIGNMENTS_KEY) || [];
  return arr.find((a) => a.id === id) || null;
}

export function createAssignment(payload: any) {
  ensureInitialized();
  const arr = read<any[]>(ASSIGNMENTS_KEY) || [];
  const id = Math.max(0, ...arr.map((a) => a.id || 0)) + 1;
  const created = { id, ...payload, created_at: new Date(), updated_at: new Date() };
  arr.push(created);
  write(ASSIGNMENTS_KEY, arr);
  // create an empty submissions list for this assignment (optional)
  const subs = read<any[]>(SUBMISSIONS_KEY) || [];
  write(SUBMISSIONS_KEY, subs);
  return created;
}

export function getCourses() {
  // minimal course mock
  return [{ id: 1, name: "Mock Course" }];
}

export function getSubmissionsForAssignment(assignmentId: number) {
  ensureInitialized();
  const subs = read<any[]>(SUBMISSIONS_KEY) || [];
  return subs.filter((s) => s.assignmentId === assignmentId);
}

export function getAllSubmissions() {
  ensureInitialized();
  return read<any[]>(SUBMISSIONS_KEY) || [];
}

export function createSubmission(assignmentId: number, payload: any) {
  ensureInitialized();
  const subs = read<any[]>(SUBMISSIONS_KEY) || [];
  const id = Math.max(0, ...subs.map((s) => s.id || 0)) + 1;
  const created = { id, assignmentId, ...payload };
  subs.push(created);
  write(SUBMISSIONS_KEY, subs);
  // add history
  const history = read<Record<string, any[]>>(HISTORY_KEY) || {};
  history[String(id)] = history[String(id)] || [];
  write(HISTORY_KEY, history);
  return created;
}

export function getHistoryForSubmission(submissionId: number) {
  ensureInitialized();
  const history = read<Record<string, any[]>>(HISTORY_KEY) || {};
  return history[String(submissionId)] || [];
}

export function addHistoryEntry(submissionId: number, entry: any) {
  ensureInitialized();
  const history = read<Record<string, any[]>>(HISTORY_KEY) || {};
  history[String(submissionId)] = history[String(submissionId)] || [];
  history[String(submissionId)].push(entry);
  write(HISTORY_KEY, history);
  return history[String(submissionId)];
}

export default {
  getAssignments,
  getAssignment,
  createAssignment,
  getCourses,
  getSubmissionsForAssignment,
  createSubmission,
  getHistoryForSubmission,
  addHistoryEntry,
};
