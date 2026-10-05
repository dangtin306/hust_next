"use client";

import { useEffect, useRef } from "react";
import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export type RealtimeSignalParticle = {
  id: string;
  startedAt: number;
  durationMs: number;
  laneOffset: number;
};

export type RealtimeSignalEdgeData = {
  particles?: RealtimeSignalParticle[];
};

const EMPTY_SIGNAL_PARTICLES: RealtimeSignalParticle[] = [];

export function RealtimeSignalEdge(props: EdgeProps) {
  const [path] = getBezierPath(props);
  const data = (props.data || {}) as RealtimeSignalEdgeData;
  const particles = data.particles ?? EMPTY_SIGNAL_PARTICLES;
  const motionPathRef = useRef<SVGPathElement>(null);
  const particleRefs = useRef<Map<string, SVGCircleElement>>(new Map());

  useEffect(() => {
    if (!particles.length) return;
    const motionPath = motionPathRef.current;
    if (!motionPath) return;

    const pathLength = motionPath.getTotalLength();
    let frameId = 0;
    const moveSignal = (now: number) => {
      let moving = false;
      particles.forEach((particle) => {
        const signal = particleRefs.current.get(particle.id);
        if (!signal) return;
        const elapsed = now - particle.startedAt;
        if (elapsed < 0) {
          const startPoint = motionPath.getPointAtLength(0);
          signal.setAttribute("cx", String(startPoint.x));
          signal.setAttribute("cy", String(startPoint.y));
          moving = true;
          return;
        }
        const progress = Math.min(1, elapsed / Math.max(1, particle.durationMs));
        const point = motionPath.getPointAtLength(pathLength * progress);
        const before = motionPath.getPointAtLength(Math.max(0, pathLength * progress - 1));
        const after = motionPath.getPointAtLength(Math.min(pathLength, pathLength * progress + 1));
        const tangentX = after.x - before.x;
        const tangentY = after.y - before.y;
        const tangentLength = Math.max(1, Math.hypot(tangentX, tangentY));
        signal.setAttribute("cx", String(point.x - (tangentY / tangentLength) * particle.laneOffset));
        signal.setAttribute("cy", String(point.y + (tangentX / tangentLength) * particle.laneOffset));
        if (progress < 1) moving = true;
      });
      if (moving) frameId = requestAnimationFrame(moveSignal);
    };

    frameId = requestAnimationFrame(moveSignal);
    return () => cancelAnimationFrame(frameId);
  }, [particles, path]);

  return (
    <g
      data-realtime-edge-id={props.id}
      data-signal-active={particles.length ? "true" : "false"}
      data-signal-count={particles.length}
      data-signal-source={props.source}
      data-signal-target={props.target}
    >
      <BaseEdge id={props.id} path={path} style={props.style} markerEnd={props.markerEnd} />
      <path ref={motionPathRef} d={path} fill="none" stroke="none" aria-hidden="true" />
      {particles.map((particle) => (
        <circle
          key={particle.id}
          ref={(element) => {
            if (element) particleRefs.current.set(particle.id, element);
            else particleRefs.current.delete(particle.id);
          }}
          data-signal-particle={particle.id}
          r="4"
          fill="#a5f3fc"
          filter="drop-shadow(0 0 5px #22d3ee)"
        />
      ))}
    </g>
  );
}
