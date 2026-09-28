import { render, screen } from "@testing-library/react";
import CalibrationStackedChart from "../components/CalibrationStackedChart";
import type { StackedChartDataRow } from "../calibrationReportNormalize";

describe("CalibrationStackedChart", () => {
  const chartData: StackedChartDataRow[] = [
    {
      itemId: 11,
      itemLabel: "Code quality",
      itemSeq: 1,
      instructorScore: 4,
      agreeCount: 0,
      nearCount: 1,
      disagreeCount: 0,
      totalResponses: 1,
    },
    {
      itemId: 12,
      itemLabel: "Documentation",
      itemSeq: 2,
      instructorScore: 5,
      agreeCount: 0,
      nearCount: 1,
      disagreeCount: 0,
      totalResponses: 1,
    },
  ];

  test("renders chart title and instructor reference table", () => {
    render(
      <CalibrationStackedChart
        bucketKeys={["agreeCount", "nearCount", "disagreeCount"]}
        chartData={chartData}
      />
    );

    expect(screen.getByText(/class comparison \(stacked\)/i)).toBeInTheDocument();
    expect(screen.getByTestId("calibration-stacked-chart")).toBeInTheDocument();
    expect(screen.getByText(/agree \(matches instructor score\)/i)).toBeInTheDocument();
    expect(screen.getByText(/near \(±1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/disagree/i)).toBeInTheDocument();
    expect(screen.getByText(/instructor reference scores/i)).toBeInTheDocument();
    expect(screen.getByText("Code quality")).toBeInTheDocument();
    expect(screen.getByText("Documentation")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
