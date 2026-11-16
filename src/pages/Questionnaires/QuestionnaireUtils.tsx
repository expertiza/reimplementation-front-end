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

// Score range used when a questionnaire does not specify one.
export const DEFAULT_MIN_ITEM_SCORE = 1;
export const DEFAULT_MAX_ITEM_SCORE = 5;

export interface IItem {
  id?: number;
  txt: string;
  weight?: number | string | null;
  seq: number;
  item_type: string;
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
  relatesToDuty?: boolean;
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

// Each item type knows how its dimensions are stored on the backend and how
// they appear in the form. Types without a handler use defaultItemTypeHandler.
interface ItemTypeHandler {
  // True when the form shows text-area width/height inputs for this type.
  textAreaNeededOnUI: boolean;
  // Backend `size` / `alternatives` -> form fields.
  fromBackend(size: string, alternatives: string): Partial<IItem>;
  // Form fields -> backend `size` / `alternatives`.
  toBackend(item: IItem): Pick<IItem, "size" | "alternatives">;
}

const defaultItemTypeHandler: ItemTypeHandler = {
  textAreaNeededOnUI: false,
  fromBackend: () => ({}),
  toBackend: (item) => ({ size: item.size, alternatives: item.alternatives }),
};

// size = "textarea_width,textarea_height"
const textAreaHandler: ItemTypeHandler = {
  ...defaultItemTypeHandler,
  textAreaNeededOnUI: true,
  fromBackend: (size) => {
    const [width, height] = size.split(",");
    return { textarea_width: width || "", textarea_height: height || "" };
  },
  toBackend: (item) => ({
    size: `${item.textarea_width ?? ""},${item.textarea_height ?? ""}`,
    alternatives: item.alternatives,
  }),
};

const textFieldHandler: ItemTypeHandler = {
  ...defaultItemTypeHandler,
  fromBackend: (size) => ({ textbox_width: size }),
  toBackend: (item) => ({ size: `${item.textbox_width ?? ""}`, alternatives: item.alternatives }),
};

// size = "columns,rows"; alternatives = "column_names|row_names"
const gridHandler: ItemTypeHandler = {
  ...defaultItemTypeHandler,
  fromBackend: (size, alternatives) => {
    const [columnNames, rowNames] = alternatives.split("|");
    const [cols, rows] = size.split(",").map((n) => parseInt(n, 10));
    return {
      column_names: columnNames ?? "",
      row_names: rowNames ?? "",
      columns: !isNaN(cols) && cols > 0 ? cols : "",
      rows: !isNaN(rows) && rows > 0 ? rows : "",
    };
  },
  toBackend: (item) => {
    // Keep 0 as a value; only null/undefined/"" count as empty.
    const cols = item.columns != null && item.columns !== "" ? item.columns : "";
    const rows = item.rows != null && item.rows !== "" ? item.rows : "";
    return {
      size: `${cols},${rows}`,
      alternatives: `${item.column_names ?? ""}|${item.row_names ?? ""}`,
    };
  },
};

const ITEM_TYPE_HANDLERS: Record<string, ItemTypeHandler> = {
  "Text area": textAreaHandler,
  Criterion: textAreaHandler,
  "Text field": textFieldHandler,
  Grid: gridHandler,
};

export const getItemTypeHandler = (itemType: string): ItemTypeHandler =>
  ITEM_TYPE_HANDLERS[itemType] ?? defaultItemTypeHandler;

export const textAreaNeededOnUI = (itemType: string): boolean =>
  getItemTypeHandler(itemType).textAreaNeededOnUI;

export const mapItemToFormField = (item: BackendItem): IItem => {
  const itemType = mapItemTypeToFrontend(item.item_type ?? "");
  const sizeStr = item.size ? String(item.size) : "";
  const altStr = item.alternatives ? String(item.alternatives) : "";

  const dimensions: Partial<IItem> = {
    textarea_width: "",
    textarea_height: "",
    textbox_width: "",
    column_names: "",
    row_names: "",
    columns: "",
    rows: "",
    ...getItemTypeHandler(itemType).fromBackend(sizeStr, altStr),
  };

  return {
    ...item,
    id: item.id,
    txt: item.txt ?? "",
    item_type: itemType,
    weight: item.weight ?? "",
    alternatives: altStr,
    min_label: item.min_label ?? "",
    max_label: item.max_label ?? "",
    ...dimensions,
    seq: item.seq ?? 1,
    break_before: item.break_before,
    _destroy: item._destroy || false,
  };
};

export const transformQuestionnaireRequest = (values: QuestionnaireFormValues) => {
  console.log("Original Form Values:", values);
  const minScore = values.min_item_score ?? DEFAULT_MIN_ITEM_SCORE;
  const maxScore = values.max_item_score ?? DEFAULT_MAX_ITEM_SCORE;
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
          const type = mapItemTypeToFrontend(item.item_type ?? "");
          const { size, alternatives } = getItemTypeHandler(type).toBackend(item);

          const rawWeight = item.weight;
          const weight =
            rawWeight === "" || rawWeight == null
              ? null
              : Number(rawWeight);

          return {
            ...item,
            item_type: type,
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
};

export const transformQuestionnaireResponse = (data: BackendQuestionnaire): QuestionnaireFormValues => {
  return {
    id: data.id,
    name: data.name,
    private: data.private,
    questionnaire_type: mapToFrontendType(data.questionnaire_type),
    min_item_score: data.min_item_score ?? DEFAULT_MIN_ITEM_SCORE,
    max_item_score: data.max_item_score ?? DEFAULT_MAX_ITEM_SCORE,
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
