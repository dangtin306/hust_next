"use client";

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useId,
  forwardRef,
} from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  MiniMap,
  Handle,
  Position,
  getBezierPath,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type EdgeProps,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { io, type Socket } from "socket.io-client";

import {
  ArrowLeftRight,
  Boxes,
  Clock,
  Code2,
  Database,
  Expand,
  GitBranch,
  GitMerge,
  MessageSquare,
  Pause,
  Play,
  Radio,
  Sliders,
  X,
} from "lucide-react";

// ==========================================
// 1. DATA CONTRACT TỪ CHUẨN HÓA BACKEND
// ==========================================

export type PositionInput = [number, number] | { x: number; y: number };

export interface N8nFlowNode {
  id: string;
  name: string;
  type: string;
  typeVersion?: number;
  position: PositionInput;
  disabled?: boolean;
  isStickyNote?: false;
  [key: string]: unknown;
}

export interface N8nStickyNote {
  id: string;
  name?: string;
  type?: string;
  position: PositionInput;
  content: string;
  width: number;
  height: number;
  color: number;
  disabled?: boolean;
  isStickyNote?: true;
  [key: string]: unknown;
}

export interface N8nEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  connectionType?: string;
  outputIndex?: number;
  targetIndex?: number;
  [key: string]: unknown;
}

export interface N8nStageEdge {
  source: string;
  target: string;
}

export interface N8nNormalizedGraph {
  id?: string;
  workflow_id?: string;
  workflow?: {
    id?: string;
    name?: string;
    active?: boolean;
  };
  workflowId?: string;
  name?: string;
  active?: boolean;
  nodes?: N8nFlowNode[];
  flowNodes?: N8nFlowNode[];
  stickyNotes?: N8nStickyNote[];
  connections?: Record<string, unknown>;
  edges?: N8nEdge[];
  version?: string;
  updated_at?: string;
  meta?: {
    nodeCount?: number;
    stickyNoteCount?: number;
    totalNodeCount?: number;
    edgeCount?: number;
    connectionCount?: number;
  };
}

export interface N8nTracePayload {
  event?: string;
  event_id?: string;
  workflow_id?: string;
  status?: "running" | "success" | "slow" | "error";
  phase?: "start" | "complete";
  request_id?: string;
  status_code?: number;
  duration_ms?: number;
  stage_node_ids?: string[];
  stage_edges?: N8nStageEdge[];
  stages?: string[];
  api_results?: N8nTracePayload;
  data?: N8nTracePayload;
  payload?: N8nTracePayload;
  trace?: {
    uri?: string;
    method?: string;
    stage_node_ids?: string[];
    stage_edges?: N8nStageEdge[];
    phase?: "start" | "complete";
    request_id?: string;
  };
  timestamp?: string;
}

const normalizeSocketTrace = (input: N8nTracePayload): N8nTracePayload => {
  const payload = input.api_results ?? input.data ?? input.payload ?? input;
  const nestedStageIds = payload.trace?.stage_node_ids;
  const stageNodeIds =
    Array.isArray(payload.stage_node_ids) && payload.stage_node_ids.length > 0
      ? payload.stage_node_ids
      : Array.isArray(nestedStageIds)
        ? nestedStageIds
        : [];

  return {
    ...payload,
    stage_node_ids: stageNodeIds,
    stage_edges: Array.isArray(payload.stage_edges)
      ? payload.stage_edges
      : Array.isArray(payload.trace?.stage_edges)
        ? payload.trace.stage_edges
        : undefined,
    phase: payload.phase ?? payload.trace?.phase ?? input.phase,
    request_id: payload.request_id ?? payload.trace?.request_id ?? input.request_id,
    trace: payload.trace,
  };
};

export interface N8nGraphSocketPayload {
  event?: string;
  workflow_id?: string;
  workflow?: {
    id?: string;
    name?: string;
    active?: boolean;
    [key: string]: unknown;
  };
  graph: N8nNormalizedGraph;
  timestamp?: string;
}

export type LiveNodeStatus = "idle" | "running" | "success" | "slow" | "error";

export type FlowNodeData = {
  name: string;
  nodeType: string;
  typeVersion?: number;
  disabled?: boolean;
  liveStatus: LiveNodeStatus;
  signalVersion?: number;
  handles?: {
    target: Array<string | null>;
    source: Array<string | null>;
  };
  [key: string]: unknown;
};

export const deriveNodeHandles = (edges: N8nEdge[], nodeId: string) => {
  const target = new Set<string | null>();
  const source = new Set<string | null>();

  edges.forEach((edge) => {
    if (edge.target === nodeId) target.add(edge.targetHandle ?? null);
    if (edge.source === nodeId) source.add(edge.sourceHandle ?? null);
  });

  return { target: [...target], source: [...source] };
};

const handleTop = (index: number, count: number) =>
  count <= 1 ? "50%" : `${((index + 1) / (count + 1)) * 100}%`;

type MermaidSubdiagram = {
  nodeId: string;
  nodeName: string;
  definition: string;
  source?: string;
  children: string[];
};

function getMermaidDefinition(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const fenced = value.match(/```\s*mermaid\s*\r?\n([\s\S]*?)```/i);
  if (fenced?.[1]?.trim()) return fenced[1].trim();

  const trimmed = value.trim();
  return /^(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph|quadrantChart|xychart-beta|block-beta)\b/i.test(trimmed)
    ? trimmed
    : null;
}

function getNodeMermaid(data: FlowNodeData, nodeId: string): MermaidSubdiagram | null {
  const markdown = data.markdown;
  const markdownRecord = markdown && typeof markdown === "object"
    ? (markdown as Record<string, unknown>)
    : null;
  const definition =
    getMermaidDefinition(markdownRecord?.content) ??
    getMermaidDefinition(markdown) ??
    getMermaidDefinition(data.notes);
  if (!definition) return null;

  const children = Array.isArray(markdownRecord?.embedded_children)
    ? markdownRecord.embedded_children.filter((child): child is string => typeof child === "string")
    : [];

  return {
    nodeId,
    nodeName: data.name,
    definition,
    source: typeof markdownRecord?.source === "string" ? markdownRecord.source : undefined,
    children,
  };
}

