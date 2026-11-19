import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

const metrics = ["lines", "statements", "branches", "functions"];

/** Read and validate the total section of a Vitest JSON coverage summary. */
async function readSummary(reportPath) {
  const report = JSON.parse(await readFile(reportPath, "utf8"));

  if (!report.total) {
    throw new Error(`Coverage report does not contain a total summary: ${reportPath}`);
  }

  return report.total;
}

/** Read a complete JSON coverage report from disk. */
async function readReport(reportPath) {
  return JSON.parse(await readFile(reportPath, "utf8"));
}

/** Convert an internal metric key to a display label. */
function formatMetric(metric) {
  return `${metric[0].toUpperCase()}${metric.slice(1)}`;
}

/** Format a finite coverage value as a percentage or return a safe fallback. */
function formatPercentage(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}%` : "Unknown";
}

/** Format a coverage delta in percentage points. */
function formatDifference(value) {
  if (!Number.isFinite(value)) {
    return "Unknown";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)} percentage points`;
}

/** Reduce an absolute coverage path to a repository-relative display path. */
function formatCoveragePath(filePath) {
  const projectPath = filePath.match(/(?:^|\/)((?:src|scripts)\/.*)$/);
  return projectPath ? projectPath[1] : filePath.split("/").at(-1);
}

/** Build the Markdown table containing coverage for changed application files. */
export function buildChangedFileCoverage(report) {
  const files = Object.entries(report).filter(([filePath]) => filePath !== "total");

  if (files.length === 0) {
    return [
      "## Coverage of Changed Files",
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
    "## Coverage of Changed Files",
    "",
    "This table shows the current test coverage of the complete source files modified by the pull request.",
    "",
    "Unlike the overall comparison above, this is not a before-and-after comparison. Each percentage indicates how much of the complete file was exercised when the test suite ran against the proposed merge.",
    "",
    "Reviewers can use this table to identify modified files with low coverage that may require additional tests.",
    "",
    "| File | Lines | Statements | Branches | Functions |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...rows,
  ].join("\n");
}

/** Compare target and pull-request coverage and build the Markdown summary. */
export function buildCoverageComparison(base, head, context = {}) {
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
  const improvements = comparisons.filter(({ difference }) => difference > 0);
  const rows = comparisons.map(
    ({ metric, basePercentage, headPercentage, difference }) =>
      `| ${formatMetric(metric)} | ${formatPercentage(basePercentage)} | ${formatPercentage(
        headPercentage
      )} | ${formatDifference(difference)} |`
  );
  const result = reductions.length
    ? [
        "> [!WARNING]",
        "> The proposed merge reduces the frontend's overall test coverage compared with the target branch.",
        ">",
        `> Coverage decreased for ${reductions
          .map(
            ({ metric, difference }) => `${formatMetric(metric)} (${formatDifference(difference)})`
          )
          .join(", ")}.`,
        ">",
        "> Consider adding or improving tests for the feature being merged before approving this pull request.",
        ">",
        "> This warning is informational and does not automatically fail the pull request.",
      ]
    : improvements.length
    ? [
        "> [!IMPORTANT]",
        "> The proposed merge increases the frontend's overall test coverage compared with the target branch.",
        ">",
        "> No coverage metrics decreased. The additional tests improve coverage for the code being merged.",
      ]
    : ["> [!NOTE]", "> The proposed merge does not change the frontend's overall test coverage."];
  const branchContext =
    context.targetBranch && context.pullRequestBranch
      ? [
          `- **Target branch:** \`${context.targetBranch}\``,
          `- **Pull-request branch:** \`${context.pullRequestBranch}\``,
          "",
        ]
      : [];
  const output = [
    "## Coverage Report",
    "",
    "> [!NOTE]",
    "> This report compares the target branch with the proposed merge of the pull-request branch. GitHub Actions ran the frontend test suite available in each revision and used the generated results to populate the tables below.",
    ">",
    "> The first table helps reviewers identify changes to the project's overall coverage. The second table shows the current coverage of the complete source files modified by the pull request.",
    "",
    "## Coverage Comparison",
    "",
    ...branchContext,
    "The **Proposed merge** column represents the pull-request changes after GitHub applies them to the target branch.",
    "",
    "| Metric | Target branch | Proposed merge | Difference |",
    "| --- | ---: | ---: | ---: |",
    ...rows,
    "",
    "### What do these metrics mean?",
    "",
    "- **Lines:** Percentage of executable source-code lines run by tests.",
    "- **Statements:** Percentage of individual code instructions run by tests.",
    "- **Branches:** Percentage of possible decision paths tested, such as `if/else`, `switch`, and conditional expressions.",
    "- **Functions:** Percentage of declared functions called by tests.",
    "",
    ...result,
  ].join("\n");

  return { output, reductions };
}

/** Read coverage reports, write the combined report, and emit GitHub Actions output. */
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
  const comparison = buildCoverageComparison(base, head, {
    targetBranch: environment.COVERAGE_TARGET_BRANCH,
    pullRequestBranch: environment.COVERAGE_PULL_REQUEST_BRANCH,
  });
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
