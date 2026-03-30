import { IAssignmentRequest } from "../../utils/interfaces";
import axiosClient from "../../utils/axios_client";

export interface IAssignmentFormValues {
  id?: number;
  instructor_id?: number;
  name: string;
  directory_path: string;
  spec_location: string;
  private: boolean;
  show_template_review: boolean;
  require_quiz: boolean;
  has_badge: boolean;
  staggered_deadline: boolean;
  is_calibrated: boolean;
  // Teams / mentors / topics
  has_teams?: boolean;
  max_team_size?: number;
  show_teammate_review?: boolean;
  is_pair_programming?: boolean;
  has_mentors?: boolean;
  has_topics?: boolean;
  // Review strategy / limits
  review_topic_threshold?: number;
  maximum_number_of_reviews_per_submission?: number;
  review_strategy?: string;
  review_rubric_varies_by_round?: boolean;
  review_rubric_varies_by_topic?: boolean;
  review_rubric_varies_by_role?: boolean;
  has_max_review_limit?: boolean;
  set_allowed_number_of_reviews_per_reviewer?: number;
  set_required_number_of_reviews_per_reviewer?: number;
  is_review_anonymous?: boolean;
  is_review_done_by_teams?: boolean;
  allow_self_reviews?: boolean;
  reviews_visible_to_other_reviewers?: boolean;
  number_of_review_rounds?: number;
  // Dates / penalties
  days_between_submissions?: number;
  late_policy_id?: number;
  is_penalty_calculated?: boolean;
  calculate_penalty?: boolean;
  apply_late_policy?: boolean;
  // Deadline toggles
  use_signup_deadline?: boolean;
  use_drop_topic_deadline?: boolean;
  use_team_formation_deadline?: boolean;
  // Rubric weights / notification limits
  weights?: number[];
  notification_limits?: number[];
  use_date_updater?: boolean[];
  // Per-deadline permissions
  submission_allowed?: boolean[];
  review_allowed?: boolean[];
  teammate_allowed?: boolean[];
  metareview_allowed?: boolean[];
  reminder?: number[];
   // Misc flags from the form
  allow_tag_prompts?: boolean;
  course_id?: number;
  has_quizzes?: boolean;
  calibration_for_training?: boolean;
  available_to_students?: boolean;
  allow_topic_suggestion_from_students?: boolean;
  enable_bidding_for_topics?: boolean;
  enable_bidding_for_reviews?: boolean;
  enable_authors_to_review_other_topics?: boolean;
  allow_reviewer_to_choose_topic_to_review?: boolean;
  allow_participants_to_create_bookmarks?: boolean;
  auto_assign_mentors?: boolean;
  staggered_deadline_assignment?: boolean;
  // These are used only in tables; keep them loose
  questionnaire?: any;
  date_time?: any[];
  due_dates?: { id: number; deadline_type_id: number; round?: number }[];
  assignment_questionnaires?: {
    id: number;
    used_in_round?: number;
    questionnaire?: { id: number; name: string };
  }[];
  /** Present on JSON from the server; mirrors Assignment#review_rubric_questionnaire. */
  has_review_rubric_for_calibration?: boolean;
  [key: string]: any;
}

/** Matches `DueDate` / assignment editor row layout (see `transformAssignmentResponse`). */
const SUBMISSION_DEADLINE_TYPE_ID = 1;
const REVIEW_DEADLINE_TYPE_ID = 2;
/** Ancillary deadlines (signup / drop topic / team formation) use a generic type; `deadline_name` disambiguates. */
const NAMED_DEADLINE_TYPE_ID = 3;

function yesNoToAllowedId(v: unknown): number {
  if (v === "no" || v === false || v === 0 || v === "0") return 1;
  return 3;
}

function valueAtFormRow(container: unknown, key: string | number): unknown {
  if (container == null) return undefined;
  if (typeof container === "object" && !Array.isArray(container)) {
    const o = container as Record<string, unknown>;
    return o[String(key)] ?? (typeof key === "number" ? o[key] : undefined);
  }
  if (Array.isArray(container) && typeof key === "number") return container[key];
  return undefined;
}