function MermaidDiagram({ definition }: { definition: string }) {
  const reactId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    setError(null);
    const renderDiagram = async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "dark" });
        const id = `workflow-subdiagram-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
        const result = await mermaid.render(id, definition);
        if (cancelled || !container) return;
        container.innerHTML = result.svg;
        result.bindFunctions?.(container);
      } catch (renderError) {
        if (!cancelled) {
          setError(renderError instanceof Error ? renderError.message : "Không thể render sơ đồ Mermaid.");
        }
      }
    };
    void renderDiagram();
    return () => {
      cancelled = true;
      container?.replaceChildren();
    };
  }, [definition, reactId]);

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-700 bg-[#15191e] p-4">
      {error ? (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/40 p-4 text-sm text-rose-200">
          Không thể hiển thị sơ đồ: {error}
        </div>
      ) : (
        <div ref={containerRef} className="w-max min-w-full [&>svg]:h-auto [&>svg]:max-w-none" />
      )}
    </div>
  );
}

export type StickyNoteData = {
  content: string;
  color: number;
  width: number;
  height: number;
  [key: string]: unknown;
};

// ==========================================
// 2. HELPER UTILS (POSITION & COLOR MAP)
// ==========================================

export function normalizePosition(position: unknown): { x: number; y: number } {
  if (Array.isArray(position)) {
    return { x: position[0] ?? 0, y: position[1] ?? 0 };
  }

  const p = position as { x?: number; y?: number } | undefined;
  return {
    x: p?.x ?? 0,
    y: p?.y ?? 0,
  };
}

const STICKY_COLOR_MAP: Record<
  number,
  { border: string; bg: string; header: string }
> = {
  4: {
    // Xanh lá (Health & Metrics)
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/20",
    header: "text-emerald-400",
  },
  5: {
    // Xanh dương (Laravel Modules)
    border: "border-blue-500/40",
    bg: "bg-blue-950/20",
    header: "text-blue-400",
  },
  6: {
    // Tím (Heartbeat)
    border: "border-purple-500/40",
    bg: "bg-purple-950/20",
    header: "text-purple-400",
  },
  7: {
    // Xám (Trace Ingress)
    border: "border-slate-600/40",
    bg: "bg-slate-900/30",
    header: "text-slate-300",
  },
};

const getNodeCategory = (nodeType = "") => {
  const lower = String(nodeType).toLowerCase();
  // The Laravel graph uses noOp nodes as visual steps, not disabled actions.
  if (lower.endsWith(".noop")) return { icon: Boxes, bg: "bg-[#0ea5e9]" };
  // Webhook: Cam / Hồng san hô n8n
  if (lower.includes("webhook")) return { icon: Radio, bg: "bg-[#ff6d5a]" };
  // Schedule: Xanh lá
  if (lower.includes("trigger") || lower.includes("cron") || lower.includes("schedule"))
    return { icon: Clock, bg: "bg-[#10b981]" };
  // HTTP Request: Xanh / Tím
  if (lower.includes("http") || lower.includes("request"))
    return { icon: ArrowLeftRight, bg: "bg-[#6366f1]" };
  // Code: Vàng
  if (lower.includes("code") || lower.includes("function"))
    return { icon: Code2, bg: "bg-[#f59e0b]" };
  // If / Switch: Tím / Violet
  if (lower.includes("if") || lower.includes("switch"))
    return { icon: GitBranch, bg: "bg-[#8b5cf6]" };
  if (lower.includes("merge"))
    return { icon: GitMerge, bg: "bg-[#14b8a6]" };
  if (lower.includes("telegram") || lower.includes("slack") || lower.includes("discord"))
    return { icon: MessageSquare, bg: "bg-[#0ea5e9]" };
  if (lower.includes("postgres") || lower.includes("mysql") || lower.includes("mongo") || lower.includes("redis"))
    return { icon: Database, bg: "bg-[#2563eb]" };
  if (lower.includes("set"))
    return { icon: Sliders, bg: "bg-[#ec4899]" };
  return { icon: Boxes, bg: "bg-[#64748b]" };
};

const formatNodeType = (nodeType = "") => {
  if (!nodeType) return "n8n Node";
  const parts = nodeType.split(".");
  const raw = parts[parts.length - 1] || nodeType;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

// ==========================================
// 3. CUSTOM REACT FLOW NODE RENDERERS
// (Khai báo ngoài component theo chuẩn React Flow)
// ==========================================

// Custom Sticky Note Panel (Background) - KHÔNG có handle, zIndex thấp, không chặn tương tác
function N8nStickyNoteRenderer({ data }: NodeProps<Node<StickyNoteData>>) {
  const theme = STICKY_COLOR_MAP[data.color] || STICKY_COLOR_MAP[5];
  const contentLines = String(data.content || "").split("\n");
  const heading = contentLines[0]?.replace(/^#{1,6}\s*/, "");

  return (
    <div
      style={{
        width: `${data.width}px`,
        height: `${data.height}px`,
      }}
      className={`rounded-2xl border-2 border-dashed ${theme.border} ${theme.bg} p-5 select-text nodrag nopan pointer-events-auto transition-all duration-300 flex flex-col justify-start`}
    >
      {heading && (
        <h4 className={`text-xl leading-5 font-bold tracking-wide uppercase ${theme.header} mb-2`}>
          {heading}
        </h4>
      )}
      <div className="text-[17px] text-slate-300/85 leading-5 space-y-1 whitespace-pre-wrap">
        {contentLines.slice(1).join("\n")}
      </div>
    </div>
  );
}

// Custom Flow Node (Kiểu Node vuông n8n Editor với icon lớn và label bên dưới)
function N8nFlowNodeRenderer({ data, selected }: NodeProps<Node<FlowNodeData>>) {
  const meta = getNodeCategory(data.nodeType);
  const Icon = meta.icon;
  const visuallyDisabled = Boolean(data.disabled) && !String(data.nodeType).toLowerCase().endsWith(".noop");
  const hasMermaidDiagram = Boolean(data.hasMermaidDiagram);
  const targetHandles = data.handles?.target ?? [];
  const sourceHandles = data.handles?.source ?? [];
  const liveStatus = data.liveStatus || "idle";

  let liveClass = "";
  if (liveStatus === "running") liveClass = "n8n-node--running";
  else if (liveStatus === "success") liveClass = "n8n-node--success";
  else if (liveStatus === "slow") liveClass = "n8n-node--slow";
  else if (liveStatus === "error") liveClass = "n8n-node--error";

  return (
    <div
      className={`relative group flex flex-col items-center transition-transform duration-200 pointer-events-auto ${
        liveStatus === "running" ? "scale-105" : ""
      } ${
        hasMermaidDiagram ? "cursor-pointer" : "cursor-default"
      }`}
      title={hasMermaidDiagram ? `${data.name} — bấm để mở sơ đồ con` : data.name}
    >
      {/* Khung vuông icon chính (~64x64) mô phỏng chuẩn node n8n Editor */}
      <div
        key={data.signalVersion ?? 0}
        className={`relative w-20 h-20 rounded-2xl border-2 flex items-center justify-center shadow-lg transition-all duration-300 ${
          liveClass ||
          (visuallyDisabled
            ? "opacity-50 grayscale border-slate-700 bg-slate-900/90"
            : "border-slate-800 hover:border-slate-700 bg-slate-900/90")
        } ${selected ? "!border-amber-400 !ring-2 !ring-amber-400/40" : ""}`}
      >
        {targetHandles.map((handleId, index) => (
          <Handle
            key={`target-${handleId ?? "default"}`}
            type="target"
            position={Position.Left}
            id={handleId ?? undefined}
            style={{ top: handleTop(index, targetHandles.length) }}
            className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-950 transition-transform group-hover:scale-125"
            title={`Input ${handleId ?? "default"}`}
          />
        ))}

        {/* Khung Icon màu theo phân loại n8n */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105 ${
            visuallyDisabled ? "bg-slate-800 text-slate-500" : `${meta.bg} text-white`
          }`}
        >
          <Icon className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Huy hiệu mini trạng thái realtime trên góc icon */}
        {liveStatus !== "idle" && (
          <span
            className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 shadow-sm ${
              liveStatus === "running" ? "bg-cyan-400 n8n-node-signal-ping"
              : liveStatus === "success" ? "bg-emerald-400"
              : liveStatus === "slow" ? "bg-amber-400"
              : "bg-rose-500 animate-pulse"
            }`}
          />
        )}
        {hasMermaidDiagram && (
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-950 bg-violet-500 text-white shadow" aria-label="Có sơ đồ Mermaid">
            <Expand className="h-2.5 w-2.5" />
          </span>
        )}

        {sourceHandles.map((handleId, index) => (
          <Handle
            key={`source-${handleId ?? "default"}`}
            type="source"
            position={Position.Right}
            id={handleId ?? undefined}
            style={{ top: handleTop(index, sourceHandles.length) }}
            className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-950 transition-transform group-hover:scale-125"
            title={`Output ${handleId ?? "default"}`}
          />
        ))}
      </div>

      {/* Tên node và version nằm bên dưới icon box, căn giữa, tối đa 2 dòng */}
      <div className="nodrag nopan select-text mt-1.5 text-center w-full px-0.5 flex flex-col items-center">
        <span
          className={`text-[17px] font-medium leading-5 line-clamp-2 max-w-[124px] break-words ${hasMermaidDiagram ? "text-violet-200" : "text-slate-200"}`}
          title={data.name}
        >
          {data.name}
        </span>
        <div className="flex items-center gap-1 mt-0.5 text-[13px] leading-[14px] text-slate-400 font-mono max-w-[124px]">
          <span className="truncate max-w-[100px]">{formatNodeType(data.nodeType)}</span>
          {data.typeVersion !== undefined && (
            <span className="text-slate-500 font-normal">v{data.typeVersion}</span>
          )}
        </div>
        {visuallyDisabled && (
          <span className="mt-0.5 text-xs font-bold uppercase tracking-wider text-rose-400">
            Disabled
          </span>
        )}
      </div>
    </div>
  );
}

// Khai báo nodeTypes ở ngoài component theo khuyến nghị chính thức của React Flow
const N8N_NODE_TYPES = {
  n8nNode: N8nFlowNodeRenderer,
  stickyNote: N8nStickyNoteRenderer,
};

type EdgeRunVisual = {
  edgeId: string;
  requestKey: string;
  status: LiveNodeStatus;
  version: number;
  startedAt: number;
  durationMs: number;
  laneOffset: number;
  motionActive: boolean;
};

type TraceEdgeData = {
  activities?: EdgeRunVisual[];
  traceMotionEnabled?: boolean;
  [key: string]: unknown;
};

type TraceRun = {
  key: string;
  status: LiveNodeStatus;
  edgeAnimationActive: boolean;
  activeEdgeStartedAt: number | null;
  visitedEdgeSlots: Array<string | null>;
  visitedNodeIds: string[];
  activeEdgeIds: string[];
  activatedNodeIds: string[];
  edgeVersions: Map<string, number>;
  nodeStates: Map<string, LiveNodeStatus>;
  timers: Set<ReturnType<typeof setTimeout>>;
  nodeFallbackTimers: Map<string, ReturnType<typeof setTimeout>>;
};

const EDGE_TRAVEL_MS = 1250;
const NODE_FALLBACK_MS = 15_000;
const RESULT_HOLD_MS = 1000;
const TRACE_RUN_STALE_MS = 120_000;
const TRACE_EVENT_DEDUPE_MS = 120_000;
const MAX_SEEN_TRACE_EVENTS = 500;
const MAX_ACTIVE_TRACE_PARTICLES = 6;

function getTraceStageEdges(trace: N8nTracePayload): N8nStageEdge[] {
  if (Array.isArray(trace.stage_edges) && trace.stage_edges.length > 0) {
    return trace.stage_edges.filter(
      (edge) => typeof edge?.source === "string" && typeof edge?.target === "string",
    );
  }

  const ids = trace.stage_node_ids ?? [];
  return ids.slice(1).map((target, index) => ({ source: ids[index], target }));
}

function matchingPrefixLength<T>(path: T[], visited: T[]): number {
  let index = 0;
  while (index < path.length && path[index] === visited[index]) index += 1;
  return index;
}

function N8nTraceEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  pathOptions,
  markerStart,
  markerEnd,
  style,
  data,
}: EdgeProps) {
  const [path, centerX, centerY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: pathOptions?.curvature,
  });
  const { activities = [], traceMotionEnabled = true } = (data ?? {}) as TraceEdgeData;
  const motionPathRef = useRef<SVGPathElement | null>(null);
  const particleRefs = useRef<Map<string, SVGCircleElement>>(new Map());
  const colors: Record<LiveNodeStatus, string> = {
    idle: "#64748b",
    running: "#22d3ee",
    success: "#22c55e",
    slow: "#eab308",
    error: "#ef4444",
  };

  useEffect(() => {
    const movingActivities = activities.filter((activity) => activity.motionActive && traceMotionEnabled);
    const motionPath = motionPathRef.current;
    if (!movingActivities.length || !motionPath) return;

    const pathLength = motionPath.getTotalLength();
    if (!Number.isFinite(pathLength) || pathLength <= 0) return;

    let frameId = 0;
    const moveParticles = (now: number) => {
      let hasMovingParticles = false;
      const startPoint = motionPath.getPointAtLength(0);

      movingActivities.forEach((activity) => {
        const key = `${activity.requestKey}:${activity.version}`;
        const particle = particleRefs.current.get(key);
        if (!particle) return;

        const elapsed = now - activity.startedAt;
        if (elapsed < 0) {
          particle.setAttribute("cx", String(startPoint.x));
          particle.setAttribute("cy", String(startPoint.y));
          hasMovingParticles = true;
          return;
        }

        const progress = Math.min(1, elapsed / Math.max(1, activity.durationMs));
        const distance = pathLength * progress;
        const point = motionPath.getPointAtLength(distance);
        const before = motionPath.getPointAtLength(Math.max(0, distance - 1));
        const after = motionPath.getPointAtLength(Math.min(pathLength, distance + 1));
        const tangentX = after.x - before.x;
        const tangentY = after.y - before.y;
        const tangentLength = Math.max(1, Math.hypot(tangentX, tangentY));
        particle.setAttribute("cx", String(point.x - (tangentY / tangentLength) * activity.laneOffset));
        particle.setAttribute("cy", String(point.y + (tangentX / tangentLength) * activity.laneOffset));

        if (progress < 1) hasMovingParticles = true;
      });

      if (hasMovingParticles) frameId = requestAnimationFrame(moveParticles);
    };

    frameId = requestAnimationFrame(moveParticles);
    return () => cancelAnimationFrame(frameId);
  }, [activities, path, traceMotionEnabled]);

  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerStart={markerStart} markerEnd={markerEnd} />
      <path ref={motionPathRef} d={path} fill="none" stroke="none" aria-hidden="true" />
      {activities.map((activity) => {
        const color = colors[activity.status];
        const key = `${activity.requestKey}:${activity.version}`;
        return (
          <circle
            key={key}
            ref={(element) => {
              if (element) particleRefs.current.set(key, element);
              else particleRefs.current.delete(key);
            }}
            cx={centerX}
            cy={centerY}
            r={4}
            fill={color}
            filter={`drop-shadow(0 0 5px ${color})`}
            aria-hidden="true"
            pointerEvents="none"
          />
        );
      })}
    </>
  );
}

const N8N_EDGE_TYPES = { traceEdge: N8nTraceEdge };

// ==========================================
// 4. CHUYỂN ĐỔI GRAPH CHUẨN HÓA SANG FLOW
// ==========================================

export const convertNormalizedGraphToFlow = (
  inputGraph: N8nNormalizedGraph | { graph?: N8nNormalizedGraph; workflow?: unknown }
) => {
  // Hỗ trợ cả object graph chuẩn hóa trực tiếp hoặc wrapper { workflow, graph }
  const graph: N8nNormalizedGraph =
    inputGraph && typeof inputGraph === "object" && "graph" in inputGraph && inputGraph.graph
      ? (inputGraph.graph as N8nNormalizedGraph)
      : (inputGraph as N8nNormalizedGraph);

  const isStickyNote = (node: N8nFlowNode | N8nStickyNote) =>
    Boolean(
      node.isStickyNote ||
      node.type === "stickyNote" ||
      node.type === "n8n-nodes-base.stickyNote" ||
      (typeof node.type === "string" && node.type.toLowerCase().includes("stickynote"))
    );

  // 1. Tách và gộp stickyNotes từ cả mảng riêng lẫn graph.nodes
  type StickyCandidate = Partial<N8nStickyNote> & Pick<N8nFlowNode, "id" | "position">;
  const stickyNoteMap = new Map<string, StickyCandidate>();
  const candidates: StickyCandidate[] = [
    ...(graph.stickyNotes ?? []).map((note) => ({ ...note, isStickyNote: true as const })),
    ...(graph.nodes ?? []).filter(isStickyNote).map((note) => ({ ...note, isStickyNote: true as const })),
    ...(graph.flowNodes ?? []).filter(isStickyNote).map((note) => ({ ...note, isStickyNote: true as const })),
  ];
  candidates.forEach((note, index) => {
    const id = note.id || `sticky-note-${index}`;
    if (!stickyNoteMap.has(id)) stickyNoteMap.set(id, { ...note, id });
  });
  const rawStickyNotes = [...stickyNoteMap.values()];
  const stickyIdSet = new Set(stickyNoteMap.keys());

  // 2. Tách flowNodes (luôn loại bỏ sticky note và loại bỏ duplicate IDs)
  const allCandidateFlowNodes = [
    ...(graph.flowNodes ?? graph.nodes ?? []),
  ].filter((node) => !isStickyNote(node));

  const flowNodeMap = new Map<string, N8nFlowNode>();
  allCandidateFlowNodes.forEach((node, index) => {
    const id = node.id || `node-${index}`;
    // Nếu trùng ID với sticky note hoặc với node khác đã có, bỏ qua hoặc đổi key duy nhất
    if (!stickyIdSet.has(id) && !flowNodeMap.has(id)) {
      flowNodeMap.set(id, { ...node, id });
    }
  });
  const rawFlowNodes = [...flowNodeMap.values()];
  const graphEdges = graph.edges ?? [];

  // Chuẩn hóa edges từ graph.edges hoặc parse từ n8n connections object với edge ID duy nhất
  const flowEdges: Edge[] = [];
  const seenEdgeIds = new Set<string>();

  if (Array.isArray(graphEdges) && graphEdges.length > 0) {
    graphEdges.forEach((edge, index) => {
      let edgeId = edge.id || `e-${index}-${edge.source}-${edge.target}`;
      if (seenEdgeIds.has(edgeId)) {
        edgeId = `edge-${index}-${edgeId}`;
      }
      seenEdgeIds.add(edgeId);
      flowEdges.push({
        id: edgeId,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: "traceEdge",
        animated: false,
        style: { stroke: "#64748b", strokeWidth: 2 },
      });
    });
  } else if (graph.connections && typeof graph.connections === "object") {
    // n8n connections format: { [sourceName]: { main: [ [ { node: targetName, type: "main", index: 0 } ] ] } }
    const nameToId = new Map<string, string>();
    rawFlowNodes.forEach((n) => {
      if (n.name && n.id) nameToId.set(n.name, n.id);
      if (n.id) nameToId.set(n.id, n.id);
    });

    Object.entries(graph.connections).forEach(([sourceName, outputs]) => {
      const sourceId = nameToId.get(sourceName) || sourceName;
      if (!outputs || typeof outputs !== "object") return;

      Object.entries(outputs as Record<string, unknown>).forEach(([connType, outputIndexGroups]) => {
        if (!Array.isArray(outputIndexGroups)) return;
        outputIndexGroups.forEach((connList, outputIndex) => {
          if (!Array.isArray(connList)) return;
          connList.forEach((conn: { node?: string; index?: number }) => {
            const targetName = conn.node;
            if (!targetName) return;
            const targetId = nameToId.get(targetName) || targetName;
            const targetIndex = conn.index || 0;
            let edgeId = `e-${sourceId}-${outputIndex}-${targetId}-${targetIndex}`;
            if (seenEdgeIds.has(edgeId)) {
              edgeId = `${edgeId}-${flowEdges.length}`;
            }
            seenEdgeIds.add(edgeId);
            flowEdges.push({
              id: edgeId,
              source: sourceId,
              target: targetId,
              sourceHandle: `${connType}-${outputIndex}`,
              targetHandle: `main-${targetIndex}`,
              type: "traceEdge",
              animated: false,
              style: { stroke: "#64748b", strokeWidth: 2 },
            });
          });
        });
      });
    });
  }

  // Map Flow Nodes với normalizePosition ({ x, y } hoặc [x, y])
  const flowNodes: Node[] = rawFlowNodes.map((node) => ({
    id: node.id,
    position: normalizePosition(node.position),
    type: "n8nNode",
    data: {
      name: node.name,
      nodeType: node.type,
      typeVersion: node.typeVersion,
      disabled: Boolean(node.disabled),
      liveStatus: "idle",
      handles: deriveNodeHandles(
        flowEdges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
        })),
        node.id
      ),
      markdown: node.markdown,
      notes: node.notes,
      hasMermaidDiagram: Boolean(
        getMermaidDefinition(
          node.markdown && typeof node.markdown === "object"
            ? (node.markdown as Record<string, unknown>).content
            : node.markdown
        ) ?? getMermaidDefinition(node.notes)
      ),
    },
  }));

  // Map Sticky Notes với zIndex: -1 và không có handle
  const stickyNotes: Node[] = rawStickyNotes.map((note) => ({
    id: note.id,
    type: "stickyNote",
    position: normalizePosition(note.position),
    data: {
      content: String(note.content || note.name || ""),
      color: note.color !== undefined ? note.color : 7,
      width: note.width || 320,
      height: note.height || 220,
    },
    draggable: false,
    selectable: false,
    connectable: false,
    zIndex: -1,
  }));

  // Đảm bảo không bao giờ có 2 node trùng id/key trong allNodes
  const finalNodes: Node[] = [];
  const registeredNodeIds = new Set<string>();

  stickyNotes.forEach((sn) => {
    if (!registeredNodeIds.has(sn.id)) {
      registeredNodeIds.add(sn.id);
      finalNodes.push(sn);
    }
  });

  flowNodes.forEach((fn) => {
    let uniqueId = fn.id;
    if (registeredNodeIds.has(uniqueId)) {
      uniqueId = `flow-${uniqueId}`;
    }
    registeredNodeIds.add(uniqueId);
    finalNodes.push(uniqueId === fn.id ? fn : { ...fn, id: uniqueId });
  });

  return {
    allNodes: finalNodes,
    flowEdges,
    flowNodeCount: flowNodes.length,
    stickyNoteCount: stickyNotes.length,
    edgeCount: flowEdges.length,
  };
};

// ==========================================
// 5. N8N RENDERER COMPONENT CHÍNH
// ==========================================

export type SSEConnectionStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export interface SSEStagePayload {
  type?: string;
  stage?: string;
  status?: string;
  service_id?: string;
  node_id?: string;
  node_name?: string;
  target_node_id?: string;
  trace_id?: string;
  request_id?: string;
  phase?: "start" | "complete" | string;
  duration_ms?: number;
  outcome?: string;
  stage_node_ids?: string[];
  stage_edges?: N8nStageEdge[];
  timestamp?: string;
  cursor?: string;
  id?: string;
  [key: string]: unknown;
}

export interface N8nDiagramRendererProps {
  graph?: N8nNormalizedGraph | { graph?: N8nNormalizedGraph; workflow?: unknown } | null;
  socketUrl?: string;
  sseUrl?: string;
  enableRealtime?: boolean;
  onTraceReceived?: (trace: N8nTracePayload) => void;
  onGraphReceived?: (payload: N8nGraphSocketPayload) => void;
  onSSEEventReceived?: (eventName: string, payload: unknown) => void;
  onSSEStatusChange?: (status: SSEConnectionStatus) => void;
  className?: string;
}

export interface N8nDiagramRendererRef {
  triggerTraceAnimation: (trace: N8nTracePayload) => void;
  triggerStageEvent: (eventName: string, payload: SSEStagePayload) => void;
  resetAllNodes: () => void;
}

export const N8nDiagramRenderer = forwardRef<
  N8nDiagramRendererRef,
  N8nDiagramRendererProps
>(function N8nDiagramRenderer(
  {
    graph,
    socketUrl = "",
    sseUrl = "",
    enableRealtime = true,
    onTraceReceived,
    onGraphReceived,
    onSSEEventReceived,
    onSSEStatusChange,
    className = "w-full h-full",
  },
  ref
) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [edgeVisuals, setEdgeVisuals] = useState<EdgeRunVisual[]>([]);
  const [traceMotionEnabled, setTraceMotionEnabled] = useState(true);
  const [selectedSubdiagram, setSelectedSubdiagram] = useState<MermaidSubdiagram | null>(null);
  const graphNodesRef = useRef<Node[]>([]);
  const graphEdgesRef = useRef<Edge[]>([]);
  const fitGraphViewRef = useRef<((options?: { padding?: number; duration?: number }) => Promise<boolean>) | null>(null);
  const runsRef = useRef<Map<string, TraceRun>>(new Map());
  const anonymousRunCounterRef = useRef(0);
  const seenTraceEventsRef = useRef<Map<string, number>>(new Map());
  const socketRef = useRef<Socket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.type !== "n8nNode") return;
    const subdiagram = getNodeMermaid(node.data as FlowNodeData, node.id);
    if (subdiagram) setSelectedSubdiagram(subdiagram);
  }, []);

  useEffect(() => {
    if (!selectedSubdiagram) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedSubdiagram(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedSubdiagram]);

  // Lưu callbacks trong ref để EventSource effect không bị re-run khi props thay đổi
  const onTraceReceivedRef = useRef(onTraceReceived);
  const onGraphReceivedRef = useRef(onGraphReceived);
  const onSSEEventReceivedRef = useRef(onSSEEventReceived);
  const onSSEStatusChangeRef = useRef(onSSEStatusChange);

  useEffect(() => {
    onTraceReceivedRef.current = onTraceReceived;
  }, [onTraceReceived]);

  useEffect(() => {
    onGraphReceivedRef.current = onGraphReceived;
  }, [onGraphReceived]);

  useEffect(() => {
    onSSEEventReceivedRef.current = onSSEEventReceived;
  }, [onSSEEventReceived]);

  useEffect(() => {
    onSSEStatusChangeRef.current = onSSEStatusChange;
  }, [onSSEStatusChange]);

  const stopRunTimers = useCallback((run: TraceRun) => {
    run.timers.forEach(clearTimeout);
    run.timers.clear();
    run.nodeFallbackTimers.clear();
  }, []);

  const clearRuns = useCallback((resetVisuals = true) => {
    runsRef.current.forEach(stopRunTimers);
    runsRef.current.clear();
    if (resetVisuals) {
      setEdgeVisuals([]);
      setNodes((current) => current.map((node) =>
        node.type === "stickyNote" ? node : { ...node, data: { ...node.data, liveStatus: "idle" } },
      ));
    }
  }, [setNodes, stopRunTimers]);

  const scheduleRunTimer = useCallback((run: TraceRun, delay: number, callback: () => void) => {
    const timer = setTimeout(() => {
      run.timers.delete(timer);
      if (runsRef.current.get(run.key) === run) callback();
    }, delay);
    run.timers.add(timer);
    return timer;
  }, []);

  const publishEdgeVisuals = useCallback(() => {
    const visibleRuns = [...runsRef.current.values()]
      .filter((run) => run.edgeAnimationActive && run.activeEdgeIds.length > 0)
      .slice(-MAX_ACTIVE_TRACE_PARTICLES);
    const laneCounts = new Map<string, number>();
    setEdgeVisuals(visibleRuns.flatMap((run) =>
      run.activeEdgeIds.map((edgeId) => ({
        edgeId,
        requestKey: run.key,
        status: run.status,
        version: run.edgeVersions.get(edgeId) ?? 0,
        startedAt: run.activeEdgeStartedAt ?? performance.now(),
        durationMs: EDGE_TRAVEL_MS,
        motionActive: run.activeEdgeStartedAt !== null,
        laneOffset: (() => {
          const lane = laneCounts.get(edgeId) ?? 0;
          laneCounts.set(edgeId, lane + 1);
          return lane === 0 ? 0 : Math.ceil(lane / 2) * 3 * (lane % 2 === 1 ? 1 : -1);
        })(),
      })),
    ));
  }, []);

  const publishNodeStatuses = useCallback((flashedIds: string[] = []) => {
    const statuses = new Map<string, LiveNodeStatus>();
    const priority: Record<LiveNodeStatus, number> = { idle: 0, success: 1, slow: 2, error: 3, running: 4 };
    runsRef.current.forEach((run) => run.nodeStates.forEach((status, id) => {
      if (priority[status] > priority[statuses.get(id) ?? "idle"]) statuses.set(id, status);
    }));
    const flashed = new Set(flashedIds);
    setNodes((current) => current.map((node) => {
      if (node.type === "stickyNote") return node;
      const oldData = node.data as FlowNodeData;
      const liveStatus = statuses.get(node.id) ?? "idle";
      if (oldData.liveStatus === liveStatus && !flashed.has(node.id)) return node;
      return { ...node, data: {
        ...oldData,
        liveStatus,
        signalVersion: (oldData.signalVersion ?? 0) + (flashed.has(node.id) ? 1 : 0),
      } };
    }));
  }, [setNodes]);

  const activateNode = useCallback((run: TraceRun, nodeId: string, recordStep = true) => {
    if (!nodeId) return;
    if (recordStep) run.visitedNodeIds.push(nodeId);
    if (!run.activatedNodeIds.includes(nodeId)) run.activatedNodeIds.push(nodeId);
    run.nodeStates.set(nodeId, "running");
    const oldFallback = run.nodeFallbackTimers.get(nodeId);
    if (oldFallback) {
      clearTimeout(oldFallback);
      run.timers.delete(oldFallback);
    }
    publishNodeStatuses([nodeId]);
    const fallback = scheduleRunTimer(run, NODE_FALLBACK_MS, () => {
      run.nodeFallbackTimers.delete(nodeId);
      if (run.nodeStates.get(nodeId) === "running") {
        run.nodeStates.delete(nodeId);
        publishNodeStatuses();
      }
    });
    run.nodeFallbackTimers.set(nodeId, fallback);
  }, [publishNodeStatuses, scheduleRunTimer]);

  const activateEdge = useCallback((run: TraceRun, edgeId: string) => {
    run.activeEdgeIds = [edgeId];
    run.activeEdgeStartedAt = performance.now();
    run.edgeVersions.set(edgeId, (run.edgeVersions.get(edgeId) ?? 0) + 1);
    publishEdgeVisuals();
  }, [publishEdgeVisuals]);

  const animateTrace = useCallback((trace: N8nTracePayload) => {
    const dedupeKey = trace.request_id && trace.phase
      ? `request:${trace.request_id}:${trace.phase}`
      : trace.event_id
        ? `event:${trace.event_id}:${trace.phase ?? "event"}`
        : null;

    if (dedupeKey) {
      const now = Date.now();
      const seen = seenTraceEventsRef.current;
      for (const [eventId, receivedAt] of seen) {
        if (now - receivedAt > TRACE_EVENT_DEDUPE_MS) seen.delete(eventId);
      }
      if (seen.has(dedupeKey)) return;
      seen.set(dedupeKey, now);
      while (seen.size > MAX_SEEN_TRACE_EVENTS) {
        const oldestEventId = seen.keys().next().value;
        if (oldestEventId === undefined) break;
        seen.delete(oldestEventId);
      }
    }

    const nameToId = new Map<string, string>();
    graphNodesRef.current.forEach((n) => {
      const data = n.data as FlowNodeData;
      if (data?.name) {
        nameToId.set(data.name, n.id);
        nameToId.set(data.name.toLowerCase(), n.id);
      }
      nameToId.set(n.id, n.id);
      nameToId.set(n.id.toLowerCase(), n.id);
    });
    const resolveId = (key: string) => nameToId.get(key) || nameToId.get(key.toLowerCase()) || key;

    const stageEdges = getTraceStageEdges(trace);
    const rawNodeIds = Array.isArray(trace.stage_node_ids) && trace.stage_node_ids.length > 0
      ? trace.stage_node_ids.filter((id): id is string => typeof id === "string")
      : stageEdges.flatMap((edge, index) => index === 0 ? [edge.source, edge.target] : [edge.target]);
    const nodeIds = rawNodeIds.map(resolveId);

    const edgeSlots = stageEdges.map(({ source, target }) => {
      const sId = resolveId(source);
      const tId = resolveId(target);
      const edge = graphEdgesRef.current.find(
        (candidate) =>
          (candidate.source === sId && candidate.target === tId) ||
          (candidate.source === source && candidate.target === target)
      );
      return edge?.id ?? null;
    });

    const key = trace.request_id && trace.phase
      ? `request:${trace.request_id}`
      : `single:${++anonymousRunCounterRef.current}`;
    const prior = runsRef.current.get(key);
    const result: LiveNodeStatus = trace.status === "error" || (trace.status_code ?? 0) >= 400
      ? "error" : trace.status === "slow" ? "slow" : "success";

    // A completion may arrive before its start. In that case play its full path once.
    if (prior) stopRunTimers(prior);
    const run: TraceRun = prior ?? {
      key, status: "running", edgeAnimationActive: true, activeEdgeStartedAt: null,
      visitedEdgeSlots: [], visitedNodeIds: [],
      activeEdgeIds: [], activatedNodeIds: [],
      edgeVersions: new Map(), nodeStates: new Map(), timers: new Set(), nodeFallbackTimers: new Map(),
    };
    runsRef.current.delete(key);
    runsRef.current.set(key, run);
    // Edge playback has its own lifecycle; a final node result must not hide it.
    run.edgeAnimationActive = true;
    const isTerminalTrace = trace.phase === "complete" || !trace.phase;
    run.status = isTerminalTrace ? result : "running";

    // On completion, retain only the executed prefix; never light a speculative branch.
    const edgePrefix = matchingPrefixLength(edgeSlots, run.visitedEdgeSlots);
    const nodePrefix = matchingPrefixLength(nodeIds, run.visitedNodeIds);
    const previousActiveEdgeId = run.activeEdgeIds[run.activeEdgeIds.length - 1] ?? null;
    run.visitedEdgeSlots = run.visitedEdgeSlots.slice(0, edgePrefix);
    run.visitedNodeIds = run.visitedNodeIds.slice(0, nodePrefix);
    const lastVisitedEdgeId = run.visitedEdgeSlots[run.visitedEdgeSlots.length - 1] ?? null;
    run.activeEdgeIds = lastVisitedEdgeId ? [lastVisitedEdgeId] : [];
    if (lastVisitedEdgeId !== previousActiveEdgeId) {
      run.activeEdgeStartedAt = lastVisitedEdgeId ? performance.now() : null;
    }
    run.activatedNodeIds = [...new Set(run.visitedNodeIds)];
    run.nodeStates.forEach((_status, id) => {
      if (!run.activatedNodeIds.includes(id)) run.nodeStates.delete(id);
    });
    publishEdgeVisuals();
    publishNodeStatuses();
    // Re-arm the per-node fallback after replacing this request's timers.
    run.nodeStates.forEach((status, id) => {
      if (status !== "running") return;
      const fallback = scheduleRunTimer(run, NODE_FALLBACK_MS, () => {
        run.nodeFallbackTimers.delete(id);
        if (run.nodeStates.get(id) === "running") {
          run.nodeStates.delete(id);
          publishNodeStatuses();
        }
      });
      run.nodeFallbackTimers.set(id, fallback);
    });

    const steps = Math.max(nodeIds.length, edgeSlots.length);
    const firstStep = Math.min(nodePrefix, edgePrefix, steps);
    const activeEdgeRemainingMs = run.activeEdgeIds.length > 0 && run.activeEdgeStartedAt !== null
      ? Math.max(0, EDGE_TRAVEL_MS - (performance.now() - run.activeEdgeStartedAt))
      : 0;
    let stepDelay = firstStep === 0 ? 0 : activeEdgeRemainingMs;
    let finishDelay = stepDelay;
    for (let index = firstStep; index < steps; index += 1) {
      const delay = stepDelay;
      scheduleRunTimer(run, delay, () => {
        if (index < nodeIds.length && index >= nodePrefix) activateNode(run, nodeIds[index]);
        if (index < edgeSlots.length && index >= edgePrefix) {
          const edgeId = edgeSlots[index];
          run.visitedEdgeSlots.push(edgeId);
          if (edgeId !== null) {
            activateEdge(run, edgeId);
          } else {
            run.activeEdgeIds = [];
            run.activeEdgeStartedAt = null;
            publishEdgeVisuals();
          }
        }
      });

      if (index >= edgePrefix && index < edgeSlots.length && edgeSlots[index] !== null) {
        stepDelay += EDGE_TRAVEL_MS;
      }
      finishDelay = stepDelay;
    }

    if (!isTerminalTrace) {
      if (firstStep === steps && nodeIds.length > 0) activateNode(run, nodeIds[nodeIds.length - 1], false);
      scheduleRunTimer(run, Math.max(TRACE_RUN_STALE_MS, finishDelay + NODE_FALLBACK_MS), () => {
        stopRunTimers(run);
        runsRef.current.delete(key);
        publishEdgeVisuals();
        publishNodeStatuses();
      });
      return;
    }

    scheduleRunTimer(run, Math.max(100, finishDelay), () => {
      run.nodeFallbackTimers.forEach((timer) => { clearTimeout(timer); run.timers.delete(timer); });
      run.nodeFallbackTimers.clear();
      run.status = result;
      run.activatedNodeIds.forEach((id) => run.nodeStates.set(id, result));
      publishEdgeVisuals();
      publishNodeStatuses(run.activatedNodeIds);
      scheduleRunTimer(run, RESULT_HOLD_MS, () => {
        run.edgeAnimationActive = false;
        runsRef.current.delete(key);
        publishEdgeVisuals();
        publishNodeStatuses();
      });
    });
  }, [activateEdge, activateNode, publishEdgeVisuals, publishNodeStatuses, scheduleRunTimer, stopRunTimers]);

  const animateTraceRef = useRef(animateTrace);
  useEffect(() => {
    animateTraceRef.current = animateTrace;
  }, [animateTrace]);

  // Expose các phương thức điều khiển cho parent
  // Ánh xạ stage name / node name tới nodeId
  const resolveTargetNodeId = useCallback((payload: SSEStagePayload): string | null => {
    if (payload.target_node_id && typeof payload.target_node_id === "string") return payload.target_node_id;
    if (payload.node_id && typeof payload.node_id === "string") return payload.node_id;

    const stageOrName = (payload.node_name || payload.stage || payload.service_id || "").toLowerCase();
    if (!stageOrName) return null;

    // Tìm trong nodes hiện có
    const matched = nodes.find((n) => {
      const d = n.data as FlowNodeData;
      const nName = (d.name || "").toLowerCase();
      const nId = n.id.toLowerCase();
      return nId === stageOrName || nName === stageOrName || nName.includes(stageOrName);
    });

    return matched?.id ?? null;
  }, [nodes]);

  // Kích hoạt trạng thái node từ sự kiện SSE stage
  const handleStageEvent = useCallback((eventName: string, payload: SSEStagePayload) => {
    // 1. Nếu payload chứa chuỗi pipeline stage_node_ids hoặc stage_edges (từ Laravel trace hoặc backend)
    const hasPipeline =
      (Array.isArray(payload.stage_node_ids) && payload.stage_node_ids.length > 0) ||
      (Array.isArray(payload.stage_edges) && payload.stage_edges.length > 0);

    if (hasPipeline) {
      const isStart = eventName === "stage.started" || payload.phase === "start";
      const isFailed = eventName === "stage.failed" || payload.status === "error";
      const duration = payload.duration_ms || 0;
      const resultStatus: LiveNodeStatus = isFailed ? "error" : duration > 1500 ? "slow" : "success";

      animateTrace({
        event: eventName,
        status: isStart ? "running" : resultStatus,
        phase: isStart ? "start" : "complete",
        request_id: payload.request_id || payload.trace_id,
        duration_ms: duration,
        stage_node_ids: payload.stage_node_ids,
        stage_edges: payload.stage_edges,
        timestamp: payload.timestamp || new Date().toISOString(),
      });
      return;
    }

    // 2. Nếu là sự kiện từng node đơn lẻ
    const targetNodeId = resolveTargetNodeId(payload);
    const key = payload.request_id || payload.trace_id
      ? `request:${payload.request_id || payload.trace_id}`
      : `stage:${eventName}:${++anonymousRunCounterRef.current}`;

    let prior = runsRef.current.get(key);
    if (!prior) {
      prior = {
        key,
        status: "running",
        edgeAnimationActive: false,
        activeEdgeStartedAt: null,
        visitedEdgeSlots: [],
        visitedNodeIds: [],
        activeEdgeIds: [],
        activatedNodeIds: [],
        edgeVersions: new Map(),
        nodeStates: new Map(),
        timers: new Set(),
        nodeFallbackTimers: new Map(),
      };
      runsRef.current.set(key, prior);
    }

    if (eventName === "stage.started" || payload.phase === "start") {
      if (targetNodeId) {
        activateNode(prior, targetNodeId, true);
      }
    } else if (eventName === "stage.completed" || payload.phase === "complete") {
      const duration = payload.duration_ms || 0;
      const result: LiveNodeStatus = duration > 1500 ? "slow" : "success";
      if (targetNodeId) {
        prior.nodeStates.set(targetNodeId, result);
        publishNodeStatuses([targetNodeId]);
        scheduleRunTimer(prior, RESULT_HOLD_MS, () => {
          prior?.nodeStates.delete(targetNodeId);
          publishNodeStatuses();
        });
      }
    } else if (eventName === "stage.failed" || payload.status === "error") {
      if (targetNodeId) {
        prior.nodeStates.set(targetNodeId, "error");
        publishNodeStatuses([targetNodeId]);
        scheduleRunTimer(prior, RESULT_HOLD_MS, () => {
          prior?.nodeStates.delete(targetNodeId);
          publishNodeStatuses();
        });
      }
    }
  }, [activateNode, animateTrace, anonymousRunCounterRef, publishNodeStatuses, resolveTargetNodeId, scheduleRunTimer]);

  // Expose các phương thức điều khiển cho parent
  useImperativeHandle(
    ref,
    () => ({
      triggerTraceAnimation: (trace: N8nTracePayload) => {
        animateTrace(trace);
      },
      triggerStageEvent: (eventName: string, payload: SSEStagePayload) => {
        handleStageEvent(eventName, payload);
      },
      resetAllNodes: () => {
        clearRuns();
      },
    }),
    [animateTrace, clearRuns, handleStageEvent]
  );

  // Khi graph data thay đổi (API trả về hoặc realtime workflow.graph.updated), cập nhật nodes & edges
  useEffect(() => {
    if (!graph) return;
    const { allNodes, flowEdges } = convertNormalizedGraphToFlow(graph);
    runsRef.current.forEach(stopRunTimers);
    runsRef.current.clear();
    // React Flow keeps its own nodes/edges state; a new graph invalidates every active path.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEdgeVisuals([]);
    graphNodesRef.current = allNodes;
    graphEdgesRef.current = flowEdges;
    setNodes(allNodes);
    setEdges(flowEdges);
    const fitFrame = window.requestAnimationFrame(() => {
      void fitGraphViewRef.current?.({ padding: 0.15, duration: 250 });
    });
    return () => window.cancelAnimationFrame(fitFrame);
  }, [graph, setNodes, setEdges, stopRunTimers]);

  useEffect(() => () => clearRuns(false), [clearRuns]);

  const renderedEdges = useMemo(() => edges.map((edge) => ({
    ...edge,
    data: {
      ...edge.data,
      activities: edgeVisuals.filter((activity) => activity.edgeId === edge.id),
      traceMotionEnabled,
    } satisfies TraceEdgeData,
  })), [edges, edgeVisuals, traceMotionEnabled]);

  // Kết nối realtime qua Socket.IO tới Node backend của dịch vụ Laravel workflow.
  useEffect(() => {
    if (!enableRealtime || !socketUrl) return;
    onSSEStatusChangeRef.current?.("connecting");

    const socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      upgrade: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    socketRef.current = socket;

    const onConnect = () => onSSEStatusChangeRef.current?.("connected");
    const onDisconnect = (reason: string) => onSSEStatusChangeRef.current?.(
      reason === "io client disconnect" ? "disconnected" : "reconnecting",
    );
    const onConnectError = (error: Error) => {
      console.warn("[laravel-workflow-socket] connect_error:", error.message);
      onSSEStatusChangeRef.current?.("reconnecting");
    };
    const onReconnectAttempt = () => onSSEStatusChangeRef.current?.("reconnecting");
    const onReconnect = () => onSSEStatusChangeRef.current?.("connected");
    const onReconnectFailed = () => onSSEStatusChangeRef.current?.("disconnected");
    const onTrace = (input: N8nTracePayload) => {
      if (!input) return;
      const trace = normalizeSocketTrace(input);
      onTraceReceivedRef.current?.(trace);
      animateTraceRef.current(trace);
      onSSEEventReceivedRef.current?.("n8n:trace", trace);
    };
    const onGraph = (payload: N8nGraphSocketPayload) => {
      if (!payload?.graph) return;
      onGraphReceivedRef.current?.(payload);
      onSSEEventReceivedRef.current?.("n8n:graph", payload);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.io.on("reconnect_attempt", onReconnectAttempt);
    socket.io.on("reconnect", onReconnect);
    socket.io.on("reconnect_failed", onReconnectFailed);
    socket.on("n8n:trace", onTrace);
    socket.on("n8n:graph", onGraph);
    socket.on("workflow_graph", onGraph);

    return () => {
      socket.off("n8n:graph", onGraph);
      socket.off("workflow_graph", onGraph);
      socket.off("n8n:trace", onTrace);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
      socket.io.off("reconnect", onReconnect);
      socket.io.off("reconnect_failed", onReconnectFailed);
      socket.disconnect();
      socketRef.current = null;
      onSSEStatusChangeRef.current?.("disconnected");
    };
  }, [enableRealtime, socketUrl]);

  useEffect(() => {
    if (!enableRealtime || !sseUrl) return;

    onSSEStatusChangeRef.current?.("connecting");

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(sseUrl, { withCredentials: false });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        onSSEStatusChangeRef.current?.("connected");
      };

      eventSource.onerror = () => {
        if (eventSource?.readyState === EventSource.CONNECTING) {
          onSSEStatusChangeRef.current?.("reconnecting");
        } else {
          onSSEStatusChangeRef.current?.("disconnected");
        }
      };

      // Đăng ký các SSE events theo yêu cầu
      const sseEventNames = [
        "connected",
        "stage.started",
        "stage.completed",
        "stage.failed",
        "laravel.trace",
        "laravel:trace",
        "workflow.graph.updated",
        "request.started",
        "request.completed",
      ];

      sseEventNames.forEach((name) => {
        eventSource?.addEventListener(name, (e: MessageEvent) => {
          let data: SSEStagePayload = {};
          try {
            data = JSON.parse(e.data);
          } catch {
            data = { raw: e.data };
          }

          if (name === "connected") {
            onSSEStatusChangeRef.current?.("connected");
          } else if (name === "workflow.graph.updated") {
            const graphPayload = (data.graph || data) as N8nNormalizedGraph;
            const wId = typeof data.workflow_id === "string" ? data.workflow_id : typeof data.id === "string" ? data.id : undefined;
            onGraphReceivedRef.current?.({
              event: "workflow.graph.updated",
              workflow_id: wId,
              graph: graphPayload,
              timestamp: data.timestamp || new Date().toISOString(),
            });
          } else if (name.startsWith("stage.") || name.startsWith("laravel")) {
            handleStageEvent(name, data);
          }

          onSSEEventReceivedRef.current?.(name, data);
        });
      });

      // Nhận event mặc định
      eventSource.onmessage = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          const type = data.type || "message";
          if (type.startsWith("stage.") || type.startsWith("laravel")) {
            handleStageEvent(type, data);
          } else if (type === "workflow.graph.updated") {
            const graphPayload = (data.graph || data) as N8nNormalizedGraph;
            const wId = typeof data.workflow_id === "string" ? data.workflow_id : typeof data.id === "string" ? data.id : undefined;
            onGraphReceivedRef.current?.({
              event: "workflow.graph.updated",
              workflow_id: wId,
              graph: graphPayload,
              timestamp: data.timestamp || new Date().toISOString(),
            });
          }
          onSSEEventReceivedRef.current?.(type, data);
        } catch {
          // ignore parsing error
        }
      };
    } catch (err) {
      console.warn("[n8n-sse] EventSource init error:", err);
      onSSEStatusChangeRef.current?.("disconnected");
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        eventSourceRef.current = null;
      }
      onSSEStatusChangeRef.current?.("disconnected");
    };
  }, [enableRealtime, handleStageEvent, sseUrl]);

  return (
    <div className={`relative ${className}`}>
      {/* CSS Animation Keyframes cho hiệu ứng viền phát sáng */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes n8n-node-pulse {
              0%, 100% {
                box-shadow: 0 0 14px rgba(34, 211, 238, 0.45);
                border-color: rgba(34, 211, 238, 0.85);
                transform: scale(1);
              }
              50% {
                box-shadow: 0 0 28px rgba(34, 211, 238, 0.95), 0 0 10px rgba(56, 189, 248, 0.7);
                border-color: #22d3ee;
                transform: scale(1.04);
              }
            }
            @keyframes n8n-node-result-flash {
              0% { box-shadow: 0 0 22px var(--signal-color); border-color: var(--signal-color); }
              100% { box-shadow: none; border-color: #334155; }
            }
            @keyframes n8n-node-ping-flash {
              0% { opacity: 0.9; transform: scale(1); }
              100% { opacity: 0; transform: scale(1.8); }
            }
            .n8n-node-signal-ping {
              animation: n8n-node-ping-flash 1s ease-out infinite;
            }
            .n8n-node--running {
              animation: n8n-node-pulse 0.8s ease-in-out infinite !important;
              box-shadow: 0 0 22px rgba(34, 211, 238, 0.85) !important;
              border-color: #22d3ee !important;
              z-index: 20 !important;
            }
            .n8n-node--success {
              --signal-color: rgba(34, 197, 94, 0.9);
              animation: n8n-node-result-flash 1000ms ease-out 1 both !important;
            }
            .n8n-node--slow {
              --signal-color: rgba(234, 179, 8, 0.9);
              animation: n8n-node-result-flash 1000ms ease-out 1 both !important;
            }
            .n8n-node--error {
              --signal-color: rgba(239, 68, 68, 0.9);
              animation: n8n-node-result-flash 1000ms ease-out 1 both !important;
            }
            @media (prefers-reduced-motion: reduce) {
              .n8n-node-signal-ping,
              .n8n-node--running,
              .n8n-node--success,
              .n8n-node--slow,
              .n8n-node--error {
                animation: none !important;
              }
            }
          `,
        }}
      />

      <button
        type="button"
        onClick={() => setTraceMotionEnabled((enabled) => !enabled)}
        aria-pressed={traceMotionEnabled}
        aria-label={traceMotionEnabled ? "Tắt chuyển động chấm trace" : "Bật chuyển động chấm trace"}
        title={traceMotionEnabled ? "Tắt chuyển động chấm trace" : "Bật chuyển động chấm trace"}
        className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs font-medium text-slate-200 shadow-lg transition hover:border-cyan-500 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        {traceMotionEnabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        Chấm trace: {traceMotionEnabled ? "Đang chạy" : "Tạm dừng"}
      </button>

      <ReactFlow
        nodes={nodes}
        edges={renderedEdges}
        minZoom={0.25}
        maxZoom={3}
        onNodeClick={handleNodeClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={N8N_NODE_TYPES}
        edgeTypes={N8N_EDGE_TYPES}
        defaultEdgeOptions={{
          type: "traceEdge",
          animated: false,
        }}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        onInit={(instance) => {
          fitGraphViewRef.current = instance.fitView;
          window.requestAnimationFrame(() => {
            void instance.fitView({ padding: 0.15, duration: 250 });
          });
        }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        colorMode="dark"
        className="bg-slate-950"
      >
        {/* Background dạng dots chuẩn n8n Editor */}
        <Background variant={BackgroundVariant.Dots} color="#334155" gap={20} size={1.5} />
        <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-200 !text-slate-200 [&>button]:!border-slate-800 [&>button]:!bg-slate-900 [&>button:hover]:!bg-slate-800" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === "stickyNote") {
              const c = (n.data as unknown as StickyNoteData)?.color;
              if (c === 4) return "rgba(16, 185, 129, 0.3)";
              if (c === 5) return "rgba(59, 130, 246, 0.3)";
              if (c === 6) return "rgba(168, 85, 247, 0.3)";
              return "rgba(100, 116, 139, 0.3)";
            }
            const live = (n.data as unknown as FlowNodeData)?.liveStatus;
            if (live === "running") return "#22d3ee";
            if (live === "success") return "#22c55e";
            if (live === "slow") return "#eab308";
            if (live === "error") return "#ef4444";
            return "#3b82f6";
          }}
          maskColor="rgba(15, 23, 42, 0.75)"
          className="!bg-slate-900 !border-slate-800 rounded-lg overflow-hidden"
        />
      </ReactFlow>

      {selectedSubdiagram && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedSubdiagram(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="workflow-subdiagram-title"
            className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-700 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <h2 id="workflow-subdiagram-title" className="truncate text-base font-semibold text-slate-100 sm:text-lg">
                  {selectedSubdiagram.nodeName}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Sơ đồ Mermaid{selectedSubdiagram.source ? ` · ${selectedSubdiagram.source}` : ""}
                </p>
                {selectedSubdiagram.children.length > 0 && (
                  <p className="mt-1 break-words text-xs text-violet-300">
                    Tài liệu liên quan: {selectedSubdiagram.children.join(", ")}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubdiagram(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                aria-label="Đóng sơ đồ con"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <MermaidDiagram definition={selectedSubdiagram.definition} />
          </section>
        </div>
      )}
    </div>
  );
});

export default N8nDiagramRenderer;
