import {
  normalizeCalibrationReport,
  type CalibrationReportResponse,
} from "../calibrationReportNormalize";

describe("normalizeCalibrationReport", () => {
  const report: CalibrationReportResponse = {
    map_id: 8,
    assignment_id: 8,
    reviewee_id: 8,
    rubric_items: [
      { id: 11, txt: "Code quality", seq: 1, min_score: 0, max_score: 5 },
      { id: 12, txt: "Documentation", seq: 2, min_score: 0, max_score: 5 },
    ],
    instructor_response: {
      id: 21,
      map_id: 8,
      reviewer_id: 15,
      reviewer_name: "admin",
      is_submitted: true,
      updated_at: "2026-04-23T16:00:00Z",
      answers: [
        { item_id: 11, score: 4, comments: "Instructor code" },
        { item_id: 12, score: 5, comments: "Instructor docs" },
      ],
    },
    student_responses: [
      {
        id: 31,
        map_id: 9,
        reviewer_id: 22,
        reviewer_name: "Student A",
        is_submitted: true,
        updated_at: "2026-04-22T16:00:00Z",
        answers: [
          { item_id: 11, score: 2, comments: "Older code" },
          { item_id: 12, score: 3, comments: "Older docs" },
        ],
      },
      {
        id: 32,
        map_id: 9,
        reviewer_id: 22,
        reviewer_name: "Student A",
        is_submitted: true,
        updated_at: "2026-04-23T16:00:00Z",
        answers: [
          { item_id: 11, score: 3, comments: "Latest code" },
          { item_id: 12, score: null, comments: "" },
        ],
      },
    ],
    per_item_summary: [
      {
        item_id: 11,
        item_label: "Code quality",
        item_seq: 1,
        instructor_score: 4,
        instructor_comment: "Instructor code",
        bucket_counts: { "0": 0, "1": 0, "2": 0, "3": 1, "4": 0, "5": 0 },
        student_response_count: 1,
      },
      {
        item_id: 12,
        item_label: "Documentation",
        item_seq: 2,
        instructor_score: 5,
        instructor_comment: "Instructor docs",
        bucket_counts: { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
        student_response_count: 1,
      },
    ],
    submitted_content: {
      hyperlinks: ["https://example.com"],
      files: ["submission.pdf"],
    },
  };

  test("builds agreement buckets from per-item summaries relative to instructor score", () => {
    const normalized = normalizeCalibrationReport(report);

    expect(normalized.bucketKeys).toEqual(["agreeCount", "nearCount", "disagreeCount"]);
    expect(normalized.stackedChartData).toEqual([
      expect.objectContaining({
        itemId: 11,
        itemLabel: "Code quality",
        instructorScore: 4,
        agreeCount: 0,
        nearCount: 1,
        disagreeCount: 0,
      }),
      expect.objectContaining({
        itemId: 12,
        itemLabel: "Documentation",
        instructorScore: 5,
        agreeCount: 0,
        nearCount: 0,
        disagreeCount: 0,
        totalResponses: 0,
      }),
    ]);
  });

  test("returns empty chart data when there are no student responses", () => {
    const emptyReport: CalibrationReportResponse = {
      ...report,
      student_responses: [],
      per_item_summary: report.per_item_summary.map((s) => ({
        ...s,
        bucket_counts: { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
        student_response_count: 0,
      })),
    };
    const normalized = normalizeCalibrationReport(emptyReport);

    expect(normalized.reviewerOptions).toHaveLength(0);
    expect(normalized.defaultReviewerId).toBeNull();
    normalized.stackedChartData.forEach((row) => {
      expect(row.agreeCount).toBe(0);
      expect(row.nearCount).toBe(0);
      expect(row.disagreeCount).toBe(0);
    });
  });

  test("uses the latest submitted student response for rubric detail data", () => {
    const normalized = normalizeCalibrationReport(report);

    expect(normalized.reviewerOptions).toEqual([
      {
        value: 22,
        label: "Student A",
        mapId: 9,
        responseId: 32,
      },
    ]);
    expect(normalized.defaultReviewerId).toBe(22);
    expect(normalized.rubricDetailRows).toEqual([
      expect.objectContaining({
        itemId: 11,
        instructorScore: 4,
        studentScore: 3,
        studentComment: "Latest code",
        noScoreCount: 0,
        averageScore: 3,
      }),
      expect.objectContaining({
        itemId: 12,
        instructorScore: 5,
        studentScore: null,
        studentComment: "",
        noScoreCount: 1,
        averageScore: null,
      }),
    ]);
  });
});
