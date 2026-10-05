export const MIN_MEASURED_TIMELINE_MS = 80;

export function getTransitionDurationMs(processingMs: number, gapMs: number) {
  return Math.max(MIN_MEASURED_TIMELINE_MS, Math.max(0, processingMs) + Math.max(0, gapMs));
}
