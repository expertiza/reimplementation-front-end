import { describe, it, expect } from "vitest";
import {
  normalizeCalibrationReport,
  questionnaireFromAssignmentApi,
  extractQuestionnaireMeta,
} from "../calibrationReportNormalize";

describe("normalizeCalibrationReport", () => {
  it("unwraps calibration_report root and maps camelCase perItemSummary", () => {
    const raw = {
      calibration_report: {
        assignment_id: 1,
        response_map_id: 14,
        team_id: null,
        team_name: null,
        rubric: [{ id: 10, txt: "Q1", weight: 1, seq: 1, question_type: "scale" }],
        perItemSummary: [
          {
            itemId: 10,
            seq: 1,
            txt: "Q1",
            questionType: "scale",
            agree: 1,
            near: 0,
            disagree: 0,
            distribution: { "4": 2 },
            instructorScore: 4,
          },
        ],
        instructorResponse: null,
        studentResponses: [],
      },
    };
    const r = normalizeCalibrationReport(raw);
    expect(r).not.toBeNull();
    expect(r!.per_item_summary).toHaveLength(1);
    expect(r!.per_item_summary[0].item_id).toBe(10);
    expect(r!.per_item_summary[0].agree).toBe(1);
    expect(r!.rubric).toHaveLength(1);
  });

  it("extracts questionnaire name and id from nested shapes", () => {
    const raw = {
      questionnaire_name: "Round 1 Rubric",
      questionnaire_id: 42,
    };
    const m = extractQuestionnaireMeta(raw);
    expect(m.questionnaire_name).toBe("Round 1 Rubric");
    expect(m.questionnaire_id).toBe(42);
  });

  it("questionnaireFromAssignmentApi reads assignment_questionnaires", () => {
    const payload = {
      assignment_questionnaires: [
        {
          used_in_round: 1,
          questionnaire: { id: 7, name: "Peer review" },
        },
      ],
    };
    const m = questionnaireFromAssignmentApi(payload);
    expect(m.questionnaire_name).toBe("Peer review");
    expect(m.questionnaire_id).toBe(7);
    expect(m.review_round).toBe(1);
  });

  it("synthesizes per_item_summary from rubric when summary is omitted", () => {
    const raw = {
      assignment_id: 1,
      response_map_id: 14,
      team_id: null,
      team_name: null,
      rubric: [
        { id: 10, txt: "Quality", weight: 1, seq: 1, question_type: "scale" },
        { id: 11, txt: "Style", weight: 1, seq: 2, question_type: "scale" },
      ],
      per_item_summary: [],
      instructor_response: null,
      student_responses: [],
    };
    const r = normalizeCalibrationReport(raw);
    expect(r!.per_item_summary).toHaveLength(2);
    expect(r!.per_item_summary[0].agree).toBe(0);
    expect(r!.per_item_summary[0].item_id).toBe(10);
  });
});
