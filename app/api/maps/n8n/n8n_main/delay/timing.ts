export const DELAY_PLAYBACK_TIME_SCALE = 3;
export const MIN_DELAYED_PARTICLE_TRAVEL_MS = 80;

export function getDelayedTimelineTime(
  playbackStartedAt: number,
  timelineStartedAt: number,
  eventAt: number,
) {
  return playbackStartedAt + Math.max(0, eventAt - timelineStartedAt) * DELAY_PLAYBACK_TIME_SCALE;
}

export function getDelayedTimelineDuration(durationMs: number) {
  return Math.max(0, durationMs) * DELAY_PLAYBACK_TIME_SCALE;
}

export function getDelayedTransitionDuration(
  sourceStartedAt: number,
  targetStartedAt: number,
  processingMs: number,
  gapMs: number,
) {
  const observedStartSeparation = targetStartedAt - sourceStartedAt;
  if (Number.isFinite(observedStartSeparation) && observedStartSeparation > 0) {
    return observedStartSeparation;
  }
  return Math.max(1, Math.max(0, processingMs) + Math.max(0, gapMs));
}

export function getDelayedParticlePlan(
  playbackStartedAt: number,
  timelineStartedAt: number,
  sourceStartedAt: number,
  targetStartedAt: number,
  processingMs: number,
  gapMs: number,
  sourceVisualStartedAt?: number,
) {
  const nominalStartAt = getDelayedTimelineTime(playbackStartedAt, timelineStartedAt, sourceStartedAt);
  const startedAt = Math.max(
    nominalStartAt,
    Number.isFinite(sourceVisualStartedAt) ? sourceVisualStartedAt! : nominalStartAt,
  );
  const durationMs = Math.max(
    MIN_DELAYED_PARTICLE_TRAVEL_MS,
    getDelayedTransitionDuration(sourceStartedAt, targetStartedAt, processingMs, gapMs)
      * DELAY_PLAYBACK_TIME_SCALE,
  );
  return {
    startedAt,
    durationMs,
    targetVisualStartedAt: startedAt + durationMs,
  };
}
