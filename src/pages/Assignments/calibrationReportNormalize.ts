/**
 * Normalizes GET /assignments/:id/calibration_reports/:mapId responses so the UI
 * works with common Rails JSON shapes (wrapped root, camelCase keys) and fills
 * per-item summary from the rubric when the API omits aggregated rows.
 */

export interface Answer {
  item_id: number;
  answer: number;
  comments: string;
}

export interface ResponsePayload {
  response_id: number;
  additional_comment: string;
  is_submitted?: boolean;
  updated_at?: string;
  answers: Answer[];
  reviewer_name?: string;
  response_map_id?: number;
}

export interface RubricItem {
  id: number;
  txt: string;
  weight: number;
  seq: number;
  question_type: string;
  min_label?: string;
  max_label?: string;
  break_before?: boolean;
}

export type PerItemSummaryRow = {
  item_id: number;
  seq: number;
  txt: string;
  question_type: string;
  agree: number;
  near: number;
  disagree: number;
  distribution: Record<string, number>;
  instructor_score: number | null;
};

export interface CalibrationReportJson {
  assignment_id: number;
  response_map_id: number;
  team_id: number | null;
  team_name: string | null;
  participant_name?: string;
  /** Review rubric questionnaire used for this calibration (when API includes it). */
  questionnaire_id?: number;
  questionnaire_name?: string;
  /** Which review round this rubric applies to, when known. */
  review_round?: number;
  rubric: RubricItem[];
  instructor_response: ResponsePayload | null;
  student_responses: ResponsePayload[];
  per_item_summary: PerItemSummaryRow[];
  submitted_content?: { hyperlinks: string[]; files: string[] };
  score_scale?: { min: number; max: number };
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return x != null && typeof x === "object" && !Array.isArray(x);
}

