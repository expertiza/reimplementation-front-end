import axiosClient from "../../utils/axios_client";
import { IInstructor } from "../../utils/interfaces";

export type QuestionnaireType =
  | "Review"
  | "Author feedback"
  | "Teammate Review"
  | "Survey"
  | "Assignment survey"
  | "Global survey"
  | "Course survey"
  | "Bookmark rating"
  | "Quiz";

export const QuestionnaireTypes: QuestionnaireType[] = [
  "Review",
  "Author feedback",
  "Teammate Review",
  "Survey",
  "Assignment survey",
  "Global survey",
  "Course survey",
  "Bookmark rating",
  "Quiz",
];

export interface IItem {
  id?: number;
  txt: string;
  weight?: number | string | null;
  seq: number;
  item_type: string;
  question_type?: string;
  size?: number | string;
  alternatives?: string;
  min_label?: string;
  max_label?: string;
  textarea_width?: number | string;
  textarea_height?: number | string;
  textbox_width?: number | string;
  // Grid label lists (stored in `alternatives` as "column_names|row_names")
  column_names?: string;
  col_names?: string;
  row_names?: string;
  // Grid / textarea dimensions (stored in `size` as "columns,rows")
  columns?: number | string;
  rows?: number | string;
  break_before?: boolean | number;
  questionnaire_id?: number;
  _destroy?: boolean;
  type?: string;
}

export interface QuestionnaireFormValues {
  id?: number;
  name: string;
  questionnaire_type: string;
  private: boolean;
  created_at?: string;
  updated_at?: string;
  min_item_score: number;
  max_item_score: number;
  instructor_id?: number;
  instructor?: IInstructor;
  items?: IItem[];
  relatesToRole?: boolean;
  selectedDuty?: string;
}

export interface QuestionnaireResponse {
  id?: number;
  name: string;
  private: boolean;
  created_at: string;
  updated_at: string;
  questionnaire_type: string;
  min_item_score?: number;
  max_item_score?: number;
  instructor_id: number;
  instructor: IInstructor;
  items?: IItem[];
}

export interface QuestionnaireRequest {
  id?: number;
  name: string;
  private: boolean;
  questionnaire_type: string;
  min_item_score?: number;
  max_item_score?: number;
  instructor_id?: number;
  instructor?: IInstructor;
  items_attributes: IItem[];
}

export function getQuestionnaireTypes(quest: QuestionnaireResponse[]): string[] {
  return Array.from(
    new Set(quest.map((q) => q.questionnaire_type).filter((type): type is string => type !== null))
  );
}

const mapToBackendType = (type: string): string => {
  const map: Record<string, string> = {
    Review: "ReviewQuestionnaire",
    "Author feedback": "AuthorFeedbackQuestionnaire",
    "Teammate Review": "TeammateReviewQuestionnaire",
    Survey: "SurveyQuestionnaire",
    "Assignment survey": "AssignmentSurveyQuestionnaire",
    "Global survey": "GlobalSurveyQuestionnaire",
    "Course survey": "CourseEvaluationQuestionnaire",
    "Bookmark rating": "BookmarkRatingQuestionnaire",
    Quiz: "QuizQuestionnaire",
  };
  return map[type] || type.replace(/\s+/g, "");
};

const mapToFrontendType = (type: string): string => {
  const map: Record<string, string> = {
    ReviewQuestionnaire: "Review",
    AuthorFeedbackQuestionnaire: "Author feedback",
    TeammateReviewQuestionnaire: "Teammate Review",
    SurveyQuestionnaire: "Survey",
    AssignmentSurveyQuestionnaire: "Assignment survey",
    GlobalSurveyQuestionnaire: "Global survey",
    CourseEvaluationQuestionnaire: "Course survey",
    BookmarkRatingQuestionnaire: "Bookmark rating",
    QuizQuestionnaire: "Quiz",
  };
  return map[type] || type;
};

export type BackendItem = Omit<Partial<IItem>, "item_type"> & { item_type?: string };

export const mapItemTypeToFrontend = (type: string): string => {
  const aliases: Record<string, string> = { TextArea: "Text area", TextField: "Text field" };
  return aliases[type] ?? type;
};

// Item types whose size is stored as "width,height" and edited with a text-area UI.
const TEXT_AREA_ITEM_TYPES = new Set(["Text area", "Criterion"]);

export const textAreaNeededOnUI = (itemType: string): boolean => TEXT_AREA_ITEM_TYPES.has(itemType);

