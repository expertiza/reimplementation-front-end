import axiosClient from "../../utils/axios_client";
import { IEditor } from "../../utils/interfaces";
import { QuestionnaireFormValues , transformQuestionnaireRequest } from "./QuestionnaireUtils";
import React, { useEffect, useState } from "react";
import { useLoaderData, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Col, Container, Modal, Row } from 'react-bootstrap';
import QuestionnaireForm from "./QuestionnaireForm";
import { useSelector} from "react-redux";
import { RootState } from "../../store/store";


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
  // E2619: only set instructor_id for non-quiz questionnaires. When team_id is present the
  // creator is a student whose user type is not Instructor, so the STI-backed belongs_to
  // :instructor validation would reject the record if we pass their user id.
  const isTeamQuiz = !!searchParams.get("team_id");
  if (!isTeamQuiz) {
    values.instructor_id = auth.user.id;
  }
  //values.instructor = auth.user.name;
  console.log("Submit:", values);
  const payload = transformQuestionnaireRequest(values);
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

    // E2619: if this questionnaire was created from the AssignReviewer "Create Quiz" flow,
    // link it to the team via PATCH /teams/:team_id/quiz_questionnaire, then navigate back.
    const teamId = searchParams.get("team_id");
    const returnTo = searchParams.get("return_to");
    if (mode === "create" && teamId && response.data?.id) {
      try {
        await axiosClient.patch(
          `/teams/${teamId}/quiz_questionnaire`,
          { questionnaire_id: response.data.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (linkErr) {
        console.error("Failed to link quiz questionnaire to team:", linkErr);
      }
      navigate(returnTo ? decodeURIComponent(returnTo) : "/questionnaires");
      return;
    }

    navigate("/questionnaires");
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};



  // initial form values
  const initialValues: QuestionnaireFormValues = {
    id: questionnaire?.id ?? undefined,
    name: questionnaire?.name ?? "",
    questionnaire_type: questionnaire?.questionnaire_type ?? type ?? "",
    private: questionnaire?.private ?? false,
    min_question_score: questionnaire?.min_question_score ?? 0,
    max_question_score: questionnaire?.max_question_score ?? 10,
    items: fetchedItems.length > 0 ? fetchedItems.map(item => ({
      id: item.id,          
      txt: item.txt,
      question_type: item.question_type,
      weight: item.weight,
      alternatives: item.alternatives,
      min_label: item.min_label,
      max_label: item.max_label,
      textarea_width: item.textarea_width,
      textarea_height: item.textarea_height,
      textbox_width: item.textbox_width,
      col_names: item.col_names,
      row_names: item.row_names,
      seq: item.seq,
      break_before: item.break_before,
      _destroy: item._destroy || false,
      correct_answer: item.correct_answer ?? "",
    })) : questionnaire?.items ?? [],
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
