export const REALTIME_INITIAL_BUFFER_MS = 1000;
export const REALTIME_BUFFER_INCREMENT_MS = 1000;
export const REALTIME_MAX_BUFFER_INCREASES = 10;

export function getRealtimeDisplayTime(
  firstArrivedAt: number,
  firstStartedAt: number,
  eventStartedAt: number,
  bufferMs: number,
) {
  return firstArrivedAt + Math.max(0, eventStartedAt - firstStartedAt) + bufferMs;
}

export function getRealtimeParticleStartAt(
  now: number,
  sourceVisualStartAt: number,
  sourceBufferMs: number,
  currentBufferMs: number,
) {
  const deferredBufferMs = Math.max(0, currentBufferMs - sourceBufferMs);
  return Math.max(now, sourceVisualStartAt + deferredBufferMs);
}
