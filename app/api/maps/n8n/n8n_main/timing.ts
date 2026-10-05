export const MIN_MEASURED_TIMELINE_MS = 80;

export function getRawTransitionDurationMs(sourceProcessingMs: number, targetProcessingMs: number, gapMs: number) {
  // Move from the source processing midpoint to the target processing midpoint.
  return Math.max(0, sourceProcessingMs) / 2
    + Math.max(0, gapMs)
    + Math.max(0, targetProcessingMs) / 2;
}

export function getTransitionDurationMs(sourceProcessingMs: number, targetProcessingMs: number, gapMs: number) {
  return Math.max(
    MIN_MEASURED_TIMELINE_MS,
    getRawTransitionDurationMs(sourceProcessingMs, targetProcessingMs, gapMs),
  );
}
