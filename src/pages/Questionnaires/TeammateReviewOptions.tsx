import React from "react";
import { ErrorMessage, Field, useFormikContext } from "formik";
import { QuestionnaireFormValues } from "./QuestionnaireUtils";

const DUTIES = ["Project Management", "Code Review", "Testing", "Documentation"];

// Extra form fields that only apply to Teammate Review questionnaires.
// To support another type with its own fields, add a similar component and
// pick it by questionnaire_type.
const TeammateReviewOptions: React.FC = () => {
  const { values } = useFormikContext<QuestionnaireFormValues>();

  if (values.questionnaire_type !== "Teammate Review") return null;

  return (
    <div className="mb-3">
      <div className="form-check mb-2">
        <Field type="checkbox" name="relatesToRole" className="form-check-input" id="relatesToRole" />
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
            Select duty
          </span>
          <Field
            as="select"
            name="selectedDuty"
            className="form-control mt-1"
            style={{ maxWidth: "300px" }}
          >
            <option value="">- Select a duty -</option>
            {DUTIES.map((duty) => (
              <option key={duty} value={duty}>
                {duty}
              </option>
            ))}
          </Field>
          <ErrorMessage name="selectedDuty" component="div" className="text-danger small mt-1" />
        </div>
      )}
    </div>
  );
};

export default TeammateReviewOptions;
