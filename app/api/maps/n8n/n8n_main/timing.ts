export const MIN_MEASURED_TIMELINE_MS = 80;

export function getTransitionDurationMs(sourceProcessingMs: number, targetProcessingMs: number, gapMs: number) {
  // Move from the source processing midpoint to the target processing midpoint.
  // The gap is signed because source and target work can overlap.
  const midpointDistance = Math.max(0, sourceProcessingMs) / 2
    + gapMs
    + Math.max(0, targetProcessingMs) / 2;
  return Math.max(MIN_MEASURED_TIMELINE_MS, midpointDistance);
}
