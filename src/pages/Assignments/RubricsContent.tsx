import React from "react";
import { Form as BSForm, Table as BSTable } from "react-bootstrap";
import { useFormikContext } from "formik";
import { IAssignmentFormValues } from "./AssignmentUtil";
import FormCheckbox from "../../components/Form/FormCheckBox";
import ToolTip from "../../components/ToolTip";

export interface QuestionnaireOption {
  id: number;
  name: string;
  questionnaire_type: string;
}

type RubricRow = {
  label: string;
  idField: string;
  weightField: string;
  notifField: string;
  dropdownField: string;
  options: QuestionnaireOption[];
};

interface RubricsContentProps {
  questionnaires: QuestionnaireOption[];
}

const RubricsContent: React.FC<RubricsContentProps> = ({ questionnaires }) => {
  const { values, setFieldValue } = useFormikContext<IAssignmentFormValues>();

  const byType = (type: string) => questionnaires.filter((q) => q.questionnaire_type === type);

  const roundCount = values.number_of_review_rounds ?? 1;
  const variesByRound = values.review_rubric_varies_by_round && roundCount > 1;

  const rows: RubricRow[] = [];

  if (values.is_peer_reviewed !== false) {
    if (variesByRound) {
      for (let i = 1; i <= roundCount; i++) {
        rows.push({
          label: `Review Round ${i}`,
          idField: `questionnaire_round_${i}`,
          weightField: `review_round_${i}_weight`,
          notifField: `review_round_${i}_notification_limit`,
          dropdownField: `review_round_${i}_dropdown`,
          options: byType("ReviewQuestionnaire"),
        });
      }
    } else {
      rows.push({
        label: "Review",
        idField: "review_questionnaire_id",
        weightField: "review_questionnaire_weight",
        notifField: "review_questionnaire_notification_limit",
        dropdownField: "review_questionnaire_dropdown",
        options: byType("ReviewQuestionnaire"),
      });
    }
  }

  rows.push({
    label: "Author Feedback",
    idField: "author_feedback_questionnaire_id",
    weightField: "author_feedback_questionnaire_weight",
    notifField: "author_feedback_questionnaire_notification_limit",
    dropdownField: "author_feedback_questionnaire_dropdown",
    options: byType("AuthorFeedbackQuestionnaire"),
  });

  if (values.has_teams) {
    rows.push({
      label: "Teammate Review",
      idField: "teammate_questionnaire_id",
      weightField: "teammate_questionnaire_weight",
      notifField: "teammate_questionnaire_notification_limit",
      dropdownField: "teammate_questionnaire_dropdown",
      options: byType("TeammateReviewQuestionnaire"),
    });
  }

  if (values.allow_participants_to_create_bookmarks) {
    rows.push({
      label: "Bookmark Rating",
      idField: "bookmark_questionnaire_id",
      weightField: "bookmark_questionnaire_weight",
      notifField: "bookmark_questionnaire_notification_limit",
      dropdownField: "bookmark_questionnaire_dropdown",
      options: byType("BookmarkRatingQuestionnaire"),
    });
  }

  return (
    <div className="mt-3">
      <FormCheckbox
        controlId="assignment-is_peer_reviewed"
        label="Assignment is peer-reviewed"
        name="is_peer_reviewed"
      />
      {values.is_peer_reviewed !== false && (
        <div className="ms-4 mt-1">
          <FormCheckbox
            controlId="assignment-review_rubric_varies_by_round"
            label="Review rubric varies by round?"
            name="review_rubric_varies_by_round"
          />
          <FormCheckbox
            controlId="assignment-review_rubric_varies_by_topic"
            label="Review rubric varies by topic?"
            name="review_rubric_varies_by_topic"
          />
          {values.has_teams && (
            <FormCheckbox
              controlId="assignment-review_rubric_varies_by_role"
              label="Review rubric varies by role?"
              name="review_rubric_varies_by_role"
            />
          )}
        </div>
      )}

      <hr />

      <BSTable striped bordered size="sm" className="mt-2" style={{ fontSize: "0.875rem" }}>
        <thead>
          <tr>
            <th style={{ width: "13%" }}></th>
            <th className="text-center" style={{ width: "28%" }}>Questionnaire</th>
            <th className="text-center" style={{ width: "20%" }}>
              Scored-question display style
              <ToolTip id="display-style-tip" info="For scored questions: Scale displays scores as radio buttons on the next line; Dropdown displays scores as a dropdown." />
            </th>
            <th className="text-center" style={{ width: "13%" }}>Weight</th>
            <th className="text-center" style={{ width: "26%" }}>
              Notification Limit
              <ToolTip id="notif-limit-tip" info="If a new review differs from existing reviews by more than this %, the instructor is notified by e-mail." />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.idField}>
              <td className="align-middle fw-semibold">{row.label}:</td>
              <td>
                <BSForm.Select
                  value={values[row.idField] ?? ""}
                  onChange={(e) =>
                    setFieldValue(row.idField, e.target.value ? Number(e.target.value) : undefined)
                  }
                  size="sm"
                >
                  <option value="">-- None --</option>
                  {row.options.map((q) => (
                    <option key={q.id} value={q.id}>{q.name}</option>
                  ))}
                </BSForm.Select>
                {row.options.length === 0 && (
                  <BSForm.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                    No questionnaires of this type.
                  </BSForm.Text>
                )}
              </td>
              <td className="align-middle">
                <BSForm.Select
                  size="sm"
                  value={values[row.dropdownField] ? "dropdown" : "scale"}
                  onChange={(e) =>
                    setFieldValue(row.dropdownField, e.target.value === "dropdown")
                  }
                >
                  <option value="dropdown">Dropdown</option>
                  <option value="scale">Scale</option>
                </BSForm.Select>
              </td>
              <td className="align-middle">
                <div className="d-flex align-items-center gap-1">
                  <BSForm.Control
                    type="number"
                    size="sm"
                    min={0}
                    max={100}
                    style={{ width: 56 }}
                    value={values[row.weightField] ?? 0}
                    onChange={(e) => setFieldValue(row.weightField, Number(e.target.value))}
                  />
                  <span>%</span>
                </div>
              </td>
              <td className="align-middle">
                <div className="d-flex align-items-center gap-1">
                  <BSForm.Control
                    type="number"
                    size="sm"
                    min={0}
                    max={100}
                    style={{ width: 56 }}
                    value={values[row.notifField] ?? 0}
                    onChange={(e) => setFieldValue(row.notifField, Number(e.target.value))}
                  />
                  <span>%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </BSTable>
    </div>
  );
};

export default RubricsContent;
