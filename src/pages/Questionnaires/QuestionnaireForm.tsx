import React, { useEffect } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { Button } from "react-bootstrap";
import QuestionnaireItemsFieldArray from "./QuestionnaireItemsFieldArray";
import TeammateReviewOptions from "./TeammateReviewOptions";
import {
  DEFAULT_MAX_ITEM_SCORE,
  DEFAULT_MIN_ITEM_SCORE,
  QuestionnaireFormValues,
  QuestionnaireTypes,
} from "./QuestionnaireUtils";
import * as Yup from "yup";
import useAPI from "hooks/useAPI";

const extractErrors = (errors: unknown): string[] => {
  const result: string[] = [];
  const recurse = (err: unknown, prefix = "") => {
    if (!err) return;
    if (typeof err === "string") {
      result.push(prefix ? `${prefix}: ${err}` : err);
    } else if (Array.isArray(err)) {
      err.forEach((item, index) => {
        if (item) recurse(item, `Item #${index + 1}`);
      });
    } else if (typeof err === "object") {
      Object.entries(err).forEach(([key, val]) => {
        const readableKey =
          key === "txt"
            ? "Prompt"
            : key === "item_type"
            ? "Type"
            : key === "min_label"
            ? "Min label"
            : key === "max_label"
            ? "Max label"
            : key === "alternatives"
            ? "Options"
            : key === "weight"
            ? "Weight"
            : key === "name"
            ? "Name"
            : key === "questionnaire_type"
            ? "Questionnaire type"
            : key === "min_item_score"
            ? "Min item score"
            : key === "max_item_score"
            ? "Max item score"
            : key === "selectedDuty"
            ? "Duty"
            : key;
        if (typeof val === "string") {
          result.push(prefix ? `${prefix} (${readableKey}): ${val}` : `${readableKey}: ${val}`);
        } else {
          recurse(val, prefix ? `${prefix} (${readableKey})` : readableKey);
        }
      });
    }
  };
  recurse(errors);
  return result;
};

