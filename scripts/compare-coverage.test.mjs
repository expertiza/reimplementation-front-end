import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, test, vi } from "vitest";

import {
  buildChangedFileCoverage,
  buildCoverageComparison,
  compareCoverage,
} from "./compare-coverage.mjs";

function summary({ lines, statements, branches, functions }) {
  return {
    lines: { pct: lines },
    statements: { pct: statements },
    branches: { pct: branches },
    functions: { pct: functions },
  };
}

describe("buildCoverageComparison", () => {
  const base = summary({ lines: 50, statements: 45, branches: 40, functions: 35 });

  test("reports improved coverage without a warning", () => {
    const head = summary({ lines: 51, statements: 46, branches: 41, functions: 36 });
    const result = buildCoverageComparison(base, head);

    expect(result.reductions).toEqual([]);
    expect(result.output).toContain("No coverage metrics decreased.");
    expect(result.output).toContain("| Lines | 50.00% | 51.00% | +1.00 percentage points |");
  });

  test("warns when any coverage metric decreases", () => {
    const head = summary({ lines: 49.5, statements: 46, branches: 39.75, functions: 35 });
    const result = buildCoverageComparison(base, head);

    expect(result.reductions.map(({ metric }) => metric)).toEqual(["lines", "branches"]);
    expect(result.output).toContain("> [!WARNING]");
    expect(result.output).toContain("Lines (-0.50 percentage points)");
    expect(result.output).toContain("Branches (-0.25 percentage points)");
  });

  test("reports unchanged coverage without a warning", () => {
    const result = buildCoverageComparison(base, base);

    expect(result.reductions).toEqual([]);
    expect(result.output).toContain("No coverage metrics decreased.");
    expect(result.output).toContain("| Functions | 35.00% | 35.00% | 0.00 percentage points |");
  });

  test("emits a GitHub warning and writes the workflow summary", async () => {
    const fixtureDirectory = await mkdtemp(join(tmpdir(), "coverage-comparison-"));
    const basePath = join(fixtureDirectory, "base.json");
    const headPath = join(fixtureDirectory, "head.json");
    const summaryPath = join(fixtureDirectory, "summary.md");
    const artifactPath = join(fixtureDirectory, "artifact", "comparison.md");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      await writeFile(basePath, JSON.stringify({ total: base }));
      await writeFile(
        headPath,
        JSON.stringify({
          total: summary({ lines: 49.5, statements: 45, branches: 40, functions: 35 }),
        })
      );

      await compareCoverage([basePath, headPath, artifactPath], {
        GITHUB_ACTIONS: "true",
        GITHUB_STEP_SUMMARY: summaryPath,
      });

      expect(log).toHaveBeenCalledWith(
        "::warning title=Frontend coverage decreased::Lines decreased by 0.50 percentage points"
      );
      expect(await readFile(summaryPath, "utf8")).toContain("> [!WARNING]");
      expect(await readFile(artifactPath, "utf8")).toContain("> [!WARNING]");
    } finally {
      log.mockRestore();
      await rm(fixtureDirectory, { recursive: true, force: true });
    }
  });
});

describe("buildChangedFileCoverage", () => {
  test("lists human-readable coverage for each changed file", () => {
    const report = {
      total: summary({ lines: 80, statements: 75, branches: 60, functions: 90 }),
      "/workspace/scripts/example.mjs": summary({
        lines: 80,
        statements: 75,
        branches: 60,
        functions: 90,
      }),
    };

    const output = buildChangedFileCoverage(report);

    expect(output).toContain("## Coverage of changed files");
    expect(output).toContain("`scripts/example.mjs`");
    expect(output).toContain("| 80.00% | 75.00% | 60.00% | 90.00% |");
  });

  test("explains when no measurable application files changed", () => {
    const output = buildChangedFileCoverage({
      total: summary({ lines: 0, statements: 0, branches: 0, functions: 0 }),
    });

    expect(output).toContain("No measurable application files changed");
  });
});
