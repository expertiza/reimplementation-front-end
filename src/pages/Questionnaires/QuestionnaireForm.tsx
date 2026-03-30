  import React, { useEffect, useState } from "react";
  import { Formik, Field, Form, ErrorMessage } from "formik";
  import { Button } from 'react-bootstrap';
  import QuestionnaireItemsFieldArray from "./QuestionnaireItemsFieldArray";
  import * as Yup from "yup";
  import useAPI from "hooks/useAPI";
  import { resolveQuestionnaireEditorItemTypes } from "./QuestionnaireUtils";


  const QuestionnaireForm = ({ initialValues, onSubmit }: any) => {

    const { data: itemTypes, sendRequest: fetchItemTypes } = useAPI();
  

    useEffect(() => {
          
            fetchItemTypes({ url: "/questions/types" });
          console.log(itemTypes?.data);
        }, [fetchItemTypes]);
      

    const itemFields = Yup.object().shape({
      txt: Yup.string().required("Item text is required"),
      question_type: Yup.string().required("Item type is required"),
      weight: Yup.number()
      .typeError("Score must be a number") 
      .positive("Score must be a positive number")
      .nullable() 
      .notRequired(), 

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
        return (question_type === "scale" || question_type === "Scale")
          ? schema.required("Minimum label is required")
          : schema.notRequired();
      }),

      max_label: Yup.string().when("question_type", ([question_type], schema) => {
        return (question_type === "scale" || question_type === "Scale")
          ? schema.required("Maximum label is required")
          : schema.notRequired();
      }),
    });

    const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    questionnaire_type: Yup.string().required("Questionnaire type is required"),
    private: Yup.boolean(),
    min_question_score: Yup.number()
      .typeError("Minimum item score is required")
      .transform((value, originalValue) =>
        String(originalValue).trim() === "" ? undefined : value
      )
      .required("Minimum item score is required"),
    max_question_score: Yup.number()
      .typeError("Maximum item score is required")
      .transform((value, originalValue) =>
        String(originalValue).trim() === "" ? undefined : value
      )
      .required("Maximum item score is required"),
    items: Yup.array()
      .of(itemFields)
      .min(
        1,
        "Add at least one rubric row: set the number and item type, click Add, then fill each row’s text before Save."
      ),
  });


    return (
      <div style={{ maxWidth: "800px", margin: "auto" }}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={onSubmit}
      >
        {({ values, handleChange, errors, touched }) => (
          <Form>
            {values.questionnaire_type === "Teammate Review" && (
      <div className="mb-3">
        <div className="form-check mb-2">
          <Field
            type="checkbox"
            name="relatesToRole"
            className="form-check-input"
            id="relatesToRole"
          />
          <label
            htmlFor="relatesToRole"
            className="form-check-label fw-semibold"
            style={{ fontSize: "14px" }}
          >
            This rubric relates to a particular role.
          </label>
        </div>

        {values.relatesToRole && (
          <div>
            <span style={{ fontSize: "14px" }} className="fw-semibold">
              Select Duty
            </span>
            <Field
              as="select"
              name="selectedDuty"
              className="form-control mt-1"
            >
              <option value="">- Select a duty -</option>
              {["Project Management", "Code Review", "Testing", "Documentation"].map(
                (duty) => (
                  <option key={duty} value={duty}>
                    {duty}
                  </option>
                )
              )}
            </Field>
            <ErrorMessage
              name="selectedDuty"
              component="div"
              className="text-danger"
            />
          </div>
        )}
      </div>
    )}
            <span style={{ fontSize: "14px"}} className="fw-semibold">Name</span>

            <Field
              name="name"
              className="form-control"
              placeholder="Enter questionnaire name"
              value={values.name}
              onChange={handleChange}
              style={{ marginBottom: "0px" }}
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

            <div className="d-flex align-items-center mt-1 mb-1">
              <div className="form-check me-2" title="Make questionnaire private, so other instructors cannot see it">
                <Field type="checkbox" name="private" className="form-check-input" id="private" />
                <span style={{ fontSize: "14px"}} className="fw-semibold">Private</span>
              </div>

              <Field
                type="number"
                name="min_question_score"
                placeholder="0"
                className="form-control"
                style={{ width: "60px" }}
              />

              <span style={{ fontSize: "14px"}} className="fw-semibold">&nbsp; &larr; Min &nbsp;&nbsp;&nbsp; Item Score &nbsp;&nbsp;&nbsp; Max &rarr;&nbsp;</span>

              <Field
                type="number"
                name="max_question_score"
                placeholder="10"
                className="form-control"
                style={{ width: "60px" }}
              />
            </div>
            <div className="d-flex gap-3">
              <ErrorMessage name="min_question_score" component="div" className="text-danger" />
              <ErrorMessage name="max_question_score" component="div" className="text-danger" />
            </div>
            <br />


            {/* Allows users to input a variable number of questions / items */}
            <QuestionnaireItemsFieldArray
              values={values}
              errors={errors}
              touched={touched}
              itemTypes={resolveQuestionnaireEditorItemTypes(itemTypes?.data)}
            />
            {/* `errors.items` can be a nested object/array (e.g. `{ txt: ... }` for each row).
                React cannot render that directly, so only render the array-level string error. */}
            {typeof (errors as any)?.items === "string" ? (
              <div className="text-danger small mt-2">{(errors as any).items}</div>
            ) : null}

            <br />
            <Button type="submit" variant="primary">
              Save
            </Button>
          </Form>
        )}
      </Formik>
      </div>
    );
  };

  export default QuestionnaireForm;