function dateTimeAt(values: IAssignmentFormValues, key: string | number): Date | null {
  const dt = values.date_time as Record<string, unknown> | undefined | null;
  if (dt == null || typeof dt !== "object" || Array.isArray(dt)) return null;
  const raw =
    (dt as Record<string, unknown>)[String(key)] ??
    (typeof key === "number" ? (dt as Record<string, unknown>)[key] : undefined);
  if (raw == null || raw === "") return null;
  const d = raw instanceof Date ? raw : new Date(raw as string);
  return Number.isFinite(d.getTime()) ? d : null;
}

function buildDueDatesAttributes(
  values: IAssignmentFormValues,
  num: (v: unknown) => number | undefined
): Record<string, Record<string, unknown>> | null {
  const indexed: Record<string, Record<string, unknown>> = {};
  let idx = 0;

  const push = (row: Record<string, unknown>) => {
    indexed[String(idx++)] = row;
  };

  const rowPayload = (
    rowKey: string | number,
    dueAtIso: string,
    extra: Record<string, unknown>
  ): Record<string, unknown> => {
    const existingId = num(values[`due_date_id_${rowKey}`]);
    const reminderRaw = valueAtFormRow(values.reminder, rowKey);
    const thresholdN = num(reminderRaw) ?? 1;
    return {
      ...(existingId !== undefined ? { id: existingId } : {}),
      due_at: dueAtIso,
      submission_allowed_id: yesNoToAllowedId(valueAtFormRow(values.submission_allowed, rowKey)),
      review_allowed_id: yesNoToAllowedId(valueAtFormRow(values.review_allowed, rowKey)),
      teammate_review_allowed_id: yesNoToAllowedId(valueAtFormRow(values.teammate_allowed, rowKey)),
      quiz_allowed_id: 1,
      threshold: thresholdN,
      review_of_review_allowed_id: yesNoToAllowedId(valueAtFormRow(values.metareview_allowed, rowKey)),
      type: "AssignmentDueDate",
      ...extra,
    };
  };

  const rounds = values.number_of_review_rounds ?? 0;
  for (let r = 1; r <= rounds; r += 1) {
    const subRowId = 2 * (r - 1);
    const revRowId = 2 * (r - 1) + 1;
    const subDate = dateTimeAt(values, subRowId);
    const revDate = dateTimeAt(values, revRowId);
    if (subDate) {
      push(
        rowPayload(subRowId, subDate.toISOString(), {
          deadline_type_id: SUBMISSION_DEADLINE_TYPE_ID,
          round: r,
        })
      );
    }
    if (revDate) {
      push(
        rowPayload(revRowId, revDate.toISOString(), {
          deadline_type_id: REVIEW_DEADLINE_TYPE_ID,
          round: r,
        })
      );
    }
  }

  const named: { key: string; label: string }[] = [];
  if (values.use_signup_deadline) named.push({ key: "signup_deadline", label: "Signup deadline" });
  if (values.use_drop_topic_deadline) named.push({ key: "drop_topic_deadline", label: "Drop topic deadline" });
  if (values.use_team_formation_deadline) {
    named.push({ key: "team_formation_deadline", label: "Team formation deadline" });
  }

  for (const { key, label } of named) {
    const d = dateTimeAt(values, key);
    if (!d) continue;
    push(
      rowPayload(key, d.toISOString(), {
        deadline_type_id: NAMED_DEADLINE_TYPE_ID,
        deadline_name: label,
      })
    );
  }

  return idx === 0 ? null : indexed;
}

/** Dropdown + API use DB column `review_assignment_strategy` as "1" | "2" | "3" (Expertiza-style numeric strategies). */
export function normalizeReviewStrategyForSelect(v: unknown): "1" | "2" | "3" {
  if (v === undefined || v === null) return "1";
  const s = String(v).trim();
  if (s === "") return "1";
  const n = Number.parseInt(s, 10);
  if (n === 1 || n === 2 || n === 3) return String(n) as "1" | "2" | "3";
  return "1";
}

