import axiosClient from "../../utils/axios_client";
import { IInstructor } from "../../utils/interfaces";

export type QuestionnaireType =
  | "Review rubric"
  | "Author feedback"
  | "Teammate Review"
  | "Survey"
  | "Assignment survey"
  | "Global survey"
  | "Course survey"
  | "Bookmark rating"
  | "Quiz";


export const QuestionnaireTypes: QuestionnaireType[] = [
  "Review rubric",
  "Author feedback",
  "Teammate Review",
  "Survey",
  "Assignment survey",
  "Global survey",
  "Course survey",
  "Bookmark rating",
  "Quiz",
];

/** Catalog for the questionnaire editor “Add item” dropdown; aligns with QuestionsController#types. */
export const QUESTIONNAIRE_EDITOR_ITEM_TYPES: string[] = [
  "Scale",
  "Dropdown",
  "TextArea",
  "TextField",
  "Criterion",
];

/**
 * Build the Add-item dropdown: editor catalog first, then any extra types from the API
 * (DB-backed). Ensures you can always add Scale/Criterion/etc. for review rubrics while
 * still showing types already stored (e.g. ScaleItem) for existing questionnaires.
 */
/**
 * Some API shapes return label fields as a string, others as a nested object (e.g. `{ txt: "..." }`).
 * React cannot render arbitrary objects as children — normalize to a string for display.
 */
export function coerceQuestionnaireDisplayText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const o = value as Record<string, unknown>;
    if (typeof o.txt === "string") return o.txt;
    if (typeof o.label === "string") return o.label;
    if (typeof o.question_text === "string") return o.question_text;
  }
  return "";
}

export function resolveQuestionnaireEditorItemTypes(apiBody: unknown): string[] {
  const base = [...QUESTIONNAIRE_EDITOR_ITEM_TYPES];
  const fromApi = Array.isArray(apiBody)
    ? apiBody.filter((x): x is string => typeof x === "string" && x.trim() !== "")
    : [];
  if (fromApi.length === 0) {
    return base;
  }
  const seen = new Set<string>(base);
  const extras: string[] = [];
  for (const s of fromApi) {
    if (!seen.has(s)) {
      seen.add(s);
      extras.push(s);
    }
  }
  extras.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  return [...base, ...extras];
}

export interface IItem {
  id?: number;
  txt: string;
  weight?: number;
  seq: number;
  question_type: string;
  size?: number | string;
  alternatives?: string;
  min_label?: number;
  max_label?: number;
  break_before?: boolean;
  questionnaire_id?: number;
  _destroy?: boolean;
  type?: string;
  
}


export interface QuestionnaireFormValues {
  id?: number;
  name: string;
  questionnaire_type:string;
  private:boolean;
  created_at?: string;
  updated_at?: string;
  min_question_score: number;
  max_question_score: number;
  instructor_id?: number;
  instructor?: IInstructor;
  items?: IItem[];
}

export interface QuestionnaireResponse {
  id?: number;
  name: string;
  private:boolean;
  created_at: string;
  updated_at: string;
  questionnaire_type:string;
  min_question_score: number;
  max_question_score: number;
  instructor_id: number;
  instructor: IInstructor;
  items?: IItem[];
}

export interface QuestionnaireRequest {
  id?: number;
  name: string;
  private:boolean;
  questionnaire_type:string;
  min_question_score: number;
  max_question_score: number;
  instructor_id?: number;
  instructor?: IInstructor;
  items_attributes: IItem[];
}

export function getQuestionnaireTypes(quest: QuestionnaireResponse[]): string[] {
  return Array.from(
    new Set(
      quest
        .map((q) => q.questionnaire_type)
        .filter((type): type is string => type !== null)
    )
  );
}


export const transformQuestionnaireRequest = (values: QuestionnaireFormValues) => {
  console.log("Original Form Values:", values);
  const questionnaire: QuestionnaireRequest = {
    id: values.id,
    name: values.name,
    questionnaire_type: values.questionnaire_type === "Review rubric" ? "Review rubric" : values.questionnaire_type.replace(/\s+/g, ""),
    private: values.private,
    min_question_score: values.min_question_score,
    max_question_score: values.max_question_score,
    instructor_id: values.instructor_id,
    items_attributes: values.items
      ? values.items.map((item, index) => ({
          ...item,
          seq: index + 1,
          break_before: !!item.break_before,
        }))
      : [],
  };
  console.log("Transformed Questionnaire Request:", questionnaire);
  return { questionnaire };
};

export const transformQuestionnaireResponse = (data: any): QuestionnaireFormValues => {
  return {
    id: data.id,
    name: data.name,
    private: data.private,
    questionnaire_type: data.questionnaire_type,
    min_question_score: data.min_question_score,
    max_question_score: data.max_question_score,
    instructor_id: data.instructor_id,
    instructor: data.instructor,
    created_at: data.created_at,
    updated_at: data.updated_at,
    // Some API shapes return nested objects like `{ txt: "..." }` for item labels.
    // Normalize so the rest of the UI never tries to render objects as React children.
    items: normalizeQuestionnaireItemsResponse(data.items),
  };
};

/** Rails often wraps records as `{ questionnaire: { ... } }`. */
export function unwrapQuestionnairePayload(data: unknown): any {
  if (data == null || typeof data !== "object") return data;
  const o = data as Record<string, unknown>;
  if (o.questionnaire != null && typeof o.questionnaire === "object") {
    return o.questionnaire;
  }
  return data;
}

/**
 * GET /questionnaires/:id/items may return a bare array, `{ items: [...] }`, or nested questionnaire.
 */
export function normalizeQuestionnaireItemsResponse(data: unknown): any[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data.map(normalizeItemFromApi);
  if (typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.items)) return (o.items as any[]).map(normalizeItemFromApi);
    if (o.questionnaire != null && typeof o.questionnaire === "object") {
      const q = o.questionnaire as Record<string, unknown>;
      if (Array.isArray(q.items)) return (q.items as any[]).map(normalizeItemFromApi);
    }
    if (Array.isArray(o.questionnaire_items)) {
      return (o.questionnaire_items as any[]).map(normalizeItemFromApi);
    }
  }
  return [];
}

function normalizeItemFromApi(item: any): any {
  if (item == null || typeof item !== "object") return item;
  return {
    ...item,
    txt: coerceQuestionnaireDisplayText(item.txt ?? item.label ?? item.question_text),
    question_type:
      item.question_type ?? item.questionType ?? item.type ?? item.questionnaire_type ?? "",
    seq: item.seq ?? item.sequence ?? 0,
    weight: item.weight,
    alternatives: item.alternatives,
    min_label: item.min_label ?? item.minLabel,
    max_label: item.max_label ?? item.maxLabel,
    break_before: item.break_before ?? item.breakBefore,
  };
}

export async function loadQuestionnaire({ params }: any) {
  if (params.id) {
    const response = await axiosClient.get(`/questionnaires/${params.id}`);
    const raw = unwrapQuestionnairePayload(response.data);
    return transformQuestionnaireResponse(raw);
  } else {
    const response = await axiosClient.get(`/questionnaires`);
    return response.data.map((q: any) =>
      transformQuestionnaireResponse(unwrapQuestionnairePayload(q))
    );
  }
}


