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

<<<<<<< HEAD
=======

>>>>>>> 99891da (UI consistency: blue add buttons, questionnaire table improvements)
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

<<<<<<< HEAD
=======

>>>>>>> 99891da (UI consistency: blue add buttons, questionnaire table improvements)
export interface IItem {
  id?: number;
  txt: string;
  weight?: number | string;
  seq: number;
  question_type: string;
  size?: number | string;
  alternatives?: string;
  min_label?: string;
  max_label?: string;
  textarea_width?: number | string;
  textarea_height?: number | string;
  textbox_width?: number | string;
<<<<<<< HEAD
  col_names?: string;
  row_names?: string;
=======
  // Grid label lists (stored in `alternatives` as "column_names|row_names")
  column_names?: string;
  row_names?: string;
  // Grid / textarea dimensions (stored in `size` as "columns,rows")
  columns?: number | string;
  rows?: number | string;
>>>>>>> 99891da (UI consistency: blue add buttons, questionnaire table improvements)
  break_before?: boolean | number;
  questionnaire_id?: number;
  _destroy?: boolean;
  type?: string;
}

<<<<<<< HEAD
=======

>>>>>>> 99891da (UI consistency: blue add buttons, questionnaire table improvements)
export interface QuestionnaireFormValues {
  id?: number;
  name: string;
  questionnaire_type: string;
  private: boolean;
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
  private: boolean;
  created_at: string;
  updated_at: string;
  questionnaire_type: string;
  min_question_score: number;
  max_question_score: number;
  instructor_id: number;
  instructor: IInstructor;
  items?: IItem[];
}

export interface QuestionnaireRequest {
  id?: number;
  name: string;
  private: boolean;
  questionnaire_type: string;
  min_question_score: number;
  max_question_score: number;
  instructor_id?: number;
  instructor?: IInstructor;
  items_attributes: IItem[];
}

export function getQuestionnaireTypes(quest: QuestionnaireResponse[]): string[] {
  return Array.from(
<<<<<<< HEAD
    new Set(quest.map((q) => q.questionnaire_type).filter((type): type is string => type !== null))
  );
}

const mapToBackendType = (type: string): string => {
  const map: Record<string, string> = {
    Review: "ReviewQuestionnaire",
    "Author feedback": "AuthorFeedbackQuestionnaire",
    "Teammate Review": "TeammateReviewQuestionnaire",
    Survey: "SurveyQuestionnaire",
=======
    new Set(
      quest
        .map((q) => q.questionnaire_type)
        .filter((type): type is string => type !== null)
    )
  );
}


const mapToBackendType = (type: string): string => {
  const map: Record<string, string> = {
    "Review": "ReviewQuestionnaire",
    "Author feedback": "AuthorFeedbackQuestionnaire",
    "Teammate Review": "TeammateReviewQuestionnaire",
    "Survey": "SurveyQuestionnaire",
>>>>>>> 99891da (UI consistency: blue add buttons, questionnaire table improvements)
    "Assignment survey": "AssignmentSurveyQuestionnaire",
    "Global survey": "GlobalSurveyQuestionnaire",
    "Course survey": "CourseEvaluationQuestionnaire",
    "Bookmark rating": "BookmarkRatingQuestionnaire",
<<<<<<< HEAD
    Quiz: "QuizQuestionnaire",
=======
    "Quiz": "QuizQuestionnaire"
>>>>>>> 99891da (UI consistency: blue add buttons, questionnaire table improvements)
  };
  return map[type] || type.replace(/\s+/g, "");
};

const mapToFrontendType = (type: string): string => {
  const map: Record<string, string> = {
<<<<<<< HEAD
    ReviewQuestionnaire: "Review",
    AuthorFeedbackQuestionnaire: "Author feedback",
    TeammateReviewQuestionnaire: "Teammate Review",
    SurveyQuestionnaire: "Survey",
    AssignmentSurveyQuestionnaire: "Assignment survey",
    GlobalSurveyQuestionnaire: "Global survey",
    CourseEvaluationQuestionnaire: "Course survey",
    BookmarkRatingQuestionnaire: "Bookmark rating",
    QuizQuestionnaire: "Quiz",
=======
    "ReviewQuestionnaire": "Review",
    "AuthorFeedbackQuestionnaire": "Author feedback",
    "TeammateReviewQuestionnaire": "Teammate Review",
    "SurveyQuestionnaire": "Survey",
    "AssignmentSurveyQuestionnaire": "Assignment survey",
    "GlobalSurveyQuestionnaire": "Global survey",
    "CourseEvaluationQuestionnaire": "Course survey",
    "BookmarkRatingQuestionnaire": "Bookmark rating",
    "QuizQuestionnaire": "Quiz"
>>>>>>> 99891da (UI consistency: blue add buttons, questionnaire table improvements)
  };
  return map[type] || type;
};

