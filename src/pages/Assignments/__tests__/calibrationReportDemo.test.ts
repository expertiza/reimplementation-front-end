import { describe, it, expect } from "vitest";
import { injectDemoStudentCalibrationData } from "../calibrationReportDemo";
import type { CalibrationReportJson } from "../CalibrationReview";

const baseReport = (): CalibrationReportJson => ({
  assignment_id: 1,
  response_map_id: 9,
  team_id: null,
  team_name: null,
  participant_name: "Cal student",
  rubric: [{ id: 10, txt: "Q1", weight: 1, seq: 1, question_type: "CriterionItem" }],
  instructor_response: {
    response_id: 1,
    additional_comment: "Inst overall",
    is_submitted: true,
    answers: [{ item_id: 10, answer: 4, comments: "" }],
  },
  student_responses: [],
  per_item_summary: [],
  submitted_content: { hyperlinks: [], files: [] },
  score_scale: { min: 0, max: 5 },
});

describe("injectDemoStudentCalibrationData", () => {
  it("adds four demo students and summary when student_responses is empty", () => {
    const out = injectDemoStudentCalibrationData(baseReport());
    expect(out.usingDemoStudentReviews).toBe(true);
    expect(out.student_responses).toHaveLength(4);
    expect(out.student_responses[0].reviewer_name).toBe("Alex Chen");
    expect(out.per_item_summary).toHaveLength(1);
    const row = out.per_item_summary[0];
    expect(row.agree + row.near + row.disagree).toBe(4);
  });

  it("does not inject when real students exist", () => {
    const real = baseReport();
    real.student_responses = [
      {
        response_id: 99,
        additional_comment: "",
        is_submitted: true,
        answers: [{ item_id: 10, answer: 4, comments: "" }],
        reviewer_name: "Real Student",
      },
    ];
    real.per_item_summary = [
      {
        item_id: 10,
        seq: 1,
        txt: "Q1",
        question_type: "CriterionItem",
        agree: 1,
        near: 0,
        disagree: 0,
        distribution: { "4": 1 },
        instructor_score: 4,
      },
    ];
    const out = injectDemoStudentCalibrationData(real);
    expect(out.usingDemoStudentReviews).toBe(false);
    expect(out.student_responses).toHaveLength(1);
    expect(out.student_responses[0].reviewer_name).toBe("Real Student");
  });
});
