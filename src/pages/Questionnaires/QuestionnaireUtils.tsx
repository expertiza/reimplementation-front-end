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
  col_names?: string;
  row_names?: string;
  break_before?: boolean | number;
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


const mapToBackendType = (type: string): string => {
  const map: Record<string, string> = {
    "Review": "ReviewQuestionnaire",
    "Author feedback": "AuthorFeedbackQuestionnaire",
    "Teammate Review": "TeammateReviewQuestionnaire",
    "Survey": "SurveyQuestionnaire",
    "Assignment survey": "AssignmentSurveyQuestionnaire",
    "Global survey": "GlobalSurveyQuestionnaire",
    "Course survey": "CourseEvaluationQuestionnaire",
    "Bookmark rating": "BookmarkRatingQuestionnaire",
    "Quiz": "QuizQuestionnaire"
  };
  return map[type] || type.replace(/\s+/g, "");
};

const mapToFrontendType = (type: string): string => {
  const map: Record<string, string> = {
    "ReviewQuestionnaire": "Review",
    "AuthorFeedbackQuestionnaire": "Author feedback",
    "TeammateReviewQuestionnaire": "Teammate Review",
    "SurveyQuestionnaire": "Survey",
    "AssignmentSurveyQuestionnaire": "Assignment survey",
    "GlobalSurveyQuestionnaire": "Global survey",
    "CourseEvaluationQuestionnaire": "Course survey",
    "BookmarkRatingQuestionnaire": "Bookmark rating",
    "QuizQuestionnaire": "Quiz"
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
          let sizeStr = item.size;
          if (item.question_type === 'Text area' || item.question_type === 'Criterion') {
            sizeStr = `${item.textarea_width || ''},${item.textarea_height || ''}`;
          } else if (item.question_type === 'Text field') {
            sizeStr = `${item.textbox_width || ''}`;
          }
          return {
            ...item,
            size: sizeStr,
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
    items: data.items ? data.items.map((item: any) => {
      let textarea_width = item.textarea_width ?? "";
      let textarea_height = item.textarea_height ?? "";
      let textbox_width = item.textbox_width ?? "";

      if (item.size) {
        const parts = String(item.size).split(",");
        if (item.question_type === "Text area" || item.question_type === "Criterion" || item.question_type === "TextArea") {
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
      };
    }) : [],
  };
};


export async function loadQuestionnaire({ params }: any) {
  if (params.id) {
    const response = await axiosClient.get(`/questionnaires/${params.id}`);
    return transformQuestionnaireResponse(response.data);
  } else {
    const response = await axiosClient.get(`/questionnaires`);
    return response.data.map((q: any) => transformQuestionnaireResponse(q));
  }
}


