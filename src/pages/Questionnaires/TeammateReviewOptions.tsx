import React from "react";
import { ErrorMessage, Field, useFormikContext } from "formik";
import { QuestionnaireFormValues } from "./QuestionnaireUtils";

const DUTIES = ["Project Management", "Code Review", "Testing", "Documentation"];

// Extra form field that applies only to Teammate Review questionnaires.
// A Teammate Review questionnaire can be tied to the duty of the team member being
// reviewed (for example, Code Review). We say "duty" and not "role" because "role" in
// Expertiza means super admin, admin, instructor, and so on.
// To support another questionnaire type with its own "extra" fields, add a similar
// component and pick it by questionnaire_type.
//
// NOTE: the backend questionnaires table has no duty column yet, so these values are
// not saved. The form says so to the user. Once the backend stores the duty, add
// `relatesToDuty` / `selectedDuty` to transformQuestionnaireRequest and Response.
const TeammateReviewOptions: React.FC = () => {
  const { values } = useFormikContext<QuestionnaireFormValues>();

  if (values.questionnaire_type !== "Teammate Review") return null;

  return (
    <div className="mb-3">
      <div className="form-check mb-2">
        <Field type="checkbox" name="relatesToDuty" className="form-check-input" id="relatesToDuty" />
        <label
          htmlFor="relatesToDuty"
          className="form-check-label fw-semibold"
          style={{ fontSize: "14px" }}
        >
          This rubric relates to a particular duty.
        </label>
      </div>

      {values.relatesToDuty && (
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
          <div className="text-muted small mt-1">
            Not saved yet: the server does not store the duty for a questionnaire.
          </div>
        </div>
      )}
    </div>
  );
};

export default TeammateReviewOptions;
