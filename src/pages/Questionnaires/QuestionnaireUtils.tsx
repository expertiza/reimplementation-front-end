import axiosClient from "../../utils/axios_client";
import { IInstructor } from "../../utils/interfaces";

export type QuestionnaireType =
  | "Author feedback"
  | "Teammate Review"
  | "Survey"
  | "Assignment survey"
  | "Global survey"
  | "Course survey"
  | "Bookmark rating"
  | "Quiz";


export const QuestionnaireTypes: QuestionnaireType[] = [
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
  correct_answer?: string;
  textarea_width?: number;
  textarea_height?: number;
  textbox_width?: number;
  col_names?: string;
  row_names?: string;
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

/**
 * Extracts the unique, non-null questionnaire type strings from an array of
 * questionnaire response objects.
 *
 * @param quest - Array of {@link QuestionnaireResponse} objects from the API.
 * @returns A de-duplicated array of questionnaire type strings.
 */
export function getQuestionnaireTypes(quest: QuestionnaireResponse[]): string[] {
  return Array.from(
    new Set(
      quest
        .map((q) => q.questionnaire_type)
        .filter((type): type is string => type !== null)
    )
  );
}


/**
 * Transforms {@link QuestionnaireFormValues} into the request shape expected by
 * the Rails questionnaires API.
 *
 * Strips whitespace from `questionnaire_type` (e.g. `"Quiz Questionnaire"` →
 * `"QuizQuestionnaire"`), re-sequences items by their current array index, and
 * ensures every item has `break_before` set.
 *
 * @param values - The current Formik form values from the questionnaire editor.
 * @returns An object `{ questionnaire: QuestionnaireRequest }` ready to be
 *   passed as the request body.
 */
export const transformQuestionnaireRequest = (values: QuestionnaireFormValues) => {
  console.log("Original Form Values:", values);
  const questionnaire: QuestionnaireRequest = {
    id: values.id,
    name: values.name,
    questionnaire_type: values.questionnaire_type.replace(/\s+/g, ""),
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

/**
 * Transforms a raw questionnaire API response into {@link QuestionnaireFormValues}
 * for use as Formik initial values.
 *
 * @param data - Raw object returned by `GET /questionnaires/:id`.
 * @returns A {@link QuestionnaireFormValues} instance ready to hydrate the form.
 */
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


/**
 * React Router loader for the questionnaire editor route.
 *
 * When a `:id` param is present, fetches and transforms the single questionnaire
 * at `GET /questionnaires/:id`.  Otherwise fetches the full list from
 * `GET /questionnaires` and transforms every entry.
 *
 * @param context - The React Router loader context containing `params`.
 * @returns A single {@link QuestionnaireFormValues} in edit mode, or an array
 *   of them in list mode.
 */
export async function loadQuestionnaire({ params }: any) {
  if (params.id) {
    const response = await axiosClient.get(`/questionnaires/${params.id}`);
    return transformQuestionnaireResponse(response.data);
  } else {
    const response = await axiosClient.get(`/questionnaires`);
    return response.data.map((q: any) => transformQuestionnaireResponse(q));
  }
}


