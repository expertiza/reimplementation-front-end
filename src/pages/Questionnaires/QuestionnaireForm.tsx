  import React, { useEffect, useState } from "react";
  import { Formik, Field, Form, ErrorMessage } from "formik";
  import { Button, Tabs, Tab } from 'react-bootstrap';
  import QuestionnaireItemsFieldArray from "./QuestionnaireItemsFieldArray";
  import * as Yup from "yup";
  import useAPI from "hooks/useAPI";


  const QuestionnaireForm = ({ initialValues, onSubmit }: any) => {

    const { data: itemTypes, sendRequest: fetchItemTypes } = useAPI();
  

    useEffect(() => {
      fetchItemTypes({ url: "/questions/types" });
    }, [fetchItemTypes]);
    
    const fallbackItemTypes = [
      "Criterion",
      "Scale",
      "Dropdown",
      "Multiple choice",
      "Text area",
      "Text field",
      "Grid"
    ];

    const finalItemTypes = itemTypes?.data && itemTypes.data.length > 0
      ? itemTypes.data.map((t: any) => t.name || t)
      : fallbackItemTypes;
      

    const itemFields = Yup.object().shape({
      txt: Yup.string().required("Item text is required"),
      question_type: Yup.string().required("Item type is required"),
      weight: Yup.number()
      .typeError("Score must be a number") 
      .positive("Score must be a positive number")
      .nullable() 
      .notRequired(), 

      alternatives: Yup.string().when("question_type", ([questionType], schema) => {
        if (questionType === "Dropdown" || questionType === "Multiple choice") {
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

      min_label: Yup.string().when("question_type", ([questionType], schema) => {
        return questionType === "Scale"
          ? schema.required("Minimum label is required")
          : schema.notRequired();
      }),

      max_label: Yup.string().when("question_type", ([questionType], schema) => {
        return questionType === "Scale"
          ? schema.required("Maximum label is required")
          : schema.notRequired();
      }),
    });

    const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    questionnaire_type: Yup.string().required("Questionnaire type is required"),
    private: Yup.boolean(),
    min_question_score: Yup.number().required("Minimum item score is required"),
    max_question_score: Yup.number().required("Maximum item score is required"),
    items: Yup.array().of(itemFields).min(1, "At least one item is required"),
  });


    return (
      <div className="bg-transparent shadow-none border-0" style={{ maxWidth: "1200px", margin: "auto", background: "transparent" }}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={onSubmit}
      >
        {({ values, handleChange, errors, touched }) => (
          <Form>
            <Tabs defaultActiveKey="general" id="questionnaire-tabs" className="mb-3">
              <Tab eventKey="general" title="General">
                <div style={{ width: '60%', marginTop: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', alignItems: 'center', rowGap: '15px', columnGap: '20px', gridTemplateColumns: 'max-content 1fr' }}>
                    
                    <label className="form-label mb-0 fw-semibold" style={{ fontSize: "14px" }}>Name</label>
                    <div>
                      <Field
                        name="name"
                        className="form-control"
                        placeholder="Enter questionnaire name"
                        value={values.name}
                        onChange={handleChange}
                      />
                      <ErrorMessage name="name" component="div" className="text-danger small mt-1" />
                    </div>

                    <label className="form-label mb-0 fw-semibold" style={{ fontSize: "14px" }}>Min Item Score</label>
                    <div>
                      <Field
                        type="number"
                        name="min_question_score"
                        placeholder="0"
                        className="form-control"
                        style={{ width: "100px" }}
                      />
                      <ErrorMessage name="min_question_score" component="div" className="text-danger small mt-1" />
                    </div>

                    <label className="form-label mb-0 fw-semibold" style={{ fontSize: "14px" }}>Max Item Score</label>
                    <div>
                      <Field
                        type="number"
                        name="max_question_score"
                        placeholder="10"
                        className="form-control"
                        style={{ width: "100px" }}
                      />
                      <ErrorMessage name="max_question_score" component="div" className="text-danger small mt-1" />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="form-check mb-2">
                    <Field
                      type="checkbox"
                      name="private"
                      className="form-check-input"
                      id="private"
                    />
                    <label htmlFor="private" className="form-check-label fw-semibold" style={{ fontSize: "14px" }}>
                      Private Questionnaire
                    </label>
                  </div>

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
                        <div style={{ paddingLeft: "25px" }}>
                          <span style={{ fontSize: "14px" }} className="fw-semibold">
                            Select Duty
                          </span>
                          <Field
                            as="select"
                            name="selectedDuty"
                            className="form-control mt-1"
                            style={{ maxWidth: "300px" }}
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
                            className="text-danger small mt-1"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Tab>

              <Tab eventKey="questions" title="Questions">
                <div className="mt-3">
                  <QuestionnaireItemsFieldArray values={values} errors={errors} touched={touched} itemTypes={finalItemTypes} />
                </div>
              </Tab>
            </Tabs>

            <Field
              name="questionnaire_type"
              className="form-control"
              placeholder="Enter type"
              value={values.questionnaire_type}
              onChange={handleChange}
              type="hidden"
            />
            
            <div className="mt-4 pt-3 border-top">
              <Button type="submit" variant="success" className="px-4">
                Save
              </Button>
            </div>
          </Form>
        )}
      </Formik>
      </div>
    );
  };

  export default QuestionnaireForm;
