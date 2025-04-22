import axiosClient from "../../utils/axios_client";
import { IEditor } from "../../utils/interfaces";
import { QuestionnaireFormValues , transformQuestionnaireRequest } from "./QuestionnaireUtils";
import React from "react";
import { useLoaderData, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Modal } from 'react-bootstrap';
import QuestionnaireForm from "./QuestionnaireForm";


const QuestionnaireEditor: React.FC<IEditor> = ({ mode }) => {
  const token = localStorage.getItem("token");
  const questionnaire :any = useLoaderData();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const type = searchParams.get("type");

  // Can view the decoded type in browser console
  console.log("Type:", type);


  // FIXME: See note below
  // const onSubmit = async (values: QuestionnaireFormValues) => {
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
    console.log("hello");
    console.log(values.items);
    // transform the values before submitting
    const transformedValues = transformQuestionnaireRequest(values);

    // determine the endpoint based on whether we're creating or updating
    const endpoint = mode === "create"
      ? "/questionnaires"   // creating questionnaires
      : `/questionnaires/${values.id}`;  // updating questionnaires

    try {
      // submit the transformed values to the API
      const response = await axiosClient[mode === "create" ? "post" : "put"](endpoint, transformedValues, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Server Response:", response.data);

      // navigate back to the questionnaire management dashboard
      navigate(`/questionnaires`);
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
    items: questionnaire?.items ?? [    {
      txt: "",
      weight: 1,
      question_type: "",
      break_before: 1,
      alternatives: "",
      min_label: 0,
      max_label: 10,
      seq: 1,
      },
    ],
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
            onSubmit={onSubmit}
          />
        </Modal.Body>
      </Modal>
  );
};

export default QuestionnaireEditor;