const QuestionnaireForm = ({ initialValues, onSubmit }: {
  initialValues: QuestionnaireFormValues;
  onSubmit: (values: QuestionnaireFormValues) => void | Promise<void>;
}) => {
  const { data: itemTypes, sendRequest: fetchItemTypes } = useAPI();

  useEffect(() => {
    fetchItemTypes({ url: "/items/types" });
  }, [fetchItemTypes]);

  const fallbackItemTypes = [
    "Criterion",
    "Scale",
    "Dropdown",
    "Multiple choice",
    "Text area",
    "Text field",
    "Grid",
  ];

  const finalItemTypes =
    Array.isArray(itemTypes?.data) && itemTypes.data.length > 0
      ? itemTypes.data.map((t: string | { name?: string; label?: string }) => (typeof t === "object" ? t.name || t.label || String(t) : t))
      : fallbackItemTypes;

  const itemFields = Yup.object().shape({
    _destroy: Yup.boolean(),
    txt: Yup.string().when("_destroy", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Item text is required"),
    }),
    item_type: Yup.string().when("_destroy", {
      is: true,
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Item type is required"),
    }),
    weight: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" || originalValue === null || originalValue === undefined
          ? null
          : Number(value)
      )
      .typeError("Weight must be a number")
      .min(0, "Weight must be greater than or equal to 0")
      .nullable()
      .notRequired(),

    alternatives: Yup.string().when(
      ["item_type", "_destroy"],
      ([type, destroy], schema) => {
        if (!destroy && (type === "Dropdown" || type === "Multiple choice")) {
          return schema
            .required("Options are required")
            .test("min-2-options", "Enter at least two options, separated by commas.", (value) => {
              if (!value) return false;
              const options = value
                .split(",")
                .map((opt) => opt.trim())
                .filter((opt) => opt !== "");
              return options.length >= 2;
            });
        }
        return schema.notRequired();
      }
    ),

    min_label: Yup.string().when(
      ["item_type", "_destroy"],
      ([type, destroy], schema) => {
        return !destroy && type === "Scale"
          ? schema.required("Minimum label is required")
          : schema.notRequired();
      }
    ),

    max_label: Yup.string().when(
      ["item_type", "_destroy"],
      ([type, destroy], schema) => {
        return !destroy && type === "Scale"
          ? schema.required("Maximum label is required")
          : schema.notRequired();
      }
    ),
  });

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    questionnaire_type: Yup.string().required("Questionnaire type is required"),
    private: Yup.boolean(),
    min_item_score: Yup.number()
      .typeError("Minimum item score must be a number")
      .required("Minimum item score is required"),
    max_item_score: Yup.number()
      .typeError("Maximum item score must be a number")
      .required("Maximum item score is required")
      .test(
        "max-gte-min",
        "Maximum item score must be greater than or equal to minimum score",
        function (val) {
          const { min_item_score } = this.parent;
          return val == null || min_item_score == null || val >= min_item_score;
        }
      ),
    items: Yup.array()
      .of(itemFields)
      .test(
        "at-least-one-item",
        "At least one item is required",
        (items) => !items || items.filter((item) => !item?._destroy).length >= 1
      ),
  });

  return (
    <div
      className="bg-transparent shadow-none border-0"
      style={{ width: "100%", background: "transparent" }}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={onSubmit}
      >
        {({ values, handleChange, errors, submitCount }) => (
          <Form>
            <div className="mb-4" style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <h5 className="mb-3">Questionnaire Details</h5>
              <div style={{ width: "60%", marginTop: "20px", marginBottom: "20px" }}>
                <div
                  style={{
                    display: "grid",
                    alignItems: "center",
                    rowGap: "15px",
                    columnGap: "20px",
                    gridTemplateColumns: "max-content 1fr",
                  }}
                >
                  <label className="form-label mb-0 fw-semibold" style={{ fontSize: "14px" }}>
                    Name
                  </label>
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

                  <label className="form-label mb-0 fw-semibold" style={{ fontSize: "14px" }}>
                    Type
                  </label>
                  <div>
                    <Field
                      as="select"
                      name="questionnaire_type"
                      className="form-control"
                      value={values.questionnaire_type}
                      onChange={handleChange}
                    >
                      <option value="">— Select questionnaire type —</option>
                      {QuestionnaireTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="questionnaire_type"
                      component="div"
                      className="text-danger small mt-1"
                    />
                  </div>

                  <label className="form-label mb-0 fw-semibold" style={{ fontSize: "14px" }}>
                    Min item score
                  </label>
                  <div>
                    <Field
                      type="number"
                      name="min_item_score"
                      placeholder={String(DEFAULT_MIN_ITEM_SCORE)}
                      className="form-control"
                      style={{ width: "100px" }}
                    />
                    <ErrorMessage
                      name="min_item_score"
                      component="div"
                      className="text-danger small mt-1"
                    />
                  </div>

                  <label className="form-label mb-0 fw-semibold" style={{ fontSize: "14px" }}>
                    Max item score
                  </label>
                  <div>
                    <Field
                      type="number"
                      name="max_item_score"
                      placeholder={String(DEFAULT_MAX_ITEM_SCORE)}
                      className="form-control"
                      style={{ width: "100px" }}
                    />
                    <ErrorMessage
                      name="max_item_score"
                      component="div"
                      className="text-danger small mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="form-check mb-2">
                  <Field type="checkbox" name="private" className="form-check-input" id="private" />
                  <label
                    htmlFor="private"
                    className="form-check-label fw-semibold"
                    style={{ fontSize: "14px" }}
                  >
                    Private questionnaire
                  </label>
                </div>

                <TeammateReviewOptions />
              </div>
            </div>

            <div className="mt-4" style={{ width: "100%" }}>
              <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <h5 className="mb-3">Items</h5>
                <ErrorMessage
                  name="items"
                  render={(msg) =>
                    typeof msg === "string" ? (
                      <div className="alert alert-danger py-2 mb-2">{msg}</div>
                    ) : null
                  }
                />
              </div>
              <QuestionnaireItemsFieldArray
                values={values}
                itemTypes={finalItemTypes}
              />
            </div>

            <div className="mt-4 pt-3 border-top" style={{ maxWidth: "1200px", margin: "0 auto" }}>
              {submitCount > 0 && Object.keys(errors).length > 0 && (
                <div className="alert alert-danger py-2 mb-3 small">
                  <strong>Please fix the following before saving:</strong>
                  <ul className="mb-0 mt-1 ps-3">
                    {extractErrors(errors).map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Button type="submit" variant="primary" className="px-4">
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
