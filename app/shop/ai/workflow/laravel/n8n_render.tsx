"use client";

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useId,
  forwardRef,
} from "react";
import { io, Socket } from "socket.io-client";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

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

export interface N8nTracePayload {
  event?: string;
  event_id?: string;
  workflow_id?: string;
  status: "success" | "slow" | "error";
  status_code?: number;
  duration_ms?: number;
  stage_node_ids?: string[];
  stages?: string[];
  api_results?: N8nTracePayload;
  data?: N8nTracePayload;
  payload?: N8nTracePayload;
  trace?: {
    uri?: string;
    method?: string;
    stage_node_ids?: string[];
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

  return (
    <div
      style={{
        width: `${data.width}px`,
        height: `${data.height}px`,
      }}
      className={`rounded-2xl border-2 border-dashed ${theme.border} ${theme.bg} p-5 select-text nodrag nopan pointer-events-auto transition-all duration-300 flex flex-col justify-start`}
    >
      {contentLines[0] && (
        <h4 className={`text-xl leading-5 font-bold tracking-wide uppercase ${theme.header} mb-2`}>
          {contentLines[0]}
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
      className={`flex flex-col items-center justify-start group pointer-events-auto ${
        hasMermaidDiagram ? "cursor-pointer" : "cursor-default"
      }`}
      title={hasMermaidDiagram ? `${data.name} — bấm để mở sơ đồ con` : data.name}
    >
      {/* Khung vuông icon chính (~64x64) mô phỏng chuẩn node n8n Editor */}
      <div
        key={data.signalVersion ?? 0}
        className={`relative w-20 h-20 rounded-2xl bg-slate-900/95 border-2 flex items-center justify-center shadow-lg transition-all duration-300 ${
          liveClass ||
          (data.disabled
            ? "opacity-50 grayscale border-slate-700"
            : "border-slate-700/80 hover:border-slate-500")
        } ${selected ? "!border-amber-400 !ring-2 !ring-amber-400/40" : ""}`}
      >
        {targetHandles.map((handleId, index) => (
          <Handle
            key={`target-${handleId ?? "default"}`}
            type="target"
            position={Position.Left}
            id={handleId ?? undefined}
            style={{ top: handleTop(index, targetHandles.length) }}
            className="!w-2.5 !h-2.5 !-left-1.5 !bg-slate-300 !border-2 !border-slate-950 hover:!bg-amber-400 transition-colors"
            title={`Input ${handleId ?? "default"}`}
          />
        ))}

        {/* Khung Icon màu theo phân loại n8n */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 ${
            data.disabled
              ? "bg-slate-800 text-slate-500"
              : liveStatus === "running"
              ? "bg-cyan-400 text-slate-950 scale-110"
              : `${meta.bg} text-white`
          }`}
        >
          <Icon className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Huy hiệu mini trạng thái realtime trên góc icon */}
        {liveStatus === "running" && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-slate-950 animate-ping" />
        )}
        {liveStatus === "success" && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center text-[11px] font-bold text-white shadow">
            ✓
          </span>
        )}
        {liveStatus === "slow" && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border border-slate-900 flex items-center justify-center text-[11px] font-bold text-white shadow">
            ⏱
          </span>
        )}
        {liveStatus === "error" && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border border-slate-900 flex items-center justify-center text-[11px] font-bold text-white shadow">
            ✕
          </span>
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
            className="!w-2.5 !h-2.5 !-right-1.5 !bg-emerald-400 !border-2 !border-slate-950 hover:!bg-emerald-300 transition-colors"
            title={`Output ${handleId ?? "default"}`}
          />
        ))}
      </div>

      {/* Tên node và version nằm bên dưới icon box, căn giữa, tối đa 2 dòng */}
      <div className="nodrag nopan select-text mt-1.5 text-center w-full px-0.5 flex flex-col items-center">
        <span
          className={`text-[17px] font-medium leading-5 line-clamp-2 max-w-[112px] break-words ${hasMermaidDiagram ? "text-violet-200" : "text-slate-200"}`}
          title={data.name}
        >
          {data.name}
        </span>
        <div className="flex items-center gap-1 mt-0.5 text-sm leading-4 text-slate-400 font-mono">
          <span className="truncate max-w-[85px]">{formatNodeType(data.nodeType)}</span>
          {data.typeVersion !== undefined && (
            <span className="text-slate-500 font-normal">v{data.typeVersion}</span>
          )}
        </div>
        {data.disabled && (
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

  const isStickyNote = (node: any) =>
    Boolean(
      node.isStickyNote ||
      node.type === "stickyNote" ||
      node.type === "n8n-nodes-base.stickyNote"
    );

  // 1. Tách flowNodes (loại bỏ sticky note nếu lọt vào mảng nodes)
  const rawFlowNodes =
    graph.flowNodes ??
    (graph.nodes || []).filter((node) => !isStickyNote(node));

  // 2. Tách và gộp stickyNotes từ cả mảng riêng lẫn graph.nodes như OpenClaw.
  const stickyNoteMap = new Map<string, any>();
  const candidates: any[] = [
    ...(graph.stickyNotes ?? []).map((note) => ({ ...note, isStickyNote: true as const })),
    ...(graph.nodes ?? []).filter(isStickyNote).map((note) => ({ ...note, isStickyNote: true as const })),
  ];
  candidates.forEach((note, index) => {
    const id = note.id || `sticky-note-${index}`;
    if (!stickyNoteMap.has(id)) stickyNoteMap.set(id, { ...note, id });
  });
  const rawStickyNotes = [...stickyNoteMap.values()];
  const graphEdges = graph.edges ?? [];

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
      handles: deriveNodeHandles(graphEdges, node.id),
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

  // Map Edges: giữ nguyên source, target, sourceHandle, targetHandle, dùng đường cong n8n (type: "default")
  const flowEdges: Edge[] = graphEdges.map((edge, index) => ({
    id: edge.id || `e-${index}-${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: "default",
    animated: false,
    style: { stroke: "#64748b", strokeWidth: 2 },
  }));

  return {
    allNodes: [...stickyNotes, ...flowNodes],
    flowEdges,
    flowNodeCount: flowNodes.length,
    stickyNoteCount: stickyNotes.length,
    edgeCount: flowEdges.length,
  };
};

// ==========================================
// 5. N8N RENDERER COMPONENT CHÍNH
// ==========================================

export type SocketConnectionStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export interface N8nDiagramRendererProps {
  graph?: N8nNormalizedGraph | { graph?: N8nNormalizedGraph; workflow?: unknown } | null;
  socketUrl?: string;
  enableRealtime?: boolean;
  onTraceReceived?: (trace: N8nTracePayload) => void;
  onGraphReceived?: (payload: N8nGraphSocketPayload) => void;
  onSocketStatusChange?: (status: SocketConnectionStatus) => void;
  className?: string;
}

export interface N8nDiagramRendererRef {
  triggerTraceAnimation: (trace: N8nTracePayload) => void;
  resetAllNodes: () => void;
}

export const N8nDiagramRenderer = forwardRef<
  N8nDiagramRendererRef,
  N8nDiagramRendererProps
>(function N8nDiagramRenderer(
  {
    graph,
    socketUrl = "https://node_js.hust.media",
    enableRealtime = true,
    onTraceReceived,
    onGraphReceived,
    onSocketStatusChange,
    className = "w-full h-full",
  },
  ref
) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedSubdiagram, setSelectedSubdiagram] = useState<MermaidSubdiagram | null>(null);
  const animationTimersRef = useRef<NodeJS.Timeout[]>([]);
  const nodeFallbackTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const socketRef = useRef<Socket | null>(null);

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

  // Lưu callbacks trong ref để socket effect không bị re-run khi props thay đổi
  const onTraceReceivedRef = useRef(onTraceReceived);
  const onGraphReceivedRef = useRef(onGraphReceived);
  const onSocketStatusChangeRef = useRef(onSocketStatusChange);

  useEffect(() => {
    onTraceReceivedRef.current = onTraceReceived;
  }, [onTraceReceived]);

  useEffect(() => {
    onGraphReceivedRef.current = onGraphReceived;
  }, [onGraphReceived]);

  useEffect(() => {
    onSocketStatusChangeRef.current = onSocketStatusChange;
  }, [onSocketStatusChange]);

  const clearTimers = useCallback(() => {
    animationTimersRef.current.forEach((timer) => clearTimeout(timer));
    animationTimersRef.current = [];
    nodeFallbackTimersRef.current.forEach((timer) => clearTimeout(timer));
    nodeFallbackTimersRef.current.clear();
  }, []);

  // Thực hiện animation nhấp nháy tuần tự theo stage_node_ids (match chính xác qua node.id)
  const animateTrace = useCallback(
    (trace: N8nTracePayload) => {
      clearTimers();

      const stageIds =
        Array.isArray(trace.stage_node_ids) && trace.stage_node_ids.length > 0
          ? trace.stage_node_ids
          : [];

      // Bước 1: Reset tất cả flow nodes về idle (không tác động stickyNote)
      setNodes((current) =>
        current.map((n) => {
          if (n.type === "stickyNote") return n;
          return {
            ...n,
            data: {
              ...n.data,
              liveStatus: "idle",
            },
          };
        })
      );

      if (stageIds.length === 0) return;

      const stageDelayMs = 250;

      // Bước 2: Mỗi node sáng khi được kích hoạt; nếu không có tín hiệu tắt thì tự tắt sau 2s.
      stageIds.forEach((nodeId, index) => {
        const timer = setTimeout(() => {
          setNodes((current) =>
            current.map((n) => {
              if (n.type === "stickyNote") return n;
              if (n.id === nodeId) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    liveStatus: "running",
                    signalVersion: ((n.data as FlowNodeData).signalVersion ?? 0) + 1,
                  },
                };
              }
              return n;
            })
          );

          const previousFallback = nodeFallbackTimersRef.current.get(nodeId);
          if (previousFallback) clearTimeout(previousFallback);
          const resetTimer = setTimeout(() => {
            setNodes((current) =>
              current.map((n) => {
                if (n.type === "stickyNote" || n.id !== nodeId) return n;
                return { ...n, data: { ...n.data, liveStatus: "idle" } };
              })
            );
            nodeFallbackTimersRef.current.delete(nodeId);
          }, 2000);
          nodeFallbackTimersRef.current.set(nodeId, resetTimer);
          animationTimersRef.current.push(resetTimer);
        }, index * stageDelayMs);

        animationTimersRef.current.push(timer);
      });

      // Trace hoàn tất: phát trạng thái kết quả rồi tắt 100ms sau đó.
      const finishTimer = setTimeout(() => {
        nodeFallbackTimersRef.current.forEach((timer) => clearTimeout(timer));
        nodeFallbackTimersRef.current.clear();

        setNodes((current) =>
          current.map((n) => {
            if (n.type === "stickyNote") return n;
            return {
              ...n,
              data: {
                ...n.data,
                liveStatus: stageIds.includes(n.id) ? trace.status || "success" : "idle",
                signalVersion: stageIds.includes(n.id)
                  ? ((n.data as FlowNodeData).signalVersion ?? 0) + 1
                  : (n.data as FlowNodeData).signalVersion ?? 0,
              },
            };
          })
        );

        const resetTimer = setTimeout(() => {
          setNodes((current) =>
            current.map((n) => {
              if (n.type === "stickyNote") return n;
              return { ...n, data: { ...n.data, liveStatus: "idle" } };
            })
          );
        }, 1000);
        animationTimersRef.current.push(resetTimer);
      }, stageIds.length * stageDelayMs + 100);
      animationTimersRef.current.push(finishTimer);
    },
    [clearTimers, setNodes]
  );

  // Expose các phương thức điều khiển cho parent
  useImperativeHandle(
    ref,
    () => ({
      triggerTraceAnimation: (trace: N8nTracePayload) => {
        animateTrace(trace);
      },
      resetAllNodes: () => {
        clearTimers();
        setNodes((current) =>
          current.map((n) => {
            if (n.type === "stickyNote") return n;
            return {
              ...n,
              data: { ...n.data, liveStatus: "idle" },
            };
          })
        );
      },
    }),
    [animateTrace, clearTimers, setNodes]
  );

  // Khi graph data thay đổi (API trả về hoặc realtime n8n:graph), cập nhật nodes & edges
  // Lưu ý: setNodes và setEdges trong React Flow v12 không làm thay đổi viewport (giữ nguyên vị trí zoom và pan)
  // Đồng thời bảo toàn liveStatus nếu node đang trong animation trace
  useEffect(() => {
    if (!graph) return;
    const { allNodes, flowEdges } = convertNormalizedGraphToFlow(graph);

    setNodes((prevNodes) => {
      if (!prevNodes || prevNodes.length === 0) {
        return allNodes;
      }

      // Giữ lại liveStatus hiện tại của các node (running/success/slow/error)
      const currentLiveStatusMap = new Map<string, LiveNodeStatus>();
      prevNodes.forEach((n) => {
        const live = (n.data as FlowNodeData)?.liveStatus;
        if (n.type !== "stickyNote" && live && live !== "idle") {
          currentLiveStatusMap.set(n.id, live);
        }
      });

      if (currentLiveStatusMap.size === 0) {
        return allNodes;
      }

      return allNodes.map((newNode) => {
        if (newNode.type === "stickyNote") return newNode;
        const currentLive = currentLiveStatusMap.get(newNode.id);
        if (currentLive) {
          return {
            ...newNode,
            data: {
              ...newNode.data,
              liveStatus: currentLive,
            },
          };
        }
        return newNode;
      });
    });

    setEdges(flowEdges);
  }, [graph, setNodes, setEdges]);

  // Lưu animateTrace trong ref để socket effect không phụ thuộc vào animateTrace
  const animateTraceRef = useRef(animateTrace);
  useEffect(() => {
    animateTraceRef.current = animateTrace;
  }, [animateTrace]);

  // Kết nối Socket.IO duy nhất: nhận cả tín hiệu n8n:trace và n8n:graph
  useEffect(() => {
    if (!enableRealtime || !socketUrl) return;

    onSocketStatusChangeRef.current?.("connecting");

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

    const handleConnect = () => {
      onSocketStatusChangeRef.current?.("connected");
    };

    const handleDisconnect = (reason: string) => {
      if (reason === "io client disconnect") {
        onSocketStatusChangeRef.current?.("disconnected");
      } else {
        onSocketStatusChangeRef.current?.("reconnecting");
      }
    };

    const handleConnectError = (error: Error) => {
      // Khi WebSocket gặp lỗi tạm thời và socket.io fallback sang polling, không xem là disconnected
      console.warn("[n8n-socket] connect_error (polling fallback active):", error?.message);
      onSocketStatusChangeRef.current?.("reconnecting");
    };

    const handleReconnectAttempt = () => {
      onSocketStatusChangeRef.current?.("reconnecting");
    };

    const handleReconnect = () => {
      onSocketStatusChangeRef.current?.("connected");
    };

    const handleReconnectFailed = () => {
      onSocketStatusChangeRef.current?.("disconnected");
    };

    const handleTrace = (payload: N8nTracePayload) => {
      if (!payload) return;
      const normalizedTrace = normalizeSocketTrace(payload);
      onTraceReceivedRef.current?.(normalizedTrace);
      animateTraceRef.current?.(normalizedTrace);
    };

    const handleGraph = (payload: N8nGraphSocketPayload) => {
      if (!payload?.graph) return;
      onGraphReceivedRef.current?.(payload);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.io.on("reconnect", handleReconnect);
    socket.io.on("reconnect_failed", handleReconnectFailed);

    socket.on("n8n:trace", handleTrace);
    socket.on("n8n:graph", handleGraph);
    socket.on("workflow_graph", handleGraph);

    return () => {
      socket.off("n8n:graph", handleGraph);
      socket.off("workflow_graph", handleGraph);
      socket.off("n8n:trace", handleTrace);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.io.off("reconnect", handleReconnect);
      socket.io.off("reconnect_failed", handleReconnectFailed);
      socket.disconnect();
      socketRef.current = null;
      clearTimers();
    };
  }, [enableRealtime, socketUrl, clearTimers]);

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
          `,
        }}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        minZoom={0.35}
        maxZoom={3}
        onNodeClick={handleNodeClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={N8N_NODE_TYPES}
        defaultEdgeOptions={{
          type: "default",
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
