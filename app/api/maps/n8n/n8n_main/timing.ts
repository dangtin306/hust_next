export const MIN_MEASURED_TIMELINE_MS = 80;

export function getRawTransitionDurationMs(
  sourceProcessingMs: number,
  targetProcessingMs: number,
  gapMs: number,
  overlapMs = 0,
) {
  // Keep each node's distinct processing time whole; discount half of the overlap.
  const sourceMs = Math.max(0, sourceProcessingMs);
  const targetMs = Math.max(0, targetProcessingMs);
  const sharedMs = Math.min(sourceMs, targetMs, Math.max(0, overlapMs));
  return sourceMs
    + Math.max(0, gapMs)
    + targetMs
    - sharedMs / 2;
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
