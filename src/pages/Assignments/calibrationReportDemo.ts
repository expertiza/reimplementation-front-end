/**
 * When no real student calibration reviews exist yet, synthesize a few static
 * reviewers so the report charts and rubric comparison UI remain demonstrable.
 * When the report API fails or the instructor review is missing, synthesize a
 * gold-standard review so stacked charts and rubric detail still render.
 */

import type { CalibrationReportJson, ResponsePayload, RubricItem } from './calibrationReportNormalize';

export type CalibrationReportDisplay = CalibrationReportJson & {
  usingDemoStudentReviews?: boolean;
  usingFallbackInstructorReview?: boolean;
  /** Entire report body was unavailable (e.g. 500); UI is preview-only. */
  usingDemoCalibrationReport?: boolean;
  calibrationReportLoadError?: string | null;
};

const MINIMAL_FALLBACK_RUBRIC: RubricItem[] = [
  { id: 101, txt: 'Quality of work', weight: 1, seq: 1, question_type: 'CriterionItem' },
  { id: 102, txt: 'Documentation', weight: 1, seq: 2, question_type: 'CriterionItem' },
];

const RUBRIC_HEADER_TYPES = new Set([
  'SectionHeader',
  'TableHeader',
  'ColumnHeader',
  'section_header',
  'table_header',
  'column_header',
]);

function skipRubricRow(questionType: string): boolean {
  return RUBRIC_HEADER_TYPES.has(questionType);
}

/** Same idea as instructor review: only these get numeric demo scores. */
function isNumericRubricItem(questionType: string): boolean {
  if (skipRubricRow(questionType)) return false;
  return /Criterion|Scale|^scale$/i.test(questionType);
}

