export type CalibrationBuckets = {
  agree: number;
  near: number;
  disagree: number;
};

/**
 * Match Expertiza-style calibration buckets: exact match = agree, +/-1 = near, else disagree.
 */
export function bucketScoresAgainstInstructor(
  instructorScore: number | null | undefined,
  studentScores: (number | null | undefined)[]
): CalibrationBuckets {
  if (instructorScore == null || Number.isNaN(Number(instructorScore))) {
    return { agree: 0, near: 0, disagree: 0 };
  }
  const s = Number(instructorScore);
  let agree = 0;
  let near = 0;
  let disagree = 0;
  for (const raw of studentScores) {
    if (raw == null) continue;
    const score = Number(raw);
    if (Number.isNaN(score)) continue;
    if (score === s) agree++;
    else if (Math.abs(score - s) === 1) near++;
    else disagree++;
  }
  return { agree, near, disagree };
}

export function averageFromDistribution(distribution: Record<string, number>): number | null {
  const entries = Object.entries(distribution);
  if (!entries.length) return null;
  let sum = 0;
  let n = 0;
  for (const [k, c] of entries) {
    const score = Number(k);
    const count = Number(c);
    if (Number.isNaN(score) || Number.isNaN(count)) continue;
    sum += score * count;
    n += count;
  }
  if (n === 0) return null;
  return sum / n;
}
