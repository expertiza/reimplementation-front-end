import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import CalibrationRubricDetailPanel from "../components/CalibrationRubricDetailPanel";
import type { ReviewerOption, RubricDetailRow } from "../calibrationReportNormalize";

describe("CalibrationRubricDetailPanel", () => {
  const reviewerOptions: ReviewerOption[] = [
    { value: 21, label: "Reviewer Alpha", mapId: 9, responseId: 101 },
    { value: 22, label: "Reviewer Beta", mapId: 10, responseId: 102 },
  ];

  const rowsByReviewer: Record<number, RubricDetailRow[]> = {
    21: [
      {
        itemId: 1,
        itemLabel: "Code quality",
        itemSeq: 1,
        instructorScore: 4,
        instructorComment: "Clear implementation",
        studentScore: 3,
        studentComment: "Mostly clear",
        agreeCount: 2,
        nearCount: 3,
        disagreeCount: 1,
        noScoreCount: 0,
        totalResponses: 6,
        averageScore: 3.2,
      },
    ],
    22: [
      {
        itemId: 1,
        itemLabel: "Code quality",
        itemSeq: 1,
        instructorScore: 4,
        instructorComment: "",
        studentScore: null,
        studentComment: "",
        agreeCount: 1,
        nearCount: 1,
        disagreeCount: 2,
        noScoreCount: 2,
        totalResponses: 6,
        averageScore: 2.5,
      },
    ],
  };

  const PanelHarness = () => {
    const [selectedReviewerId, setSelectedReviewerId] = useState<number | null>(21);

    return (
      <CalibrationRubricDetailPanel
        reviewerOptions={reviewerOptions}
        selectedReviewerId={selectedReviewerId}
        rows={selectedReviewerId ? rowsByReviewer[selectedReviewerId] : []}
        onReviewerChange={setSelectedReviewerId}
      />
    );
  };

  test("renders the default reviewer comparison rows", () => {
    render(<PanelHarness />);

    expect(screen.getByText(/rubric detail/i)).toBeInTheDocument();
    expect(screen.getByTestId("selected-reviewer-summary")).toHaveTextContent("Reviewer Alpha");
    expect(screen.getByText("1. Code quality")).toBeInTheDocument();
    expect(screen.getByText("Clear implementation")).toBeInTheDocument();
    expect(screen.getByText("Mostly clear")).toBeInTheDocument();
    expect(screen.getByText("1 below")).toBeInTheDocument();
    expect(screen.getByText("Green Agree: 2")).toBeInTheDocument();
    expect(screen.getByText("Yellow Near: 3")).toBeInTheDocument();
    expect(screen.getByText("Red Disagree: 1")).toBeInTheDocument();
  });

  test("switches reviewers and updates the comparison rows", () => {
    render(<PanelHarness />);

    fireEvent.change(screen.getByLabelText(/student reviewer/i), {
      target: { value: "22" },
    });

    expect(screen.getByTestId("selected-reviewer-summary")).toHaveTextContent("Reviewer Beta");
    expect(screen.getAllByText("No comments")).toHaveLength(2);
    expect(screen.getAllByText("N/A")).toHaveLength(2);
  });
});
