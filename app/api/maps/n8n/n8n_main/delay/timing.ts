import { getTransitionDurationMs } from "../timing";

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
  sourceProcessingMs: number,
  targetProcessingMs: number,
  gapMs: number,
  overlapMs: number,
) {
  return getTransitionDurationMs(sourceProcessingMs, targetProcessingMs, gapMs, overlapMs);
}

export function getDelayedParticlePlan(
  playbackStartedAt: number,
  timelineStartedAt: number,
  sourceStartedAt: number,
  sourceProcessingMs: number,
  targetProcessingMs: number,
  gapMs: number,
  overlapMs: number,
  sourceVisualMidpointAt?: number,
) {
  const nominalStartAt = getDelayedTimelineTime(
    playbackStartedAt,
    timelineStartedAt,
    sourceStartedAt + Math.max(0, sourceProcessingMs) / 2,
  );
  const startedAt = Math.max(
    nominalStartAt,
    Number.isFinite(sourceVisualMidpointAt) ? sourceVisualMidpointAt! : nominalStartAt,
  );
  const measuredDurationMs = getDelayedTransitionDuration(
    sourceProcessingMs,
    targetProcessingMs,
    gapMs,
    overlapMs,
  );
  const durationMs = Math.max(MIN_DELAYED_PARTICLE_TRAVEL_MS, measuredDurationMs)
    * DELAY_PLAYBACK_TIME_SCALE;
  return {
    startedAt,
    durationMs,
    targetVisualMidpointAt: startedAt + durationMs,
  };
}
