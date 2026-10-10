import { appendFile, readFile } from "node:fs/promises";

const [baseReportPath, headReportPath] = process.argv.slice(2);

if (!baseReportPath || !headReportPath) {
  console.error(
    "Usage: node scripts/compare-coverage.mjs <base-coverage-summary.json> <head-coverage-summary.json>"
  );
  process.exit(1);
}

async function readSummary(reportPath) {
  const report = JSON.parse(await readFile(reportPath, "utf8"));

  if (!report.total) {
    throw new Error(`Coverage report does not contain a total summary: ${reportPath}`);
  }

  return report.total;
}

function formatPercentage(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}%` : "Unknown";
}

function formatDifference(value) {
  if (!Number.isFinite(value)) {
    return "Unknown";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)} percentage points`;
}

try {
  const base = await readSummary(baseReportPath);
  const head = await readSummary(headReportPath);
  const metrics = ["lines", "statements", "branches", "functions"];
  const rows = metrics.map((metric) => {
    const basePercentage = Number(base[metric].pct);
    const headPercentage = Number(head[metric].pct);
    const difference = headPercentage - basePercentage;

    return `| ${metric[0].toUpperCase()}${metric.slice(1)} | ${formatPercentage(
      basePercentage
    )} | ${formatPercentage(headPercentage)} | ${formatDifference(difference)} |`;
  });
  const output = [
    "## Frontend coverage comparison",
    "",
    "| Metric | Target branch | Pull request | Difference |",
    "| --- | ---: | ---: | ---: |",
    ...rows,
    "",
    "A negative difference means the pull request reduced that coverage metric.",
  ].join("\n");

  console.log(output);

  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `${output}\n`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