export const transformAssignmentRequest = (values: IAssignmentFormValues) => {
  // Nested rows for Assignment accepts_nested_attributes_for :assignment_questionnaires
  const assignmentQuestionnaires: Record<string, unknown>[] = [];
  const roundCount = Math.max(values.number_of_review_rounds ?? 0, 1);
  const weights = values.weights as unknown;
  const notificationLimits = values.notification_limits as unknown;

  const num = (v: unknown): number | undefined => {
    if (v === undefined || v === null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const valueAtIndex = (container: unknown, idx: number): unknown => {
    if (container == null) return undefined;
    if (Array.isArray(container)) return container[idx];
    if (typeof container === "object") {
      const o = container as Record<string, unknown>;
      return o[idx] ?? o[String(idx)];
    }
    return undefined;
  };

  for (let i = 1; i <= roundCount; i += 1) {
    const rawQ = values[`questionnaire_round_${i}`];
    if (rawQ === undefined || rawQ === null || rawQ === "") continue;
    const questionnaireId = num(rawQ);
    if (questionnaireId === undefined) continue;

    const row: Record<string, unknown> = {
      questionnaire_id: questionnaireId,
      used_in_round: i,
    };

    const existingId = num(values[`assignment_questionnaire_id_${i}`]);
    if (existingId !== undefined) row.id = existingId;

    const w = num(valueAtIndex(weights, i));
    if (w !== undefined) row.questionnaire_weight = w;

    const nl = num(valueAtIndex(notificationLimits, i));
    if (nl !== undefined) row.notification_limit = nl;

    assignmentQuestionnaires.push(row);
  }

  // Single review rubric with no weight field filled still means 100% for that questionnaire.
  if (assignmentQuestionnaires.length === 1 && assignmentQuestionnaires[0].questionnaire_weight === undefined) {
    assignmentQuestionnaires[0].questionnaire_weight = 100;
  }

  // Rails accepts nested attributes from forms as { "0" => {...}, "1" => {...} }; a bare JSON array
  // is not always applied correctly to accepts_nested_attributes_for on update.
  const indexedQuestionnaireAttrs: Record<string, Record<string, unknown>> = {};
  assignmentQuestionnaires.forEach((row, index) => {
    indexedQuestionnaireAttrs[String(index)] = row;
  });

  // Always send a valid strategy so PATCH persists even when the DB was null or the select was out of sync.
  const reviewAssignmentStrategy = normalizeReviewStrategyForSelect(values.review_strategy);

  const dueDatesIndexed = buildDueDatesAttributes(values, num);

  // Keys must match real `assignments` columns (see reimplementation-back-end db/schema.rb).
  const assignment: Record<string, unknown> = {
    name: values.name,
    directory_path: values.directory_path,
    spec_location: values.spec_location,
    course_id: values.course_id,
    instructor_id: values.instructor_id,
    private: values.private ?? false,
    require_quiz: values.require_quiz ?? false,
    has_badge: values.has_badge ?? false,
    staggered_deadline: values.staggered_deadline ?? false,
    is_calibrated: values.is_calibrated ?? false,
    has_teams: values.has_teams ?? false,
    max_team_size: values.max_team_size,
    has_topics: values.has_topics ?? false,
    enable_pair_programming: values.is_pair_programming ?? false,
    show_teammate_reviews: values.show_teammate_review ?? false,
    review_topic_threshold: values.review_topic_threshold,
    max_reviews_per_submission: values.maximum_number_of_reviews_per_submission,
    vary_by_round: values.review_rubric_varies_by_round ?? false,
    rounds_of_reviews: values.number_of_review_rounds,
    days_between_submissions: values.days_between_submissions,
    late_policy_id: values.late_policy_id,
    is_penalty_calculated: values.is_penalty_calculated ?? false,
    calculate_penalty: values.calculate_penalty ?? false,
    is_anonymous: values.is_review_anonymous ?? false,
    reviews_visible_to_all: values.reviews_visible_to_other_reviewers ?? false,
    is_selfreview_enabled: values.allow_self_reviews ?? false,
    num_reviews_allowed: num(values.set_allowed_number_of_reviews_per_reviewer),
    num_reviews_required: num(values.set_required_number_of_reviews_per_reviewer),
    review_assignment_strategy: reviewAssignmentStrategy,
    ...(assignmentQuestionnaires.length > 0
      ? { assignment_questionnaires_attributes: indexedQuestionnaireAttrs }
      : {}),
    ...(dueDatesIndexed ? { due_dates_attributes: dueDatesIndexed } : {}),
  };

  return JSON.stringify({ assignment });
};

/** Axios may pass a parsed object (after default JSON transform) or a raw string. */
export const transformAssignmentResponse = (data: string | Record<string, unknown>): IAssignmentFormValues => {
  const parsed: Record<string, unknown> =
    typeof data === "string" ? (JSON.parse(data) as Record<string, unknown>) : data;

  // Some clients wrap the record as `{ assignment: { ... } }`; merge so field reads stay consistent.
  const raw: Record<string, unknown> =
    parsed.assignment != null && typeof parsed.assignment === "object" && !Array.isArray(parsed.assignment)
      ? { ...parsed, ...(parsed.assignment as Record<string, unknown>) }
      : parsed;

  // Map legacy DueDate records to the form's date_time[...] structure so
  // date pickers are pre-filled when editing.
  const dateTimeMap: Record<string | number, Date> = {};
  const dueDateIdExtras: Record<string, unknown> = {};
  const dueDates: any[] = (raw.due_dates as any[]) || [];

  dueDates.forEach((due: any) => {
    const dueAt: string | undefined = due.due_at;
    if (!dueAt) return;

    const dueDateObj = new Date(dueAt);

    // Round-based submission / review rows
    if (typeof due.round === "number") {
      const roundIndex = due.round; // 1-based
      const isReviewDeadline = due.deadline_type_id === REVIEW_DEADLINE_TYPE_ID;
      const rowId = isReviewDeadline
        ? 2 * (roundIndex - 1) + 1 // "Review i: Review"
        : 2 * (roundIndex - 1); // "Review i: Submission"
      dateTimeMap[rowId] = dueDateObj;
      if (due.id != null) dueDateIdExtras[`due_date_id_${rowId}`] = due.id;
      return;
    }

    // Named deadlines (signup / drop-topic / team-formation)
    const name: string = due.deadline_name || "";
    let key: string | null = null;
    if (/signup/i.test(name)) key = "signup_deadline";
    else if (/drop\s*topic/i.test(name)) key = "drop_topic_deadline";
    else if (/team\s*formation/i.test(name)) key = "team_formation_deadline";

    if (key) {
      dateTimeMap[key] = dueDateObj;
      if (due.id != null) dueDateIdExtras[`due_date_id_${key}`] = due.id;
    }
  });

  // DB columns -> form field names (see transformAssignmentRequest).
  const roundsOfReviews = raw.rounds_of_reviews as number | undefined;
  const numReviewRounds = raw.num_review_rounds as number | undefined;
  const numberOfReviewRounds =
    typeof roundsOfReviews === "number"
      ? roundsOfReviews
      : typeof numReviewRounds === "number"
        ? numReviewRounds
        : 0;

  const strategyFromApi =
    raw.review_assignment_strategy ??
    (raw as { reviewAssignmentStrategy?: unknown }).reviewAssignmentStrategy;
  const reviewStrategyForForm = normalizeReviewStrategyForSelect(strategyFromApi);

  const perRoundExtras: Record<string, unknown> = {};
  // Formik fields use `weights[1]`, `weights[100]` → nested object with string keys, not sparse arrays.
  const weightsFromAq: Record<string, number> = {};
  const notificationFromAq: Record<string, number> = {};
  const aqList = (raw.assignment_questionnaires as any[]) || [];
  if (Array.isArray(aqList)) {
    aqList.forEach((aq: any) => {
      const qid = aq.questionnaire?.id ?? aq.questionnaire_id;
      if (qid == null) return;
      // Treat missing round as round 1 so the Rubrics tab and calibration "linked rubric" checks stay in sync.
      let round = aq.used_in_round as number | undefined;
      if (round == null || round < 1) {
        round = 1;
      }
      perRoundExtras[`questionnaire_round_${round}`] = qid;
      if (aq.id != null) {
        perRoundExtras[`assignment_questionnaire_id_${round}`] = aq.id;
      }
      if (aq.questionnaire_weight != null && aq.questionnaire_weight !== "") {
        const w = Number(aq.questionnaire_weight);
        if (Number.isFinite(w)) weightsFromAq[String(round)] = w;
      }
      if (aq.notification_limit != null && aq.notification_limit !== "") {
        const nl = Number(aq.notification_limit);
        if (Number.isFinite(nl)) notificationFromAq[String(round)] = nl;
      }
    });
  }

  const assignmentValues: IAssignmentFormValues = {
    ...(raw as unknown as IAssignmentFormValues),

    id: raw.id as number,
    name: raw.name as string,
    directory_path: raw.directory_path as string,
    spec_location: (raw.spec_location as string) || "",
    private: Boolean(raw.private),
    show_template_review: false,
    require_quiz: Boolean(raw.require_quiz),
    has_badge: Boolean(raw.has_badge),
    staggered_deadline: Boolean(raw.staggered_deadline),
    is_calibrated: Boolean(raw.is_calibrated),

    has_teams: Boolean(raw.has_teams),
    max_team_size: raw.max_team_size as number | undefined,
    has_topics: Boolean(raw.has_topics),
    show_teammate_review: Boolean(raw.show_teammate_reviews),
    is_pair_programming: Boolean(raw.enable_pair_programming),

    review_topic_threshold: raw.review_topic_threshold as number | undefined,
    maximum_number_of_reviews_per_submission: raw.max_reviews_per_submission as number | undefined,
    review_strategy: reviewStrategyForForm,
    review_rubric_varies_by_round: Boolean(raw.vary_by_round),
    number_of_review_rounds: numberOfReviewRounds,

    is_review_anonymous: Boolean(raw.is_anonymous),
    reviews_visible_to_other_reviewers: Boolean(raw.reviews_visible_to_all),
    allow_self_reviews: Boolean(raw.is_selfreview_enabled),
    set_allowed_number_of_reviews_per_reviewer:
      raw.num_reviews_allowed != null && raw.num_reviews_allowed !== ""
        ? Number(raw.num_reviews_allowed)
        : 0,
    set_required_number_of_reviews_per_reviewer:
      raw.num_reviews_required != null && raw.num_reviews_required !== ""
        ? Number(raw.num_reviews_required)
        : 0,

    days_between_submissions: raw.days_between_submissions as number | undefined,
    late_policy_id: raw.late_policy_id as number | undefined,
    is_penalty_calculated: Boolean(raw.is_penalty_calculated),
    calculate_penalty: Boolean(raw.calculate_penalty),

    ...perRoundExtras,
    weights:
      Object.keys(weightsFromAq).length > 0
        ? weightsFromAq
        : Array.isArray((raw as any).weights)
          ? ((raw as any).weights as number[])
          : [],
    notification_limits:
      Object.keys(notificationFromAq).length > 0
        ? notificationFromAq
        : Array.isArray((raw as any).notification_limits)
          ? ((raw as any).notification_limits as number[])
          : [],

    // precomputed date/time fields for the Due dates tab
    date_time: dateTimeMap as any,

    ...dueDateIdExtras,

    due_dates: raw.due_dates as any,
    assignment_questionnaires: raw.assignment_questionnaires as any,
    // Do NOT use Boolean(undefined) — that forces false and hides rubrics when the API omits this key.
    ...(() => {
      const v = (raw as { has_review_rubric_for_calibration?: unknown }).has_review_rubric_for_calibration;
      if (v === true || v === false) {
        return { has_review_rubric_for_calibration: v };
      }
      return {};
    })(),
  };
  return assignmentValues;
};

export async function loadAssignment({ params }: any) {
  let assignmentData = {};
  let questionnaires = []; // fetch questionnaire list for dropdown window selections in Rubrics tab

  // if params contains id, then we are editing a user, so we need to load the user data
  if (params.id) {
    try {
      const userResponse = await axiosClient.get(`/assignments/${params.id}`, {
      transformResponse: transformAssignmentResponse,
    });
      assignmentData = userResponse.data;
    } catch (error) {
      console.error("Error loading assignment:", error);
      assignmentData = { id: params.id };
    }
  }

  const questionnairesRes = await axiosClient.get("/questionnaires");
  questionnaires = questionnairesRes.data || [];

  // Never overwrite `weights` / `notification_limits` from transformAssignmentResponse (was `weights: []`).
  return { ...assignmentData, questionnaires };
}