export const transformQuestionnaireRequest = (values: QuestionnaireFormValues) => {
  console.log("Original Form Values:", values);
  const questionnaire: QuestionnaireRequest = {
    id: values.id,
    name: values.name,
    questionnaire_type: mapToBackendType(values.questionnaire_type),
    private: values.private,
    min_question_score: values.min_question_score,
    max_question_score: values.max_question_score,
    instructor_id: values.instructor_id,
    items_attributes: values.items
      ? values.items.map((item, index) => {
<<<<<<< HEAD
          let sizeStr = item.size;
          if (item.question_type === "Text area" || item.question_type === "Criterion") {
            sizeStr = `${item.textarea_width || ""},${item.textarea_height || ""}`;
          } else if (item.question_type === "Text field") {
            sizeStr = `${item.textbox_width || ""}`;
          }
          return {
            ...item,
            size: sizeStr,
=======
          let size: string | number | undefined = item.size;
          let alternatives: string | undefined = item.alternatives;

          if (item.question_type === "Text area" || item.question_type === "Criterion") {
            // size = "textarea_width,textarea_height"
            size = `${item.textarea_width ?? ""},${item.textarea_height ?? ""}`;
          } else if (item.question_type === "Grid") {
            // Use ?? (not ||) so that 0 is preserved, not treated as empty
            const cols = item.columns != null && item.columns !== "" ? item.columns : "";
            const rws = item.rows != null && item.rows !== "" ? item.rows : "";
            size = `${cols},${rws}`;
            // Store label lists in alternatives as "column_names|row_names"
            alternatives = `${item.column_names ?? ""}|${item.row_names ?? ""}`;
          } else if (item.question_type === "Text field") {
            size = `${item.textbox_width ?? ""}`;
          }

          return {
            ...item,
            size,
            alternatives,
>>>>>>> 99891da (UI consistency: blue add buttons, questionnaire table improvements)
            seq: index + 1,
            break_before: item.break_before ?? false,
          };
        })
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
    questionnaire_type: mapToFrontendType(data.questionnaire_type),
    min_question_score: data.min_question_score,
    max_question_score: data.max_question_score,
    instructor_id: data.instructor_id,
    instructor: data.instructor,
    created_at: data.created_at,
    updated_at: data.updated_at,
    items: data.items
      ? data.items.map((item: any) => {
<<<<<<< HEAD
          let textarea_width = item.textarea_width ?? "";
          let textarea_height = item.textarea_height ?? "";
          let textbox_width = item.textbox_width ?? "";

          if (item.size) {
            const parts = String(item.size).split(",");
            if (
              item.question_type === "Text area" ||
              item.question_type === "Criterion" ||
              item.question_type === "TextArea"
            ) {
              textarea_width = parts[0] || "";
              textarea_height = parts[1] || "";
            } else if (item.question_type === "Text field" || item.question_type === "TextField") {
              textbox_width = parts[0] || "";
            }
          }
          return {
            ...item,
            question_type: mapToFrontendType(item.question_type ?? ""),
            textarea_width,
            textarea_height,
            textbox_width,
=======
          let textarea_width: number | string = "";
          let textarea_height: number | string = "";
          let textbox_width: number | string = "";
          let column_names: string = "";
          let row_names: string = "";
          let columns: number | string = "";
          let rows: number | string = "";

          const qType = (item.question_type ?? "") as string;
          const sizeStr = item.size ? String(item.size) : "";
          const altStr  = item.alternatives ? String(item.alternatives) : "";

          if (qType === "Text area" || qType === "Criterion" || qType === "TextArea") {
            // size = "width,height"
            const parts = sizeStr.split(",");
            textarea_width  = parts[0] || "";
            textarea_height = parts[1] || "";

          } else if (qType === "Text field" || qType === "TextField") {
            textbox_width = sizeStr;

          } else if (qType === "Grid") {
            // alternatives = "column_names|row_names"
            const altParts = altStr.split("|");
            column_names = altParts[0] ?? "";
            row_names    = altParts[1] ?? "";

            // size = "columns,rows" (numeric)
            const sizeParts = sizeStr.split(",");
            const parsedCols = parseInt(sizeParts[0], 10);
            const parsedRows = parseInt(sizeParts[1], 10);
            columns = !isNaN(parsedCols) && parsedCols > 0 ? parsedCols : "";
            rows    = !isNaN(parsedRows) && parsedRows > 0 ? parsedRows : "";
          }

          return {
            ...item,
            question_type: mapToFrontendType(qType),
            textarea_width,
            textarea_height,
            textbox_width,
            column_names,
            row_names,
            columns,
            rows,
>>>>>>> 99891da (UI consistency: blue add buttons, questionnaire table improvements)
          };
        })
      : [],
  };
};

<<<<<<< HEAD
=======

>>>>>>> 99891da (UI consistency: blue add buttons, questionnaire table improvements)
export async function loadQuestionnaire({ params }: any) {
  if (params.id) {
    const response = await axiosClient.get(`/questionnaires/${params.id}`);
    return transformQuestionnaireResponse(response.data);
  } else {
    const response = await axiosClient.get(`/questionnaires`);
    return response.data.map((q: any) => transformQuestionnaireResponse(q));
  }
}
