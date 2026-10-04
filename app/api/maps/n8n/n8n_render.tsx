"use client";

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import {
  ReactFlow,
  BaseEdge,
  getBezierPath,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type EdgeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Clock, Radio } from "lucide-react";

import {
  mapServiceIdToNodeId,
  mapStageToNodeId,
  getSseProxyUrl,
  STANDARD_CHAT_NODE_ID,
  NODE_BACKEND_ARCHITECTURE_NODE_IDS,
} from "./process";
import {
  N8N_NODE_TYPES,
  describeWorkflowNode,
  type FlowNodeData,
  type LiveNodeStatus,
  type StickyNoteData,
} from "./n8n_nodes";

// ==========================================
// 1. DATA CONTRACTS
// ==========================================

export type PositionInput = [number, number] | { x: number; y: number };

export interface N8nFlowNode {
  id: string;
  name: string;
  type: string;
  typeVersion?: number;
  position: PositionInput;
  disabled?: boolean;
  parameters?: Record<string, unknown>;
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
  sourceHandle?: string;
  targetHandle?: string;
  connectionType?: string;
  style?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface N8nNormalizedGraph {
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
  edges?: N8nEdge[];
  meta?: {
    nodeCount?: number;
    stickyNoteCount?: number;
    totalNodeCount?: number;
    edgeCount?: number;
  };
}

export interface NodeActivitySSEPayload {
  id?: string;
  type?: string;
  timestamp?: string;
  request_id?: string;
  trace_id?: string;
  correlation_id?: string;
  service_id?: string;
  workflow_id?: string;
  execution_id?: string;
  node_id?: string;
  source_node_id?: string;
  target_node_id?: string;
  node_name?: string;
  method?: string;
  route?: string;
  status_code?: number;
  duration_ms?: number;
  stage?: string;
  outcome?: string;
  message?: string;
  [key: string]: unknown;
}

// ==========================================
// 2. HELPER UTILS
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


type RealtimeSignalEdgeData = {
  signalActive?: boolean;
  signalVersion?: number;
  signalDurationMs?: number;
};

type RealtimeProgressStep = {
  nodeId: string;
  label: string;
  startedAt: number;
  durationMs?: number;
  terminal: boolean;
  terminalStatus: LiveNodeStatus;
  terminalLabel?: string;
  sourceNodeId?: string;
  arrivedAt?: number;
  requestStart?: boolean;
};

type RealtimeProgressRun = {
  displayMode: SignalDisplayMode;
  active: RealtimeProgressStep | null;
  queue: RealtimeProgressStep[];
  deferredServices: RealtimeProgressStep[];
  transitStep: RealtimeProgressStep | null;
  apiObserved: boolean;
  inTransit: boolean;
  requestFinished?: boolean;
};

const SIGNAL_TRAVEL_MS = 700;
const REALTIME_SIGNAL_TRAVEL_MS = 160;
const REALTIME_NODE_MIN_LIGHT_MS = 80;
const SLOW_SIGNAL_TRAVEL_MS = 5000;
const SLOW_NODE_FLASH_MS = 650;
type SignalDisplayMode = "realtime" | "slow";

function RealtimeSignalEdge(props: EdgeProps) {
  const [path] = getBezierPath(props);
  const data = (props.data || {}) as RealtimeSignalEdgeData;
  const version = data.signalVersion ?? 0;
  const duration = data.signalDurationMs ?? SIGNAL_TRAVEL_MS;

  return (
    <g
      data-realtime-edge-id={props.id}
      data-signal-active={data.signalActive ? "true" : "false"}
      data-signal-source={props.source}
      data-signal-target={props.target}
    >
      <BaseEdge id={props.id} path={path} style={props.style} markerEnd={props.markerEnd} />
      {data.signalActive && (
        <circle
          key={version}
          r="4"
          fill="#a5f3fc"
          filter="drop-shadow(0 0 5px #22d3ee)"
        >
          <animateMotion path={path} dur={`${duration}ms`} begin="0s" fill="freeze" />
        </circle>
      )}
    </g>
  );
}

const N8N_EDGE_TYPES = { realtimeSignal: RealtimeSignalEdge };

const CHAT_NODE_ID = STANDARD_CHAT_NODE_ID;
const OPENCLAW_API_NODE_ID = "2f47be3b-91d7-4d22-9ac2-6c68ef1d20e0";
const OPENCLAW_FORMAT_NODE_ID = "2f47be3b-91d7-4d22-9ac2-6c68ef1d20e1";
const BACKEND_NODE_ID_ALIASES: Record<string, string> = {
  [NODE_BACKEND_ARCHITECTURE_NODE_IDS.formatResponse]: OPENCLAW_FORMAT_NODE_ID,
  [NODE_BACKEND_ARCHITECTURE_NODE_IDS.formatDecision]: "b18073a2-c1a5-4ef4-a803-8e03ad67b3d1",
  [NODE_BACKEND_ARCHITECTURE_NODE_IDS.formatSuccess]: "a8b336c8-0af9-4e0e-a87e-2421c8aa0001",
  [NODE_BACKEND_ARCHITECTURE_NODE_IDS.returnResponse]: "a8b336c8-0af9-4e0e-a87e-2421c8aa0002",
  [NODE_BACKEND_ARCHITECTURE_NODE_IDS.formatFailure]: "a8b336c8-0af9-4e0e-a87e-2421c8aa0003",
  [NODE_BACKEND_ARCHITECTURE_NODE_IDS.formatStop]: "a8b336c8-0af9-4e0e-a87e-2421c8aa0004",
};
const SAFE_OUTCOMES = new Set([
  "success", "completed", "ok", "failed", "error", "timeout", "cancelled", "aborted", "skipped",
]);

function getSafeOutcomeLabel(value: unknown, fallback: "completed" | "failed") {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  return SAFE_OUTCOMES.has(normalized) ? normalized : fallback;
}

// ==========================================
// 4. CONVERT GRAPH TO FLOW
// ==========================================

export const convertNormalizedGraphToFlow = (
  inputGraph: N8nNormalizedGraph | { graph?: N8nNormalizedGraph; [key: string]: unknown }
) => {
  const graph: any =
    inputGraph && typeof inputGraph === "object" && "graph" in inputGraph && inputGraph.graph
      ? inputGraph.graph
      : inputGraph;

  if (!graph) return { allNodes: [], flowEdges: [] };

  // 1. Tách flowNodes và stickyNotes
  const allRawNodes: any[] = graph.nodes || graph.flowNodes || [];

  const isSticky = (n: any) =>
    Boolean(
      n.isStickyNote ||
      n.type === "n8n-nodes-base.stickyNote" ||
      n.type === "stickyNote"
    );

  const rawFlowNodes = allRawNodes.filter((n) => !isSticky(n));

  const stickyFromList = (graph.stickyNotes || []).map((s: any) => ({ ...s, isStickyNote: true }));
  const stickyFromNodes = allRawNodes.filter(isSticky).map((s: any) => ({ ...s, isStickyNote: true }));

  const stickyMap = new Map<string, any>();
  [...stickyFromList, ...stickyFromNodes].forEach((s) => {
    if (s.id && !stickyMap.has(s.id)) {
      stickyMap.set(s.id, s);
    }
  });
  const rawStickyNotes = Array.from(stickyMap.values());

  const flowNodes: Node[] = rawFlowNodes.map((node) => ({
    id: node.id,
    position: normalizePosition(node.position),
    type: "n8nNode",
    data: {
      name: node.name,
      nodeType: node.type,
      typeVersion: node.typeVersion,
      parameters:
        node.parameters && typeof node.parameters === "object"
          ? node.parameters as Record<string, unknown>
          : undefined,
      disabled: Boolean(node.disabled),
      liveStatus: "idle",
      subLabel: "",
      description:
        typeof node.description === "string" && node.description.trim()
          ? node.description.trim()
          : describeWorkflowNode(node.name || "", node.type || ""),
    },
  }));

  const stickyNotes: Node[] = rawStickyNotes.map((note) => ({
    id: note.id,
    type: "stickyNote",
    position: normalizePosition(note.position),
    data: {
      content: note.content || note.name || "",
      color: note.color !== undefined ? note.color : 7,
      width: note.width || 320,
      height: note.height || 220,
    },
    draggable: false,
    selectable: false,
    connectable: false,
    zIndex: -1,
  }));

  // 2. Parse Edges: hỗ trợ cả edges mảng và connections n8n chuẩn
  let flowEdges: Edge[] = [];
  if (Array.isArray(graph.edges) && graph.edges.length > 0) {
    flowEdges = graph.edges.map((edge: any) => ({
      id: edge.id || `e-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || "main-0",
      targetHandle: edge.targetHandle || "main-0",
      type: "realtimeSignal",
      animated: false,
      style: edge.style || { stroke: "#64748b", strokeWidth: 2 },
    }));
  } else if (graph.connections && typeof graph.connections === "object") {
    const nameToId = new Map<string, string>();
    allRawNodes.forEach((n: any) => {
      if (n.name && n.id) nameToId.set(n.name, n.id);
      if (n.id) nameToId.set(n.id, n.id);
    });

    Object.entries(graph.connections).forEach(([sourceName, outputs]: [string, any]) => {
      const sourceId = nameToId.get(sourceName) || sourceName;
      if (!outputs || typeof outputs !== "object") return;

      Object.entries(outputs).forEach(([connType, outputIndexGroups]: [string, any]) => {
        if (!Array.isArray(outputIndexGroups)) return;
        outputIndexGroups.forEach((connList: any[], outputIndex: number) => {
          if (!Array.isArray(connList)) return;
          connList.forEach((conn: any) => {
            const targetName = conn.node;
            const targetId = nameToId.get(targetName) || targetName;
            const targetIndex = conn.index || 0;
            flowEdges.push({
              id: `e-${sourceId}-${outputIndex}-${targetId}-${targetIndex}`,
              source: sourceId,
              target: targetId,
              sourceHandle: `${connType}-${outputIndex}`,
              targetHandle: `main-${targetIndex}`,
              type: "realtimeSignal",
              animated: false,
              style: { stroke: "#64748b", strokeWidth: 2 },
            });
          });
        });
      });
    });
  }

  const handlesByNode = new Map<string, { sources: Set<string>; targets: Set<string> }>();
  const getHandlesForNode = (nodeId: string) => {
    let handles = handlesByNode.get(nodeId);
    if (!handles) {
      handles = { sources: new Set<string>(), targets: new Set<string>() };
      handlesByNode.set(nodeId, handles);
    }
    return handles;
  };

  flowEdges.forEach((edge) => {
    if (edge.source) {
      getHandlesForNode(edge.source).sources.add(edge.sourceHandle || "main-0");
    }
    if (edge.target) {
      getHandlesForNode(edge.target).targets.add(edge.targetHandle || "main-0");
    }
  });

  const sortHandleIds = (handleIds: Set<string>) =>
    Array.from(handleIds).sort((left, right) => {
      const leftIndex = Number(left.match(/-(\d+)$/)?.[1]);
      const rightIndex = Number(right.match(/-(\d+)$/)?.[1]);
      if (Number.isFinite(leftIndex) && Number.isFinite(rightIndex)) {
        return leftIndex - rightIndex;
      }
      return left.localeCompare(right);
    });

  const flowNodesWithHandles = flowNodes.map((node) => {
    const handles = handlesByNode.get(node.id);
    return {
      ...node,
      data: {
        ...node.data,
        sourceHandleIds: handles?.sources.size
          ? sortHandleIds(handles.sources)
          : ["main-0"],
        targetHandleIds: handles?.targets.size
          ? sortHandleIds(handles.targets)
          : ["main-0"],
      },
    };
  });

  return {
    allNodes: [...stickyNotes, ...flowNodesWithHandles],
    flowEdges,
  };
};

// ==========================================
// 5. N8N SSE RENDERER COMPONENT
// ==========================================

export type ConnectionStatus =
  | "connecting"
  | "waiting_backend"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "unavailable";

export interface N8nDiagramRendererProps {
  graph?: N8nNormalizedGraph | { graph?: N8nNormalizedGraph } | null;
  sseUrl?: string;
  enableRealtime?: boolean;
  onEventReceived?: (eventName: string, payload: NodeActivitySSEPayload) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
  onReplayGap?: (payload: NodeActivitySSEPayload) => void;
  className?: string;
}

export interface N8nDiagramRendererRef {
  triggerSSEEvent: (eventName: string, payload: NodeActivitySSEPayload) => void;
  resetAllNodes: () => void;
  reconnect: () => void;
}

export const N8nDiagramRenderer = forwardRef<
  N8nDiagramRendererRef,
  N8nDiagramRendererProps
>(function N8nDiagramRenderer(
  {
    graph,
    sseUrl,
    enableRealtime = true,
    onEventReceived,
    onConnectionStatusChange,
    onReplayGap,
    className = "w-full h-full",
  },
  ref
) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reconnectNonce, setReconnectNonce] = useState(0);
  const [signalDisplayMode, setSignalDisplayMode] = useState<SignalDisplayMode>("realtime");

  const nodeTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const signalTimersRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const progressRunsRef = useRef<Map<string, RealtimeProgressRun>>(new Map());
  const signalDisplayModeRef = useRef<SignalDisplayMode>("realtime");
  const edgesRef = useRef<Edge[]>([]);
  const graphNodeNamesRef = useRef<Map<string, string>>(new Map());
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const eventSourceRef = useRef<EventSource | null>(null);
  const traceCorrelationRef = useRef<Map<string, string>>(new Map());
  const correlationTraceRef = useRef<Map<string, string>>(new Map());
  const eventGroupsRef = useRef<Map<string, {
    traceIds: Set<string>;
    serviceIds: Set<string>;
    latestEvent: string;
    updatedAt: number;
  }>>(new Map());
  const reactFlowInstanceRef = useRef<ReactFlowInstance<Node, Edge> | null>(null);

  const onEventReceivedRef = useRef(onEventReceived);
  const onConnectionStatusChangeRef = useRef(onConnectionStatusChange);
  const onReplayGapRef = useRef(onReplayGap);

  useEffect(() => {
    onEventReceivedRef.current = onEventReceived;
  }, [onEventReceived]);

  useEffect(() => {
    onConnectionStatusChangeRef.current = onConnectionStatusChange;
  }, [onConnectionStatusChange]);

  useEffect(() => {
    onReplayGapRef.current = onReplayGap;
  }, [onReplayGap]);

  // Đặt trạng thái cho một hoặc nhiều node cụ thể và tự động reset về idle sau timeoutMs
  const setNodeStatus = useCallback(
    (
      target: string | string[],
      status: LiveNodeStatus,
      subLabel?: string,
      timeoutMs = 6000,
      terminalHoldMs = 1000,
      minimumRunningMs = 2000,
    ) => {
      const targets = Array.isArray(target) ? target : [target];
      const visibleDurationMs =
        status === "running"
          ? Math.max(minimumRunningMs, Math.min(timeoutMs, 24 * 60 * 60 * 1000))
          : status === "idle" ? 0 : terminalHoldMs;

      targets.forEach((targetKey) => {
        const existingTimer = nodeTimersRef.current.get(targetKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
      });

      setNodes((current) =>
        current.map((n) => {
          if (n.type !== "n8nNode" && n.type !== "architectureNode") return n;
          const nodeName = (n.data as FlowNodeData)?.name || "";
          const isMatch = targets.some(
            (t) =>
              n.id === t ||
              nodeName === t ||
              nodeName.toLowerCase().includes(t.toLowerCase())
          );

          if (isMatch) {
            return {
              ...n,
              data: {
                ...n.data,
                liveStatus: status,
                signalVersion:
                  status === "idle" ? Number(n.data.signalVersion || 0) : Number(n.data.signalVersion || 0) + 1,
                ...(subLabel !== undefined ? { subLabel } : {}),
              },
            };
          }
          return n;
        })
      );

      if (status !== "idle" && visibleDurationMs > 0) {
        const resetTimer = setTimeout(() => {
          setNodes((current) =>
            current.map((n) => {
              if (n.type !== "n8nNode" && n.type !== "architectureNode") return n;
              const nodeName = (n.data as FlowNodeData)?.name || "";
              const isMatch = targets.some(
                (t) =>
                  n.id === t ||
                  nodeName === t ||
                  nodeName.toLowerCase().includes(t.toLowerCase())
              );
              if (isMatch) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    liveStatus: "idle",
                    subLabel: "",
                  },
                };
              }
              return n;
            })
          );
          targets.forEach((t) => nodeTimersRef.current.delete(t));
        }, visibleDurationMs);

        targets.forEach((t) => nodeTimersRef.current.set(t, resetTimer));
      }
    },
    [setNodes]
  );

  // Xử lý sự kiện SSE từ Node backend
  const enqueueSignalProgress = useCallback((
    runKey: string,
    incoming: RealtimeProgressStep | null,
    options: { started?: boolean; deferredService?: boolean; flushDeferred?: boolean } = {},
  ) => {
    const run = progressRunsRef.current.get(runKey) || {
      displayMode: signalDisplayModeRef.current,
      active: null, queue: [], deferredServices: [], transitStep: null, apiObserved: false, inTransit: false,
    };
    progressRunsRef.current.set(runKey, run);
    const schedule = (callback: () => void, delayMs: number) => {
      const timer = setTimeout(() => { signalTimersRef.current.delete(timer); callback(); }, delayMs);
      signalTimersRef.current.add(timer);
    };
    const updateStep = (step: RealtimeProgressStep) => {
      if (!incoming?.terminal) return;
      step.terminal = incoming.terminal;
      step.terminalStatus = incoming.terminalStatus;
      step.terminalLabel = incoming.terminalLabel;
      step.durationMs = incoming.durationMs;
    };
    function startStep(step: RealtimeProgressStep) {
      step.arrivedAt = Date.now();
      run.active = step;
      if (run.displayMode === "slow") {
        setNodeStatus(
          step.nodeId,
          "running",
          step.terminalLabel || step.label,
          SLOW_NODE_FLASH_MS,
          SLOW_NODE_FLASH_MS,
          0,
        );
        schedule(() => {
          setNodeStatus(step.nodeId, "idle");
          step.arrivedAt = Date.now();
          advance();
        }, SLOW_NODE_FLASH_MS);
        return;
      }

      if (step.requestStart) {
        setNodeStatus(step.nodeId, "running", step.label, REALTIME_NODE_MIN_LIGHT_MS);
        schedule(() => {
          setNodeStatus(step.nodeId, "success", step.terminalLabel || "Request nhận được", REALTIME_NODE_MIN_LIGHT_MS);
          advance();
        }, REALTIME_NODE_MIN_LIGHT_MS);
        return;
      }

      setNodeStatus(
        step.nodeId,
        step.terminal ? step.terminalStatus : "running",
        step.terminalLabel || `${step.label} • đang chạy`,
        step.terminal ? REALTIME_NODE_MIN_LIGHT_MS : 120000,
      );
      if (step.terminal) advance();
    }

    function advance() {
      if (run.inTransit) return;
      const active = run.active;
      if (!active) {
        if (!run.queue.length || (run.displayMode === "slow" && !run.requestFinished)) return;
        startStep(run.queue.shift()!);
        return;
      }
      if (!active.terminal || !run.queue.length) return;
      if (run.displayMode === "slow" && !run.requestFinished) return;

      const minimumHoldMs = run.displayMode === "slow"
        ? 0
        : REALTIME_NODE_MIN_LIGHT_MS;
      const travelMs = run.displayMode === "slow"
        ? SLOW_SIGNAL_TRAVEL_MS
        : REALTIME_SIGNAL_TRAVEL_MS;
      const heldMs = Date.now() - (active.arrivedAt || Date.now());
      if (heldMs < minimumHoldMs) {
        schedule(advance, minimumHoldMs - heldMs);
        return;
      }

      const next = run.queue.shift()!;
      const edge = edgesRef.current.find((candidate) => candidate.source === active.nodeId && candidate.target === next.nodeId);
      if (next.sourceNodeId && next.sourceNodeId !== active.nodeId) {
        console.warn(`[RealtimeGraph] Event source ${next.sourceNodeId} does not match active node ${active.nodeId}.`);
      }
      run.inTransit = true;
      run.transitStep = next;
      if (edge) {
        setEdges((current) => {
          const updated = current.map((item) => item.id === edge.id
            ? { ...item, data: { ...(item.data || {}), signalActive: true, signalDurationMs: travelMs,
                signalVersion: Number((item.data as RealtimeSignalEdgeData | undefined)?.signalVersion || 0) + 1 } }
            : item);
          edgesRef.current = updated;
          return updated;
        });
      } else {
        console.warn(`[RealtimeGraph] No displayed edge from ${active.nodeId} to ${next.nodeId}; skipping particle.`);
      }
      schedule(() => {
        if (edge) setEdges((current) => {
          const updated = current.map((item) => item.id === edge.id
            ? { ...item, data: { ...(item.data || {}), signalActive: false } } : item);
          edgesRef.current = updated;
          return updated;
        });
        setNodeStatus(active.nodeId, "idle");
        run.inTransit = false;
        run.transitStep = null;
        startStep(next);
      }, edge ? travelMs : 0);
    }

    if (incoming) {
      const existing = [run.active, run.transitStep, ...run.queue, ...run.deferredServices]
        .find((step) => step?.nodeId === incoming.nodeId) as RealtimeProgressStep | undefined;
      if (run.displayMode === "slow" && options.started && !incoming.requestStart) {
        const requestStartStep = [run.active, ...run.queue].find((step) => step?.requestStart && step.durationMs === undefined);
        if (requestStartStep) {
          requestStartStep.durationMs = Math.max(0, incoming.startedAt - requestStartStep.startedAt);
        }
      }
      if (options.deferredService && !run.apiObserved) {
        if (existing) updateStep(existing); else run.deferredServices.push(incoming);
      } else if (existing) {
        updateStep(existing);
        if (incoming.terminal && run.active === existing && run.displayMode === "realtime") {
          setNodeStatus(existing.nodeId, incoming.terminalStatus, incoming.terminalLabel || existing.label, REALTIME_NODE_MIN_LIGHT_MS);
        }
      } else if (!options.started) {
        run.queue.push(incoming);
      } else {
        run.queue.push(incoming);
      }
      if (incoming.nodeId === OPENCLAW_API_NODE_ID) {
        run.apiObserved = true;
        run.queue.push(...run.deferredServices.splice(0));
      }
      advance();
    }
    if (options.flushDeferred) {
      run.requestFinished = true;
      run.queue.push(...run.deferredServices.splice(0));
      advance();
      schedule(() => {
        if (progressRunsRef.current.get(runKey) === run) {
          progressRunsRef.current.delete(runKey);
        }
      }, 120000);
    }
  }, [setEdges, setNodeStatus]);

  const changeSignalDisplayMode = useCallback((mode: SignalDisplayMode) => {
    signalDisplayModeRef.current = mode;
    setSignalDisplayMode(mode);
  }, []);

  const processIncomingSSEEvent = useCallback(
    (eventName: string, payload: NodeActivitySSEPayload) => {
      if (!payload) return;

      // 1. Chống trùng lặp sự kiện qua ID hoặc tổ hợp khóa duy nhất
      const eventKey =
        payload.id ||
        `${payload.correlation_id || payload.trace_id || payload.request_id || "req"}_${eventName}_${payload.stage || ""}_${payload.service_id || ""}_${payload.timestamp || ""}`;
      if (seenEventIdsRef.current.has(eventKey)) {
        return;
      }
      seenEventIdsRef.current.add(eventKey);
      if (seenEventIdsRef.current.size > 2000) {
        // Giới hạn bộ nhớ cache ID
        const firstKey = seenEventIdsRef.current.values().next().value;
        if (firstKey) seenEventIdsRef.current.delete(firstKey);
      }

      onEventReceivedRef.current?.(eventName, payload);

      const isServiceStage = payload.stage === "openclaw.service";
      const isGatewayChatEvent =
        eventName === "openclaw.gateway.chat" || payload.stage === "openclaw.gateway.chat";
      const isFormatStage = payload.stage === "openclaw.format_response";
      const traceId = payload.trace_id;
      const correlationId = payload.correlation_id;
      if (traceId && correlationId) {
        const knownCorrelationId = traceCorrelationRef.current.get(traceId);
        if (!knownCorrelationId) traceCorrelationRef.current.set(traceId, correlationId);
        if (!correlationTraceRef.current.has(correlationId)) {
          correlationTraceRef.current.set(correlationId, traceId);
        }
        if (traceCorrelationRef.current.size > 500) {
          const oldestTrace = traceCorrelationRef.current.keys().next().value;
          if (oldestTrace) traceCorrelationRef.current.delete(oldestTrace);
        }
        if (correlationTraceRef.current.size > 500) {
          const oldestCorrelation = correlationTraceRef.current.keys().next().value;
          if (oldestCorrelation) correlationTraceRef.current.delete(oldestCorrelation);
        }
      }
      const effectiveTraceId = traceId ||
        (correlationId ? correlationTraceRef.current.get(correlationId) : undefined);
      const effectiveCorrelationId = correlationId ||
        (effectiveTraceId ? traceCorrelationRef.current.get(effectiveTraceId) : undefined);
      const clearTraceCorrelationForTurn = () => {
        if (effectiveTraceId) {
          const mappedCorrelationId = traceCorrelationRef.current.get(effectiveTraceId);
          traceCorrelationRef.current.delete(effectiveTraceId);
          if (mappedCorrelationId && correlationTraceRef.current.get(mappedCorrelationId) === effectiveTraceId) {
            correlationTraceRef.current.delete(mappedCorrelationId);
          }
        } else if (effectiveCorrelationId) {
          const mappedTraceId = correlationTraceRef.current.get(effectiveCorrelationId);
          correlationTraceRef.current.delete(effectiveCorrelationId);
          if (mappedTraceId && traceCorrelationRef.current.get(mappedTraceId) === effectiveCorrelationId) {
            traceCorrelationRef.current.delete(mappedTraceId);
          }
        }
      };
      const requestGroupId = effectiveCorrelationId
        ? `correlation:${effectiveCorrelationId}`
        : effectiveTraceId
        ? `trace:${effectiveTraceId}`
        : payload.request_id
        ? `request:${payload.request_id}`
        : undefined;
      if (requestGroupId) {
        const traceGroup = effectiveTraceId ? eventGroupsRef.current.get(`trace:${effectiveTraceId}`) : undefined;
        const group = eventGroupsRef.current.get(requestGroupId) || traceGroup || {
          traceIds: new Set<string>(),
          serviceIds: new Set<string>(),
          latestEvent: eventName,
          updatedAt: Date.now(),
        };
        if (traceId) group.traceIds.add(traceId);
        if (
          isServiceStage &&
          typeof payload.service_id === "string" &&
          mapServiceIdToNodeId(payload.service_id)
        ) {
          group.serviceIds.add(payload.service_id);
        }
        group.latestEvent = eventName;
        group.updatedAt = Date.now();
        eventGroupsRef.current.set(requestGroupId, group);
        if (effectiveTraceId && requestGroupId !== `trace:${effectiveTraceId}`) {
          eventGroupsRef.current.delete(`trace:${effectiveTraceId}`);
        }
        if (eventGroupsRef.current.size > 500) {
          const oldestGroup = Array.from(eventGroupsRef.current.entries())
            .sort((a, b) => a[1].updatedAt - b[1].updatedAt)[0];
          if (oldestGroup) eventGroupsRef.current.delete(oldestGroup[0]);
        }
      }

      if (
        ["openclaw.pairing_gate", "openclaw.conversations", "openclaw.codex"].includes(payload.stage || "") &&
        !payload.node_id
      ) {
        return;
      }

      // The Gateway lifecycle duplicates the OpenClaw API node's timing signal;
      // the n8n workflow-node lifecycle drives that visual step once.

      const mappedServiceNodeId = isServiceStage
        ? mapServiceIdToNodeId(payload.service_id)
        : undefined;
      const explicitServiceNodeId = typeof payload.node_id === "string" && graphNodeNamesRef.current.has(payload.node_id.trim())
        ? payload.node_id.trim()
        : undefined;
      // Prefer an explicit node_id only when it exists in this snapshot; otherwise map by service_id.
      const serviceNodeId = isServiceStage
        ? explicitServiceNodeId || mappedServiceNodeId
        : undefined;
      if (isServiceStage && !serviceNodeId) {
        const serviceLabel = typeof payload.service_id === "string" && payload.service_id
          ? `Service chưa ánh xạ: ${payload.service_id}`
          : "openclaw.service • thiếu service_id";
        console.warn(`[RealtimeGraph] ${serviceLabel}; no substitute node was highlighted.`);
        return;
      }

      if (isServiceStage && serviceNodeId && !graphNodeNamesRef.current.has(serviceNodeId)) {
        console.warn(
          `[RealtimeGraph] Snapshot lacks node ${serviceNodeId} for service_id=${payload.service_id}; topology was not modified.`,
        );
        return;
      }

      const rawExplicitNodeId = typeof payload.node_id === "string" ? payload.node_id.trim() : "";
      const explicitNodeId = BACKEND_NODE_ID_ALIASES[rawExplicitNodeId] || rawExplicitNodeId;
      const explicitNodeName = explicitNodeId
        ? graphNodeNamesRef.current.get(explicitNodeId)
        : undefined;
      const isGraphNodeEvent = !isServiceStage && Boolean(rawExplicitNodeId);
      const lifecycleTargetNodeId = isServiceStage
        ? serviceNodeId
        : isGatewayChatEvent
          ? (typeof payload.target_node_id === "string" && graphNodeNamesRef.current.has(payload.target_node_id)
              ? payload.target_node_id
              : OPENCLAW_API_NODE_ID)
        : isGraphNodeEvent
          ? (typeof payload.target_node_id === "string" && graphNodeNamesRef.current.has(payload.target_node_id)
              ? payload.target_node_id
              : explicitNodeName ? explicitNodeId : undefined)
          : isFormatStage
            ? OPENCLAW_FORMAT_NODE_ID
            : mapStageToNodeId(payload.stage);
      const lifecycleNodeLabel = isServiceStage
        ? serviceNodeId === CHAT_NODE_ID ? "Chat thường" : payload.service_id || "openclaw.service"
        : isGatewayChatEvent
          ? "OpenClaw Gateway"
        : isFormatStage
          ? payload.node_name || explicitNodeName || "Format OpenClaw response"
          : payload.node_name || explicitNodeName || payload.stage || "Workflow node";

      // 2. Xử lý theo từng loại event chuẩn từ Node backend
      const isOpenClawRequest = [
        "/openclaw/v1/responses",
        "/openclaw/v1/chat/completions",
        "/openclaw/v1/images/generations",
      ].includes(payload.route || "");
      const shouldSequenceEvent = Boolean(requestGroupId) && (
        eventName === "stage.started" || eventName === "stage.completed" ||
        eventName === "stage.failed" || (eventName === "request.started" && isOpenClawRequest)
      ) && !isGatewayChatEvent;
      if (shouldSequenceEvent) {
        const targetNodeId = eventName === "request.started"
          ? NODE_BACKEND_ARCHITECTURE_NODE_IDS.ingress
          : lifecycleTargetNodeId;
        if (targetNodeId) {
          const isTerminal = eventName === "stage.completed" || eventName === "stage.failed";
          const duration = payload.duration_ms || 0;
          const terminalStatus: LiveNodeStatus = eventName === "stage.failed"
            ? "error"
            : duration > 1500 ? "slow" : "success";
          const outcome = getSafeOutcomeLabel(payload.outcome, eventName === "stage.failed" ? "failed" : "completed");
          const label = isTerminal
            ? `${lifecycleNodeLabel} • ${outcome} • ${duration}ms`
            : `${lifecycleNodeLabel} • đang chạy`;
          const step: RealtimeProgressStep = {
            nodeId: targetNodeId,
            label,
            startedAt: Date.now(),
            ...(isTerminal ? { durationMs: duration } : {}),
            terminal: isTerminal || eventName === "request.started",
            terminalStatus,
            ...(isTerminal ? { terminalLabel: label } : {}),
            ...(typeof payload.source_node_id === "string" ? { sourceNodeId: payload.source_node_id } : {}),
            ...(eventName === "request.started" ? { requestStart: true } : {}),
          };
          enqueueSignalProgress(requestGroupId!, step, {
            started: eventName === "request.started" || eventName === "stage.started",
            deferredService: isServiceStage,
          });
        }
        if (eventName === "stage.failed" && !serviceNodeId && !isFormatStage && !isGraphNodeEvent && !isGatewayChatEvent) {
          setNodeStatus(
            ["ce361f6c-bf94-4d14-9579-c5bf3ef818d1", "Acknowledge Node Activity", "node-request-outcome"],
            "error",
            "Stage Failed",
            8000,
          );
        }
        return;
      }
      if (isGatewayChatEvent && ["stage.started", "stage.completed", "stage.failed"].includes(eventName)) {
        return;
      }
      if (eventName === "request.completed" && requestGroupId) {
        enqueueSignalProgress(requestGroupId, null, { flushDeferred: true });
        if (isOpenClawRequest) return;
      }

      switch (eventName) {
        case "request.started": {
          const method = payload.method || "REQ";
          const route = payload.route || "";
          const isOpenClawChatApi = [
            "/openclaw/v1/responses",
            "/openclaw/v1/chat/completions",
            "/openclaw/v1/images/generations",
          ].includes(route);
          setNodeStatus(
            isOpenClawChatApi
              ? NODE_BACKEND_ARCHITECTURE_NODE_IDS.ingress
              : [
              "3f989cd1-d89f-4f7a-a58f-e131ecf772b0",
              "media_tech",
              "b269e71f-00ec-4888-a6e0-827a360d7bd6",
              "Node Activity Trace Webhook",
              "node-backend-server",
              "node-request-started",
              ],
            "running",
            `${method} ${route}`,
            60000
          );
          break;
        }

        case "stage.started": {
          const targetNodeId = lifecycleTargetNodeId;
          if (!targetNodeId) break;
          const isUnclassified =
            targetNodeId === "node-stage-unclassified" ||
            (Array.isArray(targetNodeId) && targetNodeId.includes("node-stage-unclassified"));
          const label = isUnclassified
            ? `${payload.stage || "unknown"}`
            : `${lifecycleNodeLabel} • đang chạy`;
          setNodeStatus(targetNodeId, "running", label, 120000);
          break;
        }

        case "stage.completed": {
          const targetNodeId = lifecycleTargetNodeId;
          if (!targetNodeId) break;
          const duration = payload.duration_ms || 0;
          const status = duration > 1500 ? "slow" : "success";
          const outcome = getSafeOutcomeLabel(payload.outcome, "completed");
          const label = `${lifecycleNodeLabel} • ${outcome} • ${duration}ms`;
          setNodeStatus(targetNodeId, status, label, 8000);
          break;
        }

        case "stage.failed": {
          const targetNodeId = lifecycleTargetNodeId;
          if (!targetNodeId) break;
          const duration = payload.duration_ms || 0;
          const outcome = getSafeOutcomeLabel(payload.outcome, "failed");
          const label = `${lifecycleNodeLabel} • ${outcome} • ${duration}ms`;
          setNodeStatus(targetNodeId, "error", label, 8000);
          if (!serviceNodeId && !isFormatStage && !isGraphNodeEvent && !isGatewayChatEvent) {
            setNodeStatus(
              ["ce361f6c-bf94-4d14-9579-c5bf3ef818d1", "Acknowledge Node Activity", "node-request-outcome"],
              "error",
              "Stage Failed",
              8000
            );
          }
          break;
        }

        case "request.completed": {
          clearTraceCorrelationForTurn();
          const statusCode = payload.status_code || 200;
          const isError = statusCode >= 400;
          const duration = payload.duration_ms || 0;
          const isOpenClawChatApi = [
            "/openclaw/v1/responses",
            "/openclaw/v1/chat/completions",
            "/openclaw/v1/images/generations",
          ].includes(payload.route || "");
          if (isOpenClawChatApi) {
            // The request lifecycle already advanced through the handler and
            // response nodes; do not flash the handler again at the end.
          } else {
            setNodeStatus(
              [
                "ce361f6c-bf94-4d14-9579-c5bf3ef818d1",
                "Acknowledge Node Activity",
                "node-request-outcome",
              ],
              isError ? "error" : duration > 1500 ? "slow" : "success",
              `HTTP ${statusCode} (${duration}ms)`,
              8000
            );
            setNodeStatus(
              ["3f989cd1-d89f-4f7a-a58f-e131ecf772b0", "media_tech", "node-backend-server"],
              isError ? "error" : "success",
              `Done (${duration}ms)`,
              4000
            );
          }
          break;
        }

        case "replay_gap": {
          onReplayGapRef.current?.(payload);
          setNodeStatus("node-frontend-client", "slow", "Replay Gap Sync", 4000);
          break;
        }

        case "connected": {
          onConnectionStatusChangeRef.current?.("connected");
          setNodeStatus("node-frontend-client", "success", "Connected (node_md)", 3000);
          break;
        }

        default:
          break;
      }
    },
    [enqueueSignalProgress, setNodeStatus]
  );

  // Expose imperative methods cho component cha
  useImperativeHandle(
    ref,
    () => ({
      triggerSSEEvent: (eventName: string, payload: NodeActivitySSEPayload) => {
        processIncomingSSEEvent(eventName, payload);
      },
      resetAllNodes: () => {
        nodeTimersRef.current.forEach((t) => clearTimeout(t));
        nodeTimersRef.current.clear();
        signalTimersRef.current.forEach((t) => clearTimeout(t));
        signalTimersRef.current.clear();
        progressRunsRef.current.clear();
        setEdges((current) => {
          const updated = current.map((edge) => ({
            ...edge,
            data: { ...(edge.data || {}), signalActive: false },
          }));
          edgesRef.current = updated;
          return updated;
        });
        traceCorrelationRef.current.clear();
        correlationTraceRef.current.clear();
        eventGroupsRef.current.clear();
        setNodes((current) =>
          current.map((n) =>
            n.type === "n8nNode" || n.type === "architectureNode"
              ? { ...n, data: { ...n.data, liveStatus: "idle", subLabel: "" } }
              : n
          )
        );
      },
      reconnect: () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        setReconnectNonce((n) => n + 1);
      },
    }),
    [processIncomingSSEEvent, setEdges, setNodes]
  );

  // Cập nhật graph khi có dữ liệu mới
  useEffect(() => {
    if (!graph) return;
    const { allNodes, flowEdges } = convertNormalizedGraphToFlow(graph);
    graphNodeNamesRef.current = new Map(
      allNodes
        .filter((node) => node.type === "n8nNode" || node.type === "architectureNode")
        .map((node) => [node.id, (node.data as FlowNodeData).name || ""]),
    );

    setNodes((prevNodes) => {
      if (!prevNodes || prevNodes.length === 0) {
        return allNodes;
      }

      // Giữ lại trạng thái live của các node đang chạy
      const liveMap = new Map<string, { status: LiveNodeStatus; label?: string }>();
      prevNodes.forEach((n) => {
        const live = (n.data as FlowNodeData)?.liveStatus;
        const sub = (n.data as FlowNodeData)?.subLabel;
        if (n.type !== "stickyNote" && live && live !== "idle") {
          liveMap.set(n.id, { status: live, label: sub });
        }
      });

      if (liveMap.size === 0) return allNodes;

      return allNodes.map((newNode) => {
        if (newNode.type === "stickyNote") return newNode;
        const live = liveMap.get(newNode.id);
        if (live) {
          return {
            ...newNode,
            data: {
              ...newNode.data,
              liveStatus: live.status,
              subLabel: live.label,
            },
          };
        }
        return newNode;
      });
    });

    const activeEdges = new Map(edgesRef.current.map((edge) => [edge.id, edge.data]));
    const nextEdges = flowEdges.map((edge) => ({
      ...edge,
      data: { ...(activeEdges.get(edge.id) || {}), ...(edge.data || {}) },
    }));
    edgesRef.current = nextEdges;
    setEdges(nextEdges);

    // Refit when a new graph snapshot arrives.
    const fitFrame = requestAnimationFrame(() => {
      reactFlowInstanceRef.current?.fitView({ padding: 0.15, duration: 250 });
    });
    return () => cancelAnimationFrame(fitFrame);
  }, [graph, setNodes, setEdges]);

  // Kết nối EventSource SSE tới Next.js Route Handler
  useEffect(() => {
    if (!enableRealtime) return;

    const nodeTimers = nodeTimersRef.current;
    const signalTimers = signalTimersRef.current;
    const progressRuns = progressRunsRef.current;

    const targetUrl = sseUrl || getSseProxyUrl();
    onConnectionStatusChangeRef.current?.("connecting");

    let eventSource: EventSource | null = null;
    const connectSSE = () => {
      try {
        eventSource = new EventSource(targetUrl, { withCredentials: false });
        eventSourceRef.current = eventSource;

        // onopen chỉ xác nhận kết nối tới proxy HTTP, KHÔNG chứng minh backend SSE đã sẵn sàng
        eventSource.onopen = () => {
          onConnectionStatusChangeRef.current?.("waiting_backend");
        };

        // Khi upstream 404 hoặc mất kết nối, EventSource sẽ báo lỗi
        eventSource.onerror = () => {
          if (eventSource?.readyState === EventSource.CONNECTING) {
            onConnectionStatusChangeRef.current?.("reconnecting");
          } else {
            onConnectionStatusChangeRef.current?.("unavailable");
          }
        };

        // Đăng ký toàn bộ event names từ Node backend
        const eventNames = [
          "request.started",
          "request.completed",
          "stage.started",
          "stage.completed",
          "stage.failed",
          "openclaw.gateway.chat",
          "connected",
          "replay_gap",
        ];

        eventNames.forEach((name) => {
          eventSource?.addEventListener(name, (e: MessageEvent) => {
            try {
              const data = JSON.parse(e.data);
              processIncomingSSEEvent(name, data);
            } catch {
              processIncomingSSEEvent(name, { raw: e.data });
            }
          });
        });

        // Nhận event mặc định
        eventSource.onmessage = (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            const type = data.type || "message";
            processIncomingSSEEvent(type, data);
          } catch {
            processIncomingSSEEvent("message", { raw: e.data });
          }
        };
      } catch (err) {
        console.warn("[SSE] Error initializing EventSource:", err);
        onConnectionStatusChangeRef.current?.("unavailable");
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
        eventSourceRef.current = null;
      }
      nodeTimers.forEach((t) => clearTimeout(t));
      nodeTimers.clear();
      signalTimers.forEach((t) => clearTimeout(t));
      signalTimers.clear();
      progressRuns.clear();
      edgesRef.current = edgesRef.current.map((edge) => ({
        ...edge,
        data: { ...(edge.data || {}), signalActive: false },
      }));
    };
  }, [enableRealtime, sseUrl, reconnectNonce, processIncomingSSEEvent]);

  return (
    <div className={`relative ${className} ${signalDisplayMode === "slow" ? "n8n-slow-view" : ""}`}>
      {/* CSS Animation Keyframes cho hiệu ứng viền phát sáng */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes n8n-node-pulse {
              0%, 100% {
                box-shadow: none;
                border-color: #1e293b;
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
              100% { box-shadow: none; border-color: #1e293b; }
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
            .n8n-slow-view .n8n-node--running {
              animation: n8n-node-pulse ${SLOW_NODE_FLASH_MS}ms ease-in-out 1 both !important;
            }
            .n8n-slow-view .n8n-node--success,
            .n8n-slow-view .n8n-node--slow,
            .n8n-slow-view .n8n-node--error {
              animation-duration: ${SLOW_NODE_FLASH_MS}ms !important;
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
          `,
        }}
      />

      <ReactFlow
        onInit={(instance) => {
          reactFlowInstanceRef.current = instance;
          instance.fitView({ padding: 0.15 });
        }}
        nodes={nodes}
        edges={edges}
        minZoom={0.35}
        maxZoom={3}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={N8N_NODE_TYPES}
        edgeTypes={N8N_EDGE_TYPES}
        defaultEdgeOptions={{
          type: "realtimeSignal",
          animated: false,
        }}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        colorMode="dark"
        className="bg-slate-950"
      >
        <Panel position="top-right" className="!m-3">
          <div
            role="group"
            aria-label="Chế độ hiển thị tín hiệu"
            className="flex items-center gap-0.5 rounded-xl border border-slate-700 bg-slate-950/95 p-1 shadow-xl backdrop-blur"
          >
            <button
              type="button"
              aria-pressed={signalDisplayMode === "realtime"}
              title="Áp dụng cho lượt gọi mới; hiện tín hiệu ngay khi nhận được"
              onClick={() => changeSignalDisplayMode("realtime")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${signalDisplayMode === "realtime" ? "bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/50" : "text-slate-300 hover:bg-slate-800"}`}
            >
              <Radio className="h-4 w-4" />
              Thời gian thực
            </button>
            <button
              type="button"
              aria-pressed={signalDisplayMode === "slow"}
              title="Áp dụng cho lượt gọi mới; sau khi xong, các nút chớp ngắn và chấm đi chậm"
              onClick={() => changeSignalDisplayMode("slow")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${signalDisplayMode === "slow" ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/50" : "text-slate-300 hover:bg-slate-800"}`}
            >
              <Clock className="h-4 w-4" />
              Xem chậm
            </button>
          </div>
        </Panel>
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
    </div>
  );
});

export default N8nDiagramRenderer;
