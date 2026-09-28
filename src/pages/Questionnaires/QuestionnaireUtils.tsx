import axiosClient from "../../utils/axios_client";
import { IInstructor } from "../../utils/interfaces";

export type QuestionnaireType =
  | "Review"
  | "Metareview"
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
  "Metareview",
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

export interface QuestionnaireTypeGroup {
  type: string;
  questionnaires: QuestionnaireResponse[];
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
  const questionnaireTypeMap: Record<string, string> = {
    Review: "ReviewQuestionnaire",
    Metareview: "MetareviewQuestionnaire",
    "Author feedback": "AuthorFeedbackQuestionnaire",
    "Teammate Review": "TeammateReviewQuestionnaire",
    Survey: "SurveyQuestionnaire",
    "Assignment survey": "AssignmentSurveyQuestionnaire",
    "Global survey": "GlobalSurveyQuestionnaire",
    "Course survey": "CourseSurveyQuestionnaire",
    "Bookmark rating": "BookmarkRatingQuestionnaire",
    Quiz: "QuizQuestionnaire",
  };

  console.log("Original Form Values:", values);
  const questionnaire: QuestionnaireRequest = {
    name: values.name,
    questionnaire_type:
      questionnaireTypeMap[values.questionnaire_type] ?? values.questionnaire_type.replace(/\s+/g, ""),
    private: values.private,
    min_question_score: values.min_question_score,
    max_question_score: values.max_question_score,
    instructor_id: values.instructor_id,
    items_attributes: values.items
      ? values.items.map((item, index) => ({
          ...item,
          seq: index + 1,
          break_before: item.break_before ?? false,
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
    items: data.items,
  };
};


export async function loadQuestionnaire({ params }: any) {
  if (params.id) {
    const response = await axiosClient.get(`/questionnaires/${params.id}`);
    return transformQuestionnaireResponse(response.data);
  }

  return null;
}

export async function loadQuestionnaireHierarchy() {
  const response = await axiosClient.get(`/questionnaires/hierarchical`);
  return response.data.map((group: QuestionnaireTypeGroup) => ({
    ...group,
    questionnaires: group.questionnaires.map((q: any) => transformQuestionnaireResponse(q)),
  }));
}