function pickNum(o: Record<string, unknown>, ...keys: string[]): number {
  for (const k of keys) {
    const v = o[k];
    if (v != null && v !== "") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

function pickStr(o: Record<string, unknown>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = o[k];
    if (v != null && typeof v === "string") return v;
  }
  return null;
}

/** Like pickNum but returns undefined when no key is set (avoids treating 0 as “missing id”). */
function pickOptionalNum(o: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = o[k];
    if (v != null && v !== "") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return undefined;
}

/**
 * Pulls review-rubric questionnaire id/name/round from common API shapes (flat keys,
 * nested questionnaire, assignment_questionnaires for round 1).
 */
export function extractQuestionnaireMeta(merged: Record<string, unknown>): {
  questionnaire_id?: number;
  questionnaire_name?: string;
  review_round?: number;
} {
  const topName = pickStr(
    merged,
    "questionnaire_name",
    "questionnaireName",
    "rubric_name",
    "rubricName"
  );
  const topId = pickOptionalNum(
    merged,
    "questionnaire_id",
    "questionnaireId",
    "review_questionnaire_id",
    "reviewQuestionnaireId"
  );

  const rq = merged.review_questionnaire ?? merged.reviewQuestionnaire;
  if (isRecord(rq)) {
    const nm = pickStr(rq, "name", "title");
    const id = pickOptionalNum(rq, "id");
    if (nm != null || id != null) {
      return {
        questionnaire_id: topId ?? id,
        questionnaire_name: topName ?? nm ?? undefined,
        review_round: pickOptionalNum(rq, "used_in_round", "usedInRound"),
      };
    }
  }

  const q = merged.questionnaire;
  if (isRecord(q) && (pickStr(q, "name", "title") != null || pickOptionalNum(q, "id") != null)) {
    return {
      questionnaire_id: topId ?? pickOptionalNum(q, "id"),
      questionnaire_name: topName ?? pickStr(q, "name", "title") ?? undefined,
      review_round: pickOptionalNum(q, "used_in_round", "usedInRound"),
    };
  }

  const aqs = merged.assignment_questionnaires ?? merged.assignmentQuestionnaires;
  if (Array.isArray(aqs) && aqs.length > 0) {
    const sorted = [...aqs].sort(
      (a, b) =>
        (isRecord(a) ? Number(a.used_in_round ?? a.usedInRound ?? 0) : 0) -
        (isRecord(b) ? Number(b.used_in_round ?? b.usedInRound ?? 0) : 0)
    );
    const row =
      sorted.find((x) => isRecord(x) && Number(x.used_in_round ?? x.usedInRound) === 1) ??
      sorted[0];
    if (isRecord(row)) {
      const nq = row.questionnaire ?? row.Questionnaire;
      if (isRecord(nq)) {
        return {
          questionnaire_id:
            topId ??
            pickOptionalNum(nq, "id") ??
            pickOptionalNum(row, "questionnaire_id", "questionnaireId"),
          questionnaire_name: topName ?? pickStr(nq, "name", "title") ?? undefined,
          review_round: pickOptionalNum(row, "used_in_round", "usedInRound"),
        };
      }
    }
  }

  return {
    questionnaire_id: topId,
    questionnaire_name: topName ?? undefined,
  };
}

/**
 * Reads the linked review questionnaire from a GET /assignments/:id JSON body (same shapes as loadAssignment).
 */
export function questionnaireFromAssignmentApi(data: unknown): {
  questionnaire_id?: number;
  questionnaire_name?: string;
  review_round?: number;
} {
  if (!isRecord(data)) return {};
  const assignment = isRecord(data.assignment) ? data.assignment : data;
  const merged = assignment as Record<string, unknown>;
  return extractQuestionnaireMeta(merged);
}

function coerceAnswer(raw: Record<string, unknown>): Answer {
  return {
    item_id: pickNum(raw, "item_id", "itemId"),
    answer: pickNum(raw, "answer"),
    comments: String(raw.comments ?? ""),
  };
}

function coerceResponsePayload(raw: unknown): ResponsePayload | null {
  if (!isRecord(raw)) return null;
  const answersRaw = raw.answers;
  const answers = Array.isArray(answersRaw)
    ? answersRaw
        .map((a) => (isRecord(a) ? coerceAnswer(a) : null))
        .filter((x): x is Answer => x != null)
    : [];
  return {
    response_id: pickNum(raw, "response_id", "responseId"),
    additional_comment: String(raw.additional_comment ?? raw.additionalComment ?? ""),
    is_submitted:
      raw.is_submitted !== undefined
        ? Boolean(raw.is_submitted)
        : raw.isSubmitted !== undefined
          ? Boolean(raw.isSubmitted)
          : undefined,
    updated_at: String(raw.updated_at ?? raw.updatedAt ?? ""),
    answers,
    reviewer_name: raw.reviewer_name != null ? String(raw.reviewer_name) : raw.reviewerName != null ? String(raw.reviewerName) : undefined,
    response_map_id:
      raw.response_map_id != null || raw.responseMapId != null
        ? pickNum(raw, "response_map_id", "responseMapId")
        : undefined,
  };
}

function pickRubricItemTxt(raw: Record<string, unknown>): string {
  const v = raw.txt ?? raw.label ?? raw.question_txt ?? raw.questionTxt;
  if (v == null || v === "") return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (isRecord(v)) {
    const inner = v.txt ?? v.label ?? v.question_text;
    if (typeof inner === "string") return inner;
  }
  return "";
}

function coerceRubricItem(raw: Record<string, unknown>): RubricItem | null {
  const idRaw = raw.id ?? raw.question_id ?? raw.questionId;
  if (idRaw == null || idRaw === "") return null;
  const id = Number(idRaw);
  if (Number.isNaN(id)) return null;
  return {
    id,
    txt: pickRubricItemTxt(raw),
    weight: pickNum(raw, "weight"),
    seq: pickNum(raw, "seq", "sequence") || id,
    question_type: String(raw.question_type ?? raw.questionType ?? "scale"),
    min_label: raw.min_label != null ? String(raw.min_label) : raw.minLabel != null ? String(raw.minLabel) : undefined,
    max_label: raw.max_label != null ? String(raw.max_label) : raw.maxLabel != null ? String(raw.maxLabel) : undefined,
    break_before: Boolean(raw.break_before ?? raw.breakBefore),
  };
}

function extractScoreScale(merged: Record<string, unknown>): { min: number; max: number } | undefined {
  const ss = merged.score_scale ?? merged.scoreScale;
  if (!isRecord(ss)) return undefined;
  const min = Number(ss.min ?? (ss as { minimum?: unknown }).minimum ?? 0);
  const max = Number(ss.max ?? (ss as { maximum?: unknown }).maximum ?? 5);
  if (Number.isNaN(min) || Number.isNaN(max)) return undefined;
  return { min, max };
}

function extractRubric(merged: Record<string, unknown>): RubricItem[] {
  const direct = merged.rubric ?? merged.Rubric;
  if (Array.isArray(direct)) {
    return direct
      .map((x) => (isRecord(x) ? coerceRubricItem(x) : null))
      .filter((x): x is RubricItem => x != null);
  }
  const q = merged.questionnaire;
  if (isRecord(q) && Array.isArray(q.items)) {
    return q.items
      .map((x) => (isRecord(x) ? coerceRubricItem(x) : null))
      .filter((x): x is RubricItem => x != null);
  }
  if (Array.isArray(merged.questionnaire_items)) {
    return merged.questionnaire_items
      .map((x) => (isRecord(x) ? coerceRubricItem(x) : null))
      .filter((x): x is RubricItem => x != null);
  }
  return [];
}

function extractPerItemSummary(merged: Record<string, unknown>): PerItemSummaryRow[] {
  const raw =
    merged.per_item_summary ??
    merged.perItemSummary ??
    (Array.isArray(merged.summary) ? merged.summary : undefined);
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!isRecord(row)) return null;
      const dist = row.distribution;
      const distribution: Record<string, number> =
        isRecord(dist) ? (dist as Record<string, number>) : {};
      return {
        item_id: pickNum(row, "item_id", "itemId"),
        seq: pickNum(row, "seq", "sequence"),
        txt: String(row.txt ?? ""),
        question_type: String(row.question_type ?? row.questionType ?? ""),
        agree: pickNum(row, "agree"),
        near: pickNum(row, "near"),
        disagree: pickNum(row, "disagree"),
        distribution,
        instructor_score:
          row.instructor_score === null || row.instructor_score === undefined
            ? row.instructorScore === null || row.instructorScore === undefined
              ? null
              : Number(row.instructorScore)
            : Number(row.instructor_score),
      };
    })
    .filter((x): x is PerItemSummaryRow => x != null);
}

