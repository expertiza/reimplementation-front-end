import { ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis, Cell } from "recharts";
import type { RubricDetailRow } from "../calibrationReportNormalize";

interface CalibrationRubricDistributionChartProps {
  row: RubricDetailRow;
}

const DISTRIBUTION_COLORS = {
  agree: "#22c55e",
  near: "#facc15",
  disagree: "#ef4444",
};

const CalibrationRubricDistributionChart = ({
  row,
}: CalibrationRubricDistributionChartProps) => {
  const data = [
    { category: "Agree", count: row.agreeCount, color: DISTRIBUTION_COLORS.agree },
    { category: "Near", count: row.nearCount, color: DISTRIBUTION_COLORS.near },
    { category: "Disagree", count: row.disagreeCount, color: DISTRIBUTION_COLORS.disagree },
  ];

  return (
    <div style={{ width: 300 }} data-testid={`rubric-distribution-${row.itemId}`}>
      <div style={{ height: 190 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart barCategoryGap="22%" barGap={8} data={data} margin={{ top: 8, right: 12, left: 8, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="category"
              interval={0}
              tick={{ fontSize: 11 }}
              tickMargin={10}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number) => [value, "Responses"]} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.category} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CalibrationRubricDistributionChart;
