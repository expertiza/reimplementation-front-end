import { Card, Table } from "react-bootstrap";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StackedChartDataRow } from "../calibrationReportNormalize";

interface CalibrationStackedChartProps {
  bucketKeys: string[];
  chartData: StackedChartDataRow[];
}

const AGREEMENT_COLORS: Record<string, string> = {
  agreeCount: "#22c55e",
  nearCount: "#facc15",
  disagreeCount: "#ef4444",
};

const bucketLabel = (bucketKey: string) => {
  if (bucketKey === "agreeCount") return "Agree (matches instructor score)";
  if (bucketKey === "nearCount") return "Near (±1)";
  return "Disagree";
};

const CalibrationStackedChart = ({
  bucketKeys,
  chartData,
}: CalibrationStackedChartProps) => {
  const displayData = chartData.map((row) => ({
    ...row,
    distributionSummary: `Agree: ${row.agreeCount}, Near: ${row.nearCount}, Disagree: ${row.disagreeCount}`,
  }));
  const chartHeight = Math.max(320, displayData.length * 80);

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Class comparison (stacked)</Card.Title>
        <Card.Text className="text-muted">
          Each rubric item is shown on the x-axis. The y-axis shows the number of student responses. Green means
          the student score matches the instructor, yellow means the student is within one point, and red means
          the student is farther away.
        </Card.Text>

        <div data-testid="calibration-stacked-chart" style={{ width: "100%", height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              margin={{ top: 12, right: 24, left: 24, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="itemLabel"
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                label={{ value: "Student responses", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  value === null ? "N/A" : value,
                  bucketLabel(name),
                ]}
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as StackedChartDataRow | undefined;
                  if (!row) return "";

                  const displayRow = payload?.[0]?.payload as (StackedChartDataRow & {
                    distributionSummary?: string;
                  }) | undefined;

                  return `${row.itemSeq}. ${row.itemLabel}${
                    displayRow?.distributionSummary ? ` | ${displayRow.distributionSummary}` : ""
                  }`;
                }}
              />
              <Legend formatter={(value) => bucketLabel(value)} />
              {bucketKeys.map((bucketKey) => (
                <Bar
                  key={bucketKey}
                  dataKey={bucketKey}
                  fill={AGREEMENT_COLORS[bucketKey]}
                  name={bucketKey}
                  stackId="agreement"
                  radius={bucketKey === "disagreeCount" ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="d-flex align-items-center gap-2 mb-3">
          <span
            style={{
              width: 14,
              height: 14,
              backgroundColor: AGREEMENT_COLORS.agreeCount,
              display: "inline-block",
            }}
          />
          <span>Agree (matches instructor score)</span>
          <span
            style={{
              width: 14,
              height: 14,
              backgroundColor: AGREEMENT_COLORS.nearCount,
              display: "inline-block",
              marginLeft: 16,
            }}
          />
          <span>Near (±1)</span>
          <span
            style={{
              width: 14,
              height: 14,
              backgroundColor: AGREEMENT_COLORS.disagreeCount,
              display: "inline-block",
              marginLeft: 16,
            }}
          />
          <span>Disagree</span>
        </div>

        <h3 className="h6 mt-4">Instructor reference scores</h3>
        <Table bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>Criterion</th>
              <th>Instructor score</th>
              <th>Student responses</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.itemId}>
                <td>{row.itemLabel}</td>
                <td>{row.instructorScore ?? "N/A"}</td>
                <td>{row.totalResponses}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default CalibrationStackedChart;
