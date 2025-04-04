import * as Yup from "yup";
import axiosClient from "../../utils/axios_client";
import { IEditor } from "../../utils/interfaces";
import { QuestionnaireFormValues } from "./QuestionnaireUtils";
import React, { useEffect, useState } from "react";
import { Outlet, useLoaderData, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useAPI from "hooks/useAPI";
import { Formik, Field, Form } from "formik";
import { Button, Container, Row, Col, Modal } from 'react-bootstrap';

interface IAlertProps {
  variant: string;
  title?: string;
  message: string;
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

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    questionnaire_type: Yup.string().required("Type is required"),
    min_question_score: Yup.number().required("Minimum score is required"),
    max_question_score: Yup.number()
      .moreThan(Yup.ref("min_question_score"), "Max score must be greater than min score")
      .required("Maximum score is required"),
  });

  // FIXME: Implement HTTP method to submit form values
  const handleSubmit = async (values: QuestionnaireFormValues) => {
    console.log("Submit:", values);
  };


  // Define initial form values
  const initialValues: QuestionnaireFormValues = {
    id: questionnaire?.id ?? undefined,
    name: questionnaire?.name ?? "",
    questionnaire_type: questionnaire?.questionnaire_type ?? type ?? "",
    private: questionnaire?.private ?? false,
    min_question_score: questionnaire?.min_question_score ?? 0,
    max_question_score: questionnaire?.max_question_score ?? 10,
  };


  const handleClose = () => navigate(location.state?.from ? location.state.from : "/questionnaires");

  // FIXME: Implement form for editing/creating an assignment
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
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, errors, touched }) => (
              <Form>
                <h5>Name</h5>
                <Field
                  name="name"
                  className="form-control"
                  placeholder="Enter questionnaire name"
                  value={values.name}
                  onChange={handleChange}
                />
                {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}

                <br />
                
                <Field
                  name="questionnaire_type"
                  className="form-control"
                  placeholder="Enter type"
                  value={values.questionnaire_type}
                  onChange={handleChange}
                  type="hidden"
                />
                {errors.questionnaire_type && touched.questionnaire_type && (
                  <div className="text-danger">{errors.questionnaire_type}</div>
                )}

                <br />

                <h5>Private</h5>
                <Field
                  name="private"
                  type="checkbox"
                  className="form-check-input"
                  checked={values.private}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="private">Private</label>

                <br />

                <h5>Minimum Question Score</h5>
                <Field
                  name="min_question_score"
                  type="number"
                  className="form-control"
                  value={values.min_question_score}
                  onChange={handleChange}
                />
                {errors.min_question_score && touched.min_question_score && (
                  <div className="text-danger">{errors.min_question_score}</div>
                )}

                <br />

                <h5>Maximum Question Score</h5>
                <Field
                  name="max_question_score"
                  type="number"
                  className="form-control"
                  value={values.max_question_score}
                  onChange={handleChange}
                />
                {errors.max_question_score && touched.max_question_score && (
                  <div className="text-danger">{errors.max_question_score}</div>
                )}

                <br />
                <Button type="submit" variant="primary">
                  Save
                </Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
  );
};

export default QuestionnaireEditor;