import { appendFile, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const metrics = ["lines", "statements", "branches", "functions"];

async function readSummary(reportPath) {
  const report = JSON.parse(await readFile(reportPath, "utf8"));

  if (!report.total) {
    throw new Error(`Coverage report does not contain a total summary: ${reportPath}`);
  }

  return report.total;
}

function formatMetric(metric) {
  return `${metric[0].toUpperCase()}${metric.slice(1)}`;
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

export function buildCoverageComparison(base, head) {
  const comparisons = metrics.map((metric) => {
    const basePercentage = Number(base[metric].pct);
    const headPercentage = Number(head[metric].pct);

    return {
      metric,
      basePercentage,
      headPercentage,
      difference: headPercentage - basePercentage,
    };
  });
  const reductions = comparisons.filter(({ difference }) => difference < 0);
  const rows = comparisons.map(
    ({ metric, basePercentage, headPercentage, difference }) =>
      `| ${formatMetric(metric)} | ${formatPercentage(basePercentage)} | ${formatPercentage(
        headPercentage
      )} | ${formatDifference(difference)} |`
  );
  const result = reductions.length
    ? [
        "> [!WARNING]",
        `> Coverage decreased for ${reductions
          .map(
            ({ metric, difference }) => `${formatMetric(metric)} (${formatDifference(difference)})`
          )
          .join(", ")}.`,
        "> This warning is informational and does not fail the comparison by itself.",
      ]
    : ["No coverage metrics decreased."];
  const output = [
    "## Frontend coverage comparison",
    "",
    "| Metric | Target branch | Pull request | Difference |",
    "| --- | ---: | ---: | ---: |",
    ...rows,
    "",
    ...result,
  ].join("\n");

  return { output, reductions };
}

export async function compareCoverage([baseReportPath, headReportPath], environment = process.env) {
  if (!baseReportPath || !headReportPath) {
    throw new Error(
      "Usage: node scripts/compare-coverage.mjs <base-coverage-summary.json> <head-coverage-summary.json>"
    );
  }

  const base = await readSummary(baseReportPath);
  const head = await readSummary(headReportPath);
  const { output, reductions } = buildCoverageComparison(base, head);

  console.log(output);

  if (environment.GITHUB_ACTIONS === "true" && reductions.length > 0) {
    const warning = reductions
      .map(
        ({ metric, difference }) =>
          `${formatMetric(metric)} decreased by ${Math.abs(difference).toFixed(
            2
          )} percentage points`
      )
      .join("; ");
    console.log(`::warning title=Frontend coverage decreased::${warning}`);
  }

  if (environment.GITHUB_STEP_SUMMARY) {
    await appendFile(environment.GITHUB_STEP_SUMMARY, `${output}\n`);
  }

  return { output, reductions };
}

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  try {
    await compareCoverage(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
