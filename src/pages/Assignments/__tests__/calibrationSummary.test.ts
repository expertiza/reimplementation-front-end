import { describe, it, expect } from "vitest";
import {
  bucketScoresAgainstInstructor,
  averageFromDistribution,
} from "../calibrationSummary";

describe("bucketScoresAgainstInstructor", () => {
  it("counts agree, near, and disagree", () => {
    expect(bucketScoresAgainstInstructor(3, [3, 4, 2, 5])).toEqual({
      agree: 1,
      near: 2,
      disagree: 1,
    });
  });

  it("returns zeros when instructor score is missing", () => {
    expect(bucketScoresAgainstInstructor(undefined, [1, 2, 3])).toEqual({
      agree: 0,
      near: 0,
      disagree: 0,
    });
  });

  it("skips null student scores", () => {
    expect(bucketScoresAgainstInstructor(2, [null, 2, undefined])).toEqual({
      agree: 1,
      near: 0,
      disagree: 0,
    });
  });
});

describe("averageFromDistribution", () => {
  it("computes weighted average", () => {
    expect(averageFromDistribution({ "1": 2, "5": 2 })).toBe(3);
  });

  it("returns null for empty", () => {
    expect(averageFromDistribution({})).toBeNull();
  });
});