function synthesizeSummaryFromRubric(rubric: RubricItem[]): PerItemSummaryRow[] {
  return rubric.map((item) => ({
    item_id: item.id,
    seq: item.seq,
    txt: item.txt,
    question_type: item.question_type,
    agree: 0,
    near: 0,
    disagree: 0,
    distribution: {},
    instructor_score: null,
  }));
}

/**
 * Unwraps nested JSON, maps camelCase, and ensures per_item_summary exists when rubric does.
 */
export function normalizeCalibrationReport(raw: unknown): CalibrationReportJson | null {
  if (raw == null) return null;
  let root: Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      root = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  } else if (isRecord(raw)) {
    root = raw;
  } else {
    return null;
  }

  const nested =
    (isRecord(root.calibration_report) ? root.calibration_report : null) ||
    (isRecord(root.calibrationReport) ? root.calibrationReport : null) ||
    (isRecord(root.report) ? root.report : null);

  const merged: Record<string, unknown> = nested ? { ...root, ...nested } : { ...root };

  const rubric = extractRubric(merged);
  let perItemSummary = extractPerItemSummary(merged);

  if (perItemSummary.length === 0 && rubric.length > 0) {
    perItemSummary = synthesizeSummaryFromRubric(rubric);
  }

  const inst = merged.instructor_response ?? merged.instructorResponse;
  const students = merged.student_responses ?? merged.studentResponses;
  const studentList = Array.isArray(students)
    ? students.map((s) => coerceResponsePayload(s)).filter((x): x is ResponsePayload => x != null)
    : [];

  const submitted =
    merged.submitted_content ?? merged.submittedContent;
  let submitted_content: CalibrationReportJson["submitted_content"];
  if (isRecord(submitted)) {
    const h = submitted.hyperlinks;
    const f = submitted.files;
    submitted_content = {
      hyperlinks: Array.isArray(h) ? (h as string[]) : [],
      files: Array.isArray(f) ? (f as string[]) : [],
    };
  }

  const qMeta = extractQuestionnaireMeta(merged);
  const score_scale = extractScoreScale(merged);

  return {
    assignment_id: pickNum(merged, "assignment_id", "assignmentId"),
    response_map_id: pickNum(merged, "response_map_id", "responseMapId"),
    team_id: (merged.team_id ?? merged.teamId ?? null) as number | null,
    team_name: pickStr(merged, "team_name", "teamName"),
    participant_name: pickStr(merged, "participant_name", "participantName") ?? undefined,
    questionnaire_id: qMeta.questionnaire_id,
    questionnaire_name: qMeta.questionnaire_name,
    review_round: qMeta.review_round,
    rubric,
    instructor_response: coerceResponsePayload(inst),
    student_responses: studentList,
    per_item_summary: perItemSummary,
    submitted_content,
    score_scale,
  };
}

/** Rubric items from GET /assignments/:id (nested `assignment` or flat). */
export function rubricFromAssignmentResponse(data: unknown): RubricItem[] {
  if (!isRecord(data)) return [];
  const assignment = isRecord(data.assignment) ? data.assignment : data;
  return extractRubric(assignment as Record<string, unknown>);
}
