export const MIN_MEASURED_TIMELINE_MS = 80;

export function getRawTransitionDurationMs(
  sourceProcessingMs: number,
  targetProcessingMs: number,
  gapMs: number,
  overlapMs = 0,
) {
  // b = c + a: source processing plus the non-overlapping wait until target.
  // When both node intervals overlap, discount half of their shared time.
  const sourceMs = Math.max(0, sourceProcessingMs);
  const targetMs = Math.max(0, targetProcessingMs);
  const sharedMs = Math.min(sourceMs, targetMs, Math.max(0, overlapMs));
  return Math.max(0, sourceMs + Math.max(0, gapMs) - sharedMs / 2);
}

export function getTransitionDurationMs(
  sourceProcessingMs: number,
  targetProcessingMs: number,
  gapMs: number,
  overlapMs = 0,
) {
  return Math.max(
    MIN_MEASURED_TIMELINE_MS,
    getRawTransitionDurationMs(sourceProcessingMs, targetProcessingMs, gapMs, overlapMs),
  );
}
