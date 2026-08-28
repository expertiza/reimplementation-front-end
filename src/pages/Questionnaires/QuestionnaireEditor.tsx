import axiosClient from "../../utils/axios_client";
import { IEditor } from "../../utils/interfaces";
import { QuestionnaireFormValues , transformQuestionnaireRequest } from "./QuestionnaireUtils";
import React, { useEffect, useState } from "react";
import { useLoaderData, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Col, Container, Modal, Row } from 'react-bootstrap';
import QuestionnaireForm from "./QuestionnaireForm";
import { useSelector} from "react-redux";
import { RootState } from "../../store/store";

const displayQuestionnaireType = (questionnaireType?: string) => {
  const typeMap: Record<string, string> = {
    ReviewQuestionnaire: "Review",
    MetareviewQuestionnaire: "Metareview",
    AuthorFeedbackQuestionnaire: "Author feedback",
    "Author FeedbackQuestionnaire": "Author feedback",
    TeammateReviewQuestionnaire: "Teammate Review",
    "Teammate ReviewQuestionnaire": "Teammate Review",
    SurveyQuestionnaire: "Survey",
    AssignmentSurveyQuestionnaire: "Assignment survey",
    "Assignment SurveyQuestionnaire": "Assignment survey",
    GlobalSurveyQuestionnaire: "Global survey",
    "Global SurveyQuestionnaire": "Global survey",
    CourseSurveyQuestionnaire: "Course survey",
    "Course SurveyQuestionnaire": "Course survey",
    BookmarkRatingQuestionnaire: "Bookmark rating",
    "Bookmark RatingQuestionnaire": "Bookmark rating",
    QuizQuestionnaire: "Quiz",
  };

  return questionnaireType ? typeMap[questionnaireType] ?? questionnaireType : "";
};

const mapFetchedItemToFormItem = (item: any) => {
  const size = typeof item.size === "string" ? item.size.split(",").map((value: string) => value.trim()) : [];
  const [width, height] = size;

  return {
    id: item.id,
    txt: item.txt,
    question_type: item.question_type,
    weight: item.weight ?? "",
    alternatives: item.alternatives ? item.alternatives.split("|").join(", ") : "",
    min_label: item.min_label ?? "",
    max_label: item.max_label ?? "",
    textarea_width: item.question_type === "Criterion" || item.question_type === "TextArea" ? width ?? "" : "",
    textarea_height: item.question_type === "Criterion" || item.question_type === "TextArea" ? height ?? "" : "",
    textbox_width: item.question_type === "TextField" ? item.size ?? "" : "",
    col_names: item.col_names ?? "",
    row_names: item.row_names ?? "",
    seq: item.seq,
    break_before: item.break_before,
    _destroy: item._destroy || false,
  };
};

const QuestionnaireEditor: React.FC<IEditor> = ({ mode }) => {
  const token = localStorage.getItem("token");
  const questionnaire :any = useLoaderData();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const type = searchParams.get("type");

  const [fetchedItems, setFetchedItems] = useState<any[]>([]);


  useEffect(() => {
  const fetchItemsForQuestionnaire = async () => {
    if (mode === "update" && questionnaire?.id) {
      try {
        const response = await axiosClient.get(`/questionnaires/${questionnaire.id}/items`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFetchedItems(response.data);
      } catch (err) {
        console.error("Error fetching questionnaire items:", err);
      }
    }
  };

  fetchItemsForQuestionnaire();
}, [mode, questionnaire?.id, token]);

  

   const auth = useSelector(
      (state: RootState) => state.authentication,
      (prev, next) => prev.isAuthenticated === next.isAuthenticated
    );

  // Can view the decoded type in browser console
  console.log("Type:", type);


  // the form values to the browser console.
  const onSubmit = async (values: QuestionnaireFormValues) => {
  const normalizedValues: QuestionnaireFormValues = {
    ...values,
    instructor_id: mode === "create" ? auth.user.id : values.instructor_id ?? questionnaire?.instructor_id,
  };
  console.log("Submit:", normalizedValues);
  const payload = transformQuestionnaireRequest(normalizedValues);
  const endpoint = mode === "create"
    ? "/questionnaires"
    : `/questionnaires/${values.id}`;

  try {
    const response = await axiosClient[mode === "create" ? "post" : "put"](
      endpoint,
      payload, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Saved Questionnaire:", response.data);
    navigate("/questionnaires");
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};



  // initial form values
  const initialValues: QuestionnaireFormValues = {
    id: questionnaire?.id ?? undefined,
    name: questionnaire?.name ?? "",
    questionnaire_type: displayQuestionnaireType(questionnaire?.questionnaire_type) || type || "",
    private: questionnaire?.private ?? false,
    min_question_score: questionnaire?.min_question_score ?? 0,
    max_question_score: questionnaire?.max_question_score ?? 10,
    items: fetchedItems.length > 0 ? fetchedItems.map(mapFetchedItemToFormItem) : questionnaire?.items ?? [],
  };

  return (
       <Container fluid className="px-md-4">
                 <Row className="mt-md-2 mb-md-2">
                   <Col className="text-center">
                     <h1>{mode === "update"
            ? `Update Questionnaire: ${questionnaire.name}`
            : `Create ${type} Questionnaire`}</h1>
                   </Col>
                   <hr />
                 </Row>
      <Row style={{ marginLeft: "5px" }}>
        <Col>
          <QuestionnaireForm
            initialValues={initialValues}
            onSubmit={onSubmit}
          /> 
        </Col>
      </Row>
    </Container>
  );
};

export default QuestionnaireEditor;
