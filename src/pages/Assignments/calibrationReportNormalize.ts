export interface CalibrationAnswer {
  item_id: number;
  score: number | null;
  comments?: string | null;
}

export interface CalibrationRubricItem {
  id: number;
  txt: string;
  seq: number;
  question_type?: string;
  weight?: number;
  min_score?: number;
  max_score?: number;
}

export interface CalibrationResponse {
  id: number;
  map_id: number;
  reviewer_id: number;
  reviewer_name?: string | null;
  is_submitted: boolean;
  updated_at: string;
  answers: CalibrationAnswer[];
}

export interface CalibrationPerItemSummary {
  item_id: number;
  item_label: string;
  item_seq: number;
  instructor_score: number | null;
  instructor_comment?: string | null;
  bucket_counts: Record<string, number>;
  student_response_count: number;
}

export interface CalibrationReportResponse {
  map_id: number;
  assignment_id: number;
  reviewee_id: number;
  rubric_items: CalibrationRubricItem[];
  instructor_response: CalibrationResponse;
  student_responses: CalibrationResponse[];
  per_item_summary: CalibrationPerItemSummary[];
  submitted_content?: {
    hyperlinks?: string[];
    files?: string[];
  };
}

export interface StackedChartDataRow {
  itemId: number;
  itemLabel: string;
  itemSeq: number;
  instructorScore: number | null;
  agreeCount: number;
  nearCount: number;
  disagreeCount: number;
  totalResponses: number;
}

export interface ReviewerOption {
  value: number;
  label: string;
  mapId: number;
  responseId: number;
}

export interface RubricDetailRow {
  itemId: number;
  itemLabel: string;
  itemSeq: number;
  instructorScore: number | null;
  instructorComment: string;
  studentScore: number | null;
  studentComment: string;
  agreeCount: number;
  nearCount: number;
  disagreeCount: number;
  noScoreCount: number;
  totalResponses: number;
  averageScore: number | null;
}

export interface NormalizedCalibrationReport {
  bucketKeys: string[];
  stackedChartData: StackedChartDataRow[];
  reviewerOptions: ReviewerOption[];
  rubricDetailRows: RubricDetailRow[];
  rubricDetailRowsByReviewer: Record<number, RubricDetailRow[]>;
  latestStudentResponses: CalibrationResponse[];
  defaultReviewerId: number | null;
}

const buildAnswersByItem = (answers: CalibrationAnswer[]) =>
  answers.reduce<Record<number, CalibrationAnswer>>((byItem, answer) => {
    byItem[answer.item_id] = answer;
    return byItem;
  }, {});

const latestStudentResponsesForMaps = (responses: CalibrationResponse[]) =>
  Object.values(
    responses.reduce<Record<number, CalibrationResponse>>((latestByMap, response) => {
      const current = latestByMap[response.map_id];

      if (!current || new Date(response.updated_at).getTime() > new Date(current.updated_at).getTime()) {
        latestByMap[response.map_id] = response;
      }

      return latestByMap;
    }, {})
  ).sort((left, right) => {
    const leftName = left.reviewer_name ?? "";
    const rightName = right.reviewer_name ?? "";
    return leftName.localeCompare(rightName);
  });

const scoreBucketKey = (score: string) => `score_${score}`;

const agreementCountFor = (
  summary: CalibrationPerItemSummary,
  classification: "agree" | "near" | "disagree"
) => {
  if (summary.instructor_score === null) {
    return 0;
  }

  return Object.entries(summary.bucket_counts).reduce((count, [score, bucketCount]) => {
    const distance = Math.abs(Number(score) - summary.instructor_score!);

    if (classification === "agree" && distance === 0) {
      return count + bucketCount;
    }

    if (classification === "near" && distance === 1) {
      return count + bucketCount;
    }

    if (classification === "disagree" && distance > 1) {
      return count + bucketCount;
    }

    return count;
  }, 0);
};

