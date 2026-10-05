export const MIN_MEASURED_TIMELINE_MS = 80;

export function getRawTransitionDurationMs(
  sourceProcessingMs: number,
  targetProcessingMs: number,
  gapMs: number,
  overlapMs = 0,
) {
  // Keep the idle gap whole; count the shared processing interval at half weight.
  return Math.max(0, sourceProcessingMs) / 2
    + Math.max(0, gapMs)
    + Math.max(0, targetProcessingMs) / 2
    - Math.max(0, overlapMs) / 2;
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
