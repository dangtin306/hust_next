export const DELAY_PLAYBACK_TIME_SCALE = 3;

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