const buildRubricRows = (
  rubricItems: CalibrationRubricItem[],
  instructorResponse: CalibrationResponse,
  perItemSummary: CalibrationPerItemSummary[],
  studentResponse?: CalibrationResponse
) => {
  const instructorAnswers = buildAnswersByItem(instructorResponse.answers);
  const studentAnswers = studentResponse ? buildAnswersByItem(studentResponse.answers) : {};
  const summaryByItem = perItemSummary.reduce<Record<number, CalibrationPerItemSummary>>((byItem, summary) => {
    byItem[summary.item_id] = summary;
    return byItem;
  }, {});

  return [...rubricItems]
    .sort((left, right) => left.seq - right.seq)
    .map((item) => {
      const instructorAnswer = instructorAnswers[item.id];
      const studentAnswer = studentAnswers[item.id];
      const summary = summaryByItem[item.id];
      const totalScoredResponses = summary
        ? Object.values(summary.bucket_counts).reduce((total, count) => total + count, 0)
        : 0;
      const totalResponses = summary?.student_response_count ?? 0;
      const averageScore = summary && totalScoredResponses > 0
        ? Object.entries(summary.bucket_counts).reduce((total, [score, count]) => total + Number(score) * count, 0) /
          totalScoredResponses
        : null;

      return {
        itemId: item.id,
        itemLabel: item.txt,
        itemSeq: item.seq,
        instructorScore: instructorAnswer?.score ?? null,
        instructorComment: instructorAnswer?.comments ?? "",
        studentScore: studentAnswer?.score ?? null,
        studentComment: studentAnswer?.comments ?? "",
        agreeCount: summary ? agreementCountFor(summary, "agree") : 0,
        nearCount: summary ? agreementCountFor(summary, "near") : 0,
        disagreeCount: summary ? agreementCountFor(summary, "disagree") : 0,
        noScoreCount: Math.max(0, totalResponses - totalScoredResponses),
        totalResponses,
        averageScore,
      };
    });
};

export const normalizeCalibrationReport = (
  report: CalibrationReportResponse
): NormalizedCalibrationReport => {
  const bucketKeys = ["agreeCount", "nearCount", "disagreeCount"];

  const stackedChartData = [...report.per_item_summary]
    .sort((left, right) => left.item_seq - right.item_seq)
    .map((summary): StackedChartDataRow => {
      const totalResponses = Object.values(summary.bucket_counts).reduce((total, count) => total + count, 0);

      return {
        itemId: summary.item_id,
        itemLabel: summary.item_label,
        itemSeq: summary.item_seq,
        instructorScore: summary.instructor_score,
        agreeCount: agreementCountFor(summary, "agree"),
        nearCount: agreementCountFor(summary, "near"),
        disagreeCount: agreementCountFor(summary, "disagree"),
        totalResponses,
      };
    });

  const latestStudentResponses = latestStudentResponsesForMaps(report.student_responses);
  const reviewerOptions = latestStudentResponses.map((response) => ({
    value: response.reviewer_id,
    label: response.reviewer_name || `Reviewer ${response.reviewer_id}`,
    mapId: response.map_id,
    responseId: response.id,
  }));

  const rubricDetailRowsByReviewer = latestStudentResponses.reduce<Record<number, RubricDetailRow[]>>(
    (rowsByReviewer, response) => {
      rowsByReviewer[response.reviewer_id] = buildRubricRows(
        report.rubric_items,
        report.instructor_response,
        report.per_item_summary,
        response
      );
      return rowsByReviewer;
    },
    {}
  );

  const defaultReviewerId = reviewerOptions[0]?.value ?? null;

  return {
    bucketKeys,
    stackedChartData,
    reviewerOptions,
    rubricDetailRows: defaultReviewerId
      ? rubricDetailRowsByReviewer[defaultReviewerId]
      : buildRubricRows(report.rubric_items, report.instructor_response, report.per_item_summary),
    rubricDetailRowsByReviewer,
    latestStudentResponses,
    defaultReviewerId,
  };
};
