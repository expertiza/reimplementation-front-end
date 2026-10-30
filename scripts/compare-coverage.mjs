import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

const metrics = ["lines", "statements", "branches", "functions"];

async function readSummary(reportPath) {
  const report = JSON.parse(await readFile(reportPath, "utf8"));

  if (!report.total) {
    throw new Error(`Coverage report does not contain a total summary: ${reportPath}`);
  }

  return report.total;
}

async function readReport(reportPath) {
  return JSON.parse(await readFile(reportPath, "utf8"));
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

function formatCoveragePath(filePath) {
  const projectPath = filePath.match(/(?:^|\/)((?:src|scripts)\/.*)$/);
  return projectPath ? projectPath[1] : filePath.split("/").at(-1);
}

export function buildChangedFileCoverage(report) {
  const files = Object.entries(report).filter(([filePath]) => filePath !== "total");

  if (files.length === 0) {
    return [
      "## Coverage of changed files",
      "",
      "No measurable application files changed in this pull request.",
    ].join("\n");
  }

  const rows = files.map(
    ([filePath, coverage]) =>
      `| \`${formatCoveragePath(filePath)}\` | ${formatPercentage(
        Number(coverage.lines.pct)
      )} | ${formatPercentage(Number(coverage.statements.pct))} | ${formatPercentage(
        Number(coverage.branches.pct)
      )} | ${formatPercentage(Number(coverage.functions.pct))} |`
  );

  return [
    "## Coverage of changed files",
    "",
    "This table shows the current coverage of complete files changed by the pull request.",
    "",
    "| File | Lines | Statements | Branches | Functions |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...rows,
  ].join("\n");
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

export async function compareCoverage(
  [baseReportPath, headReportPath, outputPath, changedReportPath],
  environment = process.env
) {
  if (!baseReportPath || !headReportPath) {
    throw new Error(
      "Usage: node scripts/compare-coverage.mjs <base-coverage-summary.json> <head-coverage-summary.json> [output.md] [changed-coverage-summary.json]"
    );
  }

  const base = await readSummary(baseReportPath);
  const head = await readSummary(headReportPath);
  const comparison = buildCoverageComparison(base, head);
  const changedFileCoverage = changedReportPath
    ? buildChangedFileCoverage(await readReport(changedReportPath))
    : null;
  const output = [comparison.output, changedFileCoverage].filter(Boolean).join("\n\n");
  const { reductions } = comparison;

  console.log(output);

  if (outputPath) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${output}\n`);
  }

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
