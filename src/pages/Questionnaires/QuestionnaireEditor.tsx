import axiosClient from "../../utils/axios_client";
import * as Yup from "yup";
import { IEditor } from "../../utils/interfaces";
import { QuestionnaireFormValues } from "./QuestionnaireUtils";
import React, { useState } from "react";
import { useLoaderData, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Modal } from 'react-bootstrap';
import QuestionnaireForm from "./QuestionnaireForm";


interface IAlertProps {
  variant: string;
  title?: string;
  message: string;
}

interface QuestionnaireFormWithItems extends QuestionnaireFormValues {
  items: {
    txt: string;
    question_type: string;
    weight: number;
    break_before: boolean;
    alternatives?: string;
    min_label?: string;
    max_label?: string;
  }[];
}

const QuestionnaireEditor: React.FC<IEditor> = ({ mode }) => {
  const [alert, setAlert] = useState<IAlertProps | null>(null);
  const token = localStorage.getItem("token");
  const questionnaire :any = useLoaderData();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const type = searchParams.get("type");

  // Can view the decoded type in browser console
  console.log("Type:", type);


  // FIXME: See note below
  // const onSubmit = async (values: QuestionnaireFormWithItems) => {
  //   console.log("Submit:", values);
  //   console.log("Submit:", values.items);
  // };


  // FIXME: This only works with slight changes to the backend.
  // Added to the Questionnaire model "accepts_nested_attributes_for :items, allow_destroy: true"
  // allows the items belonging to a questionnaire to be saved at the same time. This also
  // requires updating the questionnaire_params in questionnaire_controller.rb to include item_attributes.
  // Including this method without theses changes will result in a failure to submit the form.
  // Comment out this version of onSubmit, and include the implementation above to simply print
  // the form values to the browser console.
  const onSubmit = async (values: any) => {
    const endpoint = mode === "create"
      ? "/questionnaires"   // creating questionnaires
      : `/questionnaires/edit/${values.id}`;  // updating questionnaires

    try {
      const response = await axiosClient[mode === "create" ? "post" : "put"](endpoint, values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Server Response:", response.data);

      // Navigate back to questionnaire management dashboard
      navigate(`/questionnaires`)
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };


  // initial form values
  const initialValues: QuestionnaireFormWithItems = {
    id: questionnaire?.id ?? undefined,
    name: questionnaire?.name ?? "",
    questionnaire_type: questionnaire?.questionnaire_type ?? type ?? "",
    private: questionnaire?.private ?? false,
    min_question_score: questionnaire?.min_question_score ?? 0,
    max_question_score: questionnaire?.max_question_score ?? 10,
    items: questionnaire?.items ?? [{ text: "" }],
  };

  const handleClose = () => navigate(location.state?.from ? location.state.from : "/questionnaires");

  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "update"
            ? `Update Questionnaire - ${questionnaire.name}`
            : `Create ${type} Questionnaire`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <QuestionnaireForm
            initialValues={initialValues}
            // validationSchema={validationSchema}
            onSubmit={onSubmit}
          />
        </Modal.Body>
      </Modal>
  );
};

export default QuestionnaireEditor;