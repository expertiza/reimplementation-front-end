import { QuestionnaireFormValues } from "./QuestionnaireUtils";
import React from "react";
import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
import { Button } from 'react-bootstrap';
import QuestionnaireItemsFieldArray from "./QuestionnaireItemsFieldArray";
import * as Yup from "yup";


// const QuestionnaireForm = ({ initialValues, validationSchema, handleSubmit }: any) => {
const QuestionnaireForm = ({ initialValues, handleSubmit }: any) => {

  const itemFields = Yup.object().shape({
    txt: Yup.string().required("Question text is required"),
    question_type: Yup.string().required("Question type is required"),
    weight: Yup.number()
      .required("Weight is required")
      .positive("Weight must be a positive number"),

    alternatives: Yup.string().when("question_type", ([questionType], schema) => {
      if (questionType === "dropdown" || questionType === "multiple_choice") {
        return schema
          .required("Options are required")
          .test(
            "min-2-options",
            "Enter at least two options, separated by commas.",
            (value) => {
              if (!value) return false;
              const options = value
                .split(",")
                .map((opt) => opt.trim())
                .filter((opt) => opt !== "");
              return options.length >= 2;
            }
          );
      }
      return schema.notRequired();
    }),

    min_label: Yup.string().when("question_type", ([question_type], schema) => {
      return question_type === "scale"
        ? schema.required("Minimum label is required")
        : schema.notRequired();
    }),

    max_label: Yup.string().when("question_type", ([question_type], schema) => {
      return question_type === "scale"
        ? schema.required("Maximum label is required")
        : schema.notRequired();
    }),
  });

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    questionnaire_type: Yup.string().required("Questionnaire type is required"),
    private: Yup.boolean(),
    min_question_score: Yup.number().required("Minimum question score is required"),
    max_question_score: Yup.number().required("Maximum question score is required"),
    items: Yup.array().of(itemFields).min(1, "At least one question is required"),
  });


  return (
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
          <ErrorMessage name="name" component="div" className="text-danger" />


          <Field
            name="questionnaire_type"
            className="form-control"
            placeholder="Enter type"
            value={values.questionnaire_type}
            onChange={handleChange}
            type="hidden"
          />
          <ErrorMessage name="questionnaire_type" component="div" className="text-danger" />

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
          <ErrorMessage name="min_question_score" component="div" className="text-danger" />

          <br />

          <h5>Maximum Question Score</h5>
          <Field
            name="max_question_score"
            type="number"
            className="form-control"
            value={values.max_question_score}
            onChange={handleChange}
          />
          <ErrorMessage name="max_question_score" component="div" className="text-danger" />

          <br />

          {/* FIXME: Implement additional fields to add items to the questionnaire */}
          <h5>Items</h5>
          <QuestionnaireItemsFieldArray values={values} errors={errors} touched={touched} />

          <br />
          <Button type="submit" variant="primary">
            Save
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default QuestionnaireForm;