export const mapItemToFormField = (item: BackendItem): IItem => {
  const itemType = mapItemTypeToFrontend(item.item_type ?? item.question_type ?? "");
  const sizeStr = item.size ? String(item.size) : "";
  const altStr = item.alternatives ? String(item.alternatives) : "";

  let textarea_width: number | string = "";
  let textarea_height: number | string = "";
  let textbox_width: number | string = "";
  let column_names = "";
  let row_names = "";
  let columns: number | string = "";
  let rows: number | string = "";

  if (textAreaNeededOnUI(itemType)) {
    const parts = sizeStr.split(",");
    textarea_width = parts[0] || "";
    textarea_height = parts[1] || "";
  } else if (itemType === "Text field") {
    textbox_width = sizeStr;
  } else if (itemType === "Grid") {
    // Parse labels from alternatives
    const altParts = altStr.split("|");
    column_names = altParts[0] ?? "";
    row_names = altParts[1] ?? "";
    // Parse numeric grid dimensions from size
    const sizeParts = sizeStr.split(",");
    const parsedCols = parseInt(sizeParts[0], 10);
    const parsedRows = parseInt(sizeParts[1], 10);
    columns = !isNaN(parsedCols) && parsedCols > 0 ? parsedCols : "";
    rows = !isNaN(parsedRows) && parsedRows > 0 ? parsedRows : "";
  }

  return {
    ...item,
    id: item.id,
    txt: item.txt ?? "",
    item_type: itemType,
    question_type: itemType,
    weight: item.weight ?? "",
    alternatives: altStr,
    min_label: item.min_label ?? "",
    max_label: item.max_label ?? "",
    textarea_width,
    textarea_height,
    textbox_width,
    column_names,
    row_names,
    columns,
    rows,
    seq: item.seq ?? 1,
    break_before: item.break_before,
    _destroy: item._destroy || false,
  };
};

export const transformQuestionnaireRequest = (values: QuestionnaireFormValues) => {
  console.log("Original Form Values:", values);
  const minScore = values.min_item_score ?? 0;
  const maxScore = values.max_item_score ?? 10;
  const questionnaire: QuestionnaireRequest = {
    id: values.id,
    name: values.name,
    questionnaire_type: mapToBackendType(values.questionnaire_type),
    private: values.private,
    min_item_score: minScore,
    max_item_score: maxScore,
    instructor_id: values.instructor_id,
    items_attributes: values.items
      ? values.items.map((item, index) => {
          let size: string | number | undefined = item.size;
          let alternatives: string | undefined = item.alternatives;
          const type = mapItemTypeToFrontend(item.item_type ?? item.question_type ?? "");

          if (textAreaNeededOnUI(type)) {
            // size = "textarea_width,textarea_height"
            size = `${item.textarea_width ?? ""},${item.textarea_height ?? ""}`;
          } else if (type === "Grid") {
            // Use ?? (not ||) so that 0 is preserved, not treated as empty
            const cols = item.columns != null && item.columns !== "" ? item.columns : "";
            const rws = item.rows != null && item.rows !== "" ? item.rows : "";
            size = `${cols},${rws}`;
            // Store label lists in alternatives as "column_names|row_names"
            alternatives = `${item.column_names ?? ""}|${item.row_names ?? ""}`;
          } else if (type === "Text field") {
            size = `${item.textbox_width ?? ""}`;
          }

          const rawWeight = item.weight;
          const weight =
            rawWeight === "" || rawWeight == null
              ? null
              : Number(rawWeight);

          return {
            ...item,
            item_type: type,
            question_type: type,
            weight,
            size,
            alternatives,
            seq: index + 1,
            break_before: item.break_before ?? false,
          };
        })
      : [],
  };
  console.log("Transformed Questionnaire Request:", questionnaire);
  return { questionnaire };
};

export type BackendQuestionnaire = Omit<QuestionnaireFormValues, "items"> & {
  items?: BackendItem[];
  min_question_score?: number;
  max_question_score?: number;
};

export const transformQuestionnaireResponse = (data: BackendQuestionnaire): QuestionnaireFormValues => {
  return {
    id: data.id,
    name: data.name,
    private: data.private,
    questionnaire_type: mapToFrontendType(data.questionnaire_type),
    min_item_score: data.min_item_score ?? data.min_question_score ?? 0,
    max_item_score: data.max_item_score ?? data.max_question_score ?? 10,
    instructor_id: data.instructor_id,
    instructor: data.instructor,
    created_at: data.created_at,
    updated_at: data.updated_at,
    items: (data.items ?? []).map(mapItemToFormField),
  };
};

export async function loadQuestionnaire({ params }: { params: { id?: string } }) {
  if (params.id) {
    const response = await axiosClient.get<BackendQuestionnaire>(`/questionnaires/${params.id}`);
    return transformQuestionnaireResponse(response.data);
  } else {
    const response = await axiosClient.get<BackendQuestionnaire[]>(`/questionnaires`);
    return response.data.map(transformQuestionnaireResponse);
  }
}