function clampInt(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function pickDemoScore(
  instructorAnswer: number | null | undefined,
  studentIndex: number,
  min: number,
  max: number
): number {
  if (instructorAnswer == null || Number.isNaN(Number(instructorAnswer))) {
    const defaults = [3, 4, 2, 5];
    return clampInt(defaults[studentIndex % defaults.length], min, max);
  }
  const s = Number(instructorAnswer);
  switch (studentIndex) {
    case 0:
      return clampInt(s, min, max);
    case 1:
      return clampInt(s + 1, min, max);
    case 2:
      return clampInt(s - 1, min, max);
    case 3:
      return clampInt(s - 3, min, max);
    default:
      return clampInt(s, min, max);
  }
}

const DEMO_STUDENTS: Array<{ name: string; additional_comment: string }> = [
  { name: 'Alex Chen', additional_comment: 'Clear submission; minor gaps in testing.' },
  { name: 'Jordan Lee', additional_comment: 'Solid work overall and matches the rubric intent.' },
  { name: 'Sam Rivera', additional_comment: 'Would score documentation slightly lower.' },
  { name: 'Taylor Kim', additional_comment: 'Mostly aligned with how I read the criteria.' },
];

function syntheticInstructorResponse(
  rubric: RubricItem[],
  scale: { min: number; max: number }
): ResponsePayload {
  const answers: Array<{ item_id: number; answer: number; comments: string }> = [];
  let i = 0;
  for (const item of rubric) {
    if (!isNumericRubricItem(item.question_type)) continue;
    const defaults = [4, 3, 5, 2, 4];
    answers.push({
      item_id: Number(item.id),
      answer: clampInt(defaults[i % defaults.length], scale.min, scale.max),
      comments: i % 2 === 0 ? 'Example criterion comment (preview).' : '',
    });
    i++;
  }
  return {
    response_id: -1,
    additional_comment:
      'Example overall feedback. Save your instructor review on the server to replace this preview.',
    is_submitted: false,
    answers,
    reviewer_name: 'Instructor (preview)',
  };
}

function hasCompleteInstructorReview(report: CalibrationReportJson): boolean {
  const numericItems = (report.rubric ?? []).filter((item) => isNumericRubricItem(item.question_type));
  if (numericItems.length === 0) return true;
  const inst = report.instructor_response;
  if (!inst?.answers?.length) return false;
  return numericItems.every((item) => {
    const ans = inst.answers.find((a) => Number(a.item_id) === Number(item.id));
    return ans != null && ans.answer != null && !Number.isNaN(Number(ans.answer));
  });
}

/**
 * If the API omitted or only partially returned the instructor (gold) review,
 * fill with deterministic preview scores so comparison charts and rubric rows work.
 */
export function injectDemoInstructorIfNeeded(report: CalibrationReportJson): CalibrationReportDisplay {
  if (hasCompleteInstructorReview(report)) {
    return { ...report, usingFallbackInstructorReview: false };
  }
  const scale = {
    min: report.score_scale?.min ?? 0,
    max: report.score_scale?.max ?? 5,
  };
  const instructor_response = syntheticInstructorResponse(report.rubric ?? [], scale);
  const next: CalibrationReportJson = {
    ...report,
    instructor_response,
    score_scale: report.score_scale ?? scale,
  };
  const per_item_summary = buildPerItemSummary(next, next.student_responses);
  return {
    ...next,
    per_item_summary,
    usingFallbackInstructorReview: true,
  };
}

/**
 * When GET calibration_reports fails, build a preview report using the assignment rubric
 * (when available) plus sample instructor and student reviews.
 */
export function buildFallbackCalibrationReport(opts: {
  assignment_id: number;
  response_map_id: number;
  rubric: RubricItem[];
  questionnaire_id?: number;
  questionnaire_name?: string;
  review_round?: number;
  participant_name?: string;
  loadError: string;
}): CalibrationReportDisplay {
  const score_scale = { min: 0, max: 5 };
  const rubric = opts.rubric.length > 0 ? opts.rubric : MINIMAL_FALLBACK_RUBRIC;
  const base: CalibrationReportJson = {
    assignment_id: opts.assignment_id,
    response_map_id: opts.response_map_id,
    team_id: null,
    team_name: null,
    participant_name: opts.participant_name ?? 'Calibration participant (preview)',
    questionnaire_id: opts.questionnaire_id,
    questionnaire_name: opts.questionnaire_name,
    review_round: opts.review_round,
    rubric,
    instructor_response: syntheticInstructorResponse(rubric, score_scale),
    student_responses: [],
    per_item_summary: [],
    submitted_content: { hyperlinks: [], files: [] },
    score_scale,
  };
  base.per_item_summary = buildPerItemSummary(base, []);
  const withStudents = injectDemoStudentCalibrationData(base);
  return {
    ...withStudents,
    usingFallbackInstructorReview: true,
    usingDemoCalibrationReport: true,
    calibrationReportLoadError: opts.loadError,
  };
}

function instructorScoreByItemId(report: CalibrationReportJson): Map<number, number | null> {
  const m = new Map<number, number | null>();
  const answers = report.instructor_response?.answers ?? [];
  for (const a of answers) {
    const id = Number(a.item_id);
    if (Number.isNaN(id)) continue;
    m.set(id, a.answer == null ? null : Number(a.answer));
  }
  return m;
}

function buildPerItemSummary(
  report: CalibrationReportJson,
  students: CalibrationReportJson['student_responses']
): CalibrationReportJson['per_item_summary'] {
  const rubric = report.rubric ?? [];
  const instMap = instructorScoreByItemId(report);

  return rubric
    .filter((item) => !skipRubricRow(item.question_type))
    .map((item) => {
      const rawInst = instMap.get(Number(item.id));
      const s =
        rawInst == null || Number.isNaN(Number(rawInst)) ? null : Number(rawInst);
      let agree = 0;
      let near = 0;
      let disagree = 0;
      const distribution: Record<string, number> = {};

      for (const st of students) {
        const ans = st.answers?.find((a) => Number(a.item_id) === Number(item.id));
        if (!ans || ans.answer == null) continue;
        const score = Number(ans.answer);
        if (Number.isNaN(score)) continue;
        const key = String(score);
        distribution[key] = (distribution[key] ?? 0) + 1;
        if (s == null) continue;
        if (score === s) agree++;
        else if (Math.abs(score - s) === 1) near++;
        else disagree++;
      }

      return {
        item_id: item.id,
        seq: typeof item.seq === 'number' ? item.seq : Number(item.seq),
        txt: item.txt,
        question_type: item.question_type,
        agree,
        near,
        disagree,
        distribution,
        instructor_score: s,
      };
    });
}

/**
 * If the API returned no student calibration reviews, attach four static students
 * and recompute `per_item_summary` so charts and rubric detail match that set.
 */
export function injectDemoStudentCalibrationData(report: CalibrationReportJson): CalibrationReportDisplay {
  if (report.student_responses?.length > 0) {
    return { ...report, usingDemoStudentReviews: false };
  }

  const minS = report.score_scale?.min ?? 0;
  const maxS = report.score_scale?.max ?? 5;
  const rubric = report.rubric ?? [];

  const instMap = instructorScoreByItemId(report);
  const student_responses = DEMO_STUDENTS.map((meta, idx) => {
    const answers: Array<{ item_id: number; answer: number; comments: string }> = [];
    for (const item of rubric) {
      if (!isNumericRubricItem(item.question_type)) continue;
      const instAns = instMap.get(Number(item.id));
      const answer = pickDemoScore(instAns, idx, minS, maxS);
      answers.push({
        item_id: Number(item.id),
        answer,
        comments: idx % 2 === 0 ? 'Reasonable for this criterion.' : '',
      });
    }
    return {
      response_id: -1000 - idx,
      additional_comment: meta.additional_comment,
      is_submitted: true,
      updated_at: new Date(Date.now() - (3 - idx) * 86400000).toISOString(),
      answers,
      reviewer_name: meta.name,
      response_map_id: -2000 - idx,
    };
  });

  const per_item_summary = buildPerItemSummary({ ...report, student_responses }, student_responses);

  return {
    ...report,
    student_responses,
    per_item_summary,
    usingDemoStudentReviews: true,
  };
}
