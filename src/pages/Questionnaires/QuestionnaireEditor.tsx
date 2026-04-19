import axiosClient from "../../utils/axios_client";
import { IEditor } from "../../utils/interfaces";
import { IItem, QuestionnaireFormValues, transformQuestionnaireRequest } from "./QuestionnaireUtils";
import React, { useEffect, useState } from "react";
import { useLoaderData, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Col, Container, Row } from 'react-bootstrap';
import QuestionnaireForm from "./QuestionnaireForm";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { alertActions } from "../../store/slices/alertSlice";


const QuestionnaireEditor: React.FC<IEditor> = ({ mode }) => {
  const token = localStorage.getItem("token");
  const questionnaire = useLoaderData() as QuestionnaireFormValues | undefined;
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const type = searchParams.get("type");

  const [fetchedItems, setFetchedItems] = useState<IItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);


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


  const onSubmit = async (values: QuestionnaireFormValues) => {
  values.instructor_id = auth.user.id;
  const payload = transformQuestionnaireRequest(values);
  const endpoint = mode === "create"
    ? "/questionnaires"
    : `/questionnaires/${values.id}`;

  setIsSubmitting(true);
  try {
    await axiosClient[mode === "create" ? "post" : "put"](
      endpoint,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    dispatch(alertActions.showAlert({
      variant: "success",
      message: `Questionnaire "${values.name}" ${mode === "create" ? "created" : "updated"} successfully!`,
    }));
    navigate("/questionnaires");
  } catch (error: any) {
    const message = error?.response?.data?.error ?? "Failed to save questionnaire. Please try again.";
    dispatch(alertActions.showAlert({ variant: "danger", message }));
  } finally {
    setIsSubmitting(false);
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
    })) : questionnaire?.items ?? [],
  };

  return (
       <Container fluid className="px-md-4">
                 <Row className="mt-md-2 mb-md-2">
                   <Col className="text-center">
                     <h1>{mode === "update"
            ? `Update Questionnaire: ${questionnaire?.name}`
            : `Create ${type} Questionnaire`}</h1>
                   </Col>
                   <hr />
                 </Row>
      <Row style={{ marginLeft: "5px" }}>
        <Col>
          <QuestionnaireForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          /> 
        </Col>
      </Row>
    </Container>
  );
};

export default QuestionnaireEditor;
