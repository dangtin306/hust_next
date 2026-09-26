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
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  AlertCircle,
  ArrowLeftRight,
  Boxes,
  Clock,
  Code2,
  Database,
  GitBranch,
  GitMerge,
  HelpCircle,
  MessageSquare,
  Radio,
  Sliders,
  Terminal,
  Zap,
} from "lucide-react";

import { mapServiceIdToNodeId, mapStageToNodeId, getSseProxyUrl } from "./process";

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
  chat_kind?: string;
  service_id?: string;
  workflow_id?: string;
  execution_id?: string;
  node_id?: string;
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

export type LiveNodeStatus = "idle" | "running" | "success" | "slow" | "error";

export type FlowNodeData = {
  name: string;
  nodeType: string;
  typeVersion?: number;
  disabled?: boolean;
  liveStatus: LiveNodeStatus;
  subLabel?: string;
  description?: string;
  [key: string]: unknown;
};

export type StickyNoteData = {
  content: string;
  color: number;
  width: number;
  height: number;
  [key: string]: unknown;
};

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

const STICKY_COLOR_MAP: Record<
  number,
  { border: string; bg: string; header: string }
> = {
  4: {
    // Xanh lá (n8n Workflow Branch)
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/20",
    header: "text-emerald-400",
  },
  5: {
    // Xanh dương (Node Backend Runtime Branch)
    border: "border-blue-500/40",
    bg: "bg-blue-950/20",
    header: "text-blue-400",
  },
  6: {
    // Tím (Monitoring & SLA)
    border: "border-purple-500/40",
    bg: "bg-purple-950/20",
    header: "text-purple-400",
  },
  7: {
    // Xám (Ingress)
    border: "border-slate-600/40",
    bg: "bg-slate-900/30",
    header: "text-slate-300",
  },
};

const getNodeCategory = (nodeType = "", name = "") => {
  const lower = (nodeType + " " + name).toLowerCase();
  if (lower.includes("webhook") || lower.includes("ingress")) return { icon: Radio, bg: "bg-[#ff6d5a]" };
  if (lower.includes("trigger") || lower.includes("cron")) return { icon: Clock, bg: "bg-[#10b981]" };
  if (lower.includes("sse") || lower.includes("stream") || lower.includes("client"))
    return { icon: ArrowLeftRight, bg: "bg-[#06b6d4]" };
  if (lower.includes("tool") || lower.includes("cli")) return { icon: Terminal, bg: "bg-[#3b82f6]" };
  if (lower.includes("unclassified")) return { icon: HelpCircle, bg: "bg-[#a855f7]" };
  if (lower.includes("code") || lower.includes("function") || lower.includes("parser"))
    return { icon: Code2, bg: "bg-[#f59e0b]" };
  if (lower.includes("if") || lower.includes("switch") || lower.includes("router"))
    return { icon: GitBranch, bg: "bg-[#8b5cf6]" };
  if (lower.includes("respond") || lower.includes("ack") || lower.includes("outcome"))
    return { icon: Zap, bg: "bg-[#10b981]" };
  return { icon: Boxes, bg: "bg-[#64748b]" };
};

const formatNodeType = (nodeType = "") => {
  if (!nodeType) return "Node";
  const parts = nodeType.split(".");
  const raw = parts[parts.length - 1] || nodeType;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const describeWorkflowNode = (name = "", nodeType = "") => {
  const descriptions: Record<string, string> = {
    "chat bot tuong tac tv": "Nhận yêu cầu chat từ giao diện tương tác TV.",
    media_tech: "Điểm vào chat chính của workflow media_tech.",
    "Prepare media_tech OpenClaw message": "Chuẩn hóa nội dung chat trước khi định tuyến.",
    "Run test data": "Kích hoạt thủ công để chạy thử workflow.",
    "Test input - change route here": "Tạo payload mẫu để kiểm thử các nhánh xử lý.",
    "Route chat command (/oc /level /v3 /v4)": "Đọc lệnh chat và chọn nhánh xử lý tương ứng.",
    "Is OpenClaw?": "Kiểm tra yêu cầu có đi theo luồng OpenClaw không.",
    "Is Cloud GPU?": "Chọn xử lý trên máy thường hay Cloud GPU.",
    "Is Level?": "Kiểm tra yêu cầu có chọn chế độ Level không.",
    "Qwen Level API": "Gửi yêu cầu Level tới dịch vụ Qwen.",
    "Qwen Cloud GPU Level API": "Chạy yêu cầu Level qua endpoint Cloud GPU.",
    "Format Level response": "Chuẩn hóa kết quả Level trước khi trả về.",
    "Format Cloud GPU Level response": "Chuẩn hóa kết quả Level từ Cloud GPU.",
    "Is V4?": "Chọn nhánh tương thích model V3 hoặc V4.",
    "Qwen V3 API": "Gửi prompt tới endpoint Qwen V3.",
    "Format V3 response": "Định dạng phản hồi Qwen V3 cho đầu ra workflow.",
    "Qwen V4 API": "Gửi prompt tới endpoint Qwen V4.",
    "Format V4 response": "Định dạng phản hồi Qwen V4 cho đầu ra workflow.",
    "OpenClaw Chat API": "Gửi hội thoại tới API OpenClaw.",
    "Format OpenClaw response": "Chuẩn hóa phản hồi OpenClaw trước khi gửi lại.",
    "Is RAG?": "Xác định yêu cầu có cần truy xuất dữ liệu RAG không.",
    "IBM Search API": "Tìm ngữ cảnh liên quan cho nhánh RAG.",
    "Build V4 RAG prompt": "Ghép câu hỏi với ngữ cảnh truy xuất thành prompt.",
    "Qwen V4 RAG Answer API": "Sinh câu trả lời V4 dựa trên ngữ cảnh RAG.",
    "Format V4 RAG answer": "Chuẩn hóa câu trả lời của nhánh V4 RAG.",
    "Is Cloud GPU RAG?": "Chọn endpoint RAG thường hoặc Cloud GPU.",
    "Qwen Cloud GPU V4 RAG API": "Sinh câu trả lời RAG V4 trên Cloud GPU.",
    "Format Cloud GPU V4 RAG answer": "Chuẩn hóa kết quả RAG V4 từ Cloud GPU.",
    "Qwen Cloud GPU V4 API": "Gửi yêu cầu V4 tới endpoint Cloud GPU.",
    "Format Cloud GPU V4 response": "Chuẩn hóa phản hồi V4 từ Cloud GPU.",
    "View Level input log": "Theo dõi dữ liệu đầu vào của nhánh Level.",
    "View Level output log": "Theo dõi kết quả sau xử lý của nhánh Level.",
    "Node Activity Trace Webhook": "Nhận telemetry trace từ Node backend.",
    "Acknowledge Node Activity": "Trả xác nhận đã nhận sự kiện telemetry.",
  };

  if (descriptions[name]) return descriptions[name];
  if (nodeType.includes("httpRequest")) return "Gọi dịch vụ bên ngoài trong nhánh workflow.";
  if (nodeType.includes("if") || nodeType.includes("switch")) return "Đánh giá điều kiện và chọn nhánh tiếp theo.";
  if (nodeType.includes("respondToWebhook")) return "Gửi phản hồi về cho dịch vụ gọi workflow.";
  if (nodeType.includes("webhook")) return "Nhận request từ dịch vụ upstream.";
  if (nodeType.includes("code")) return "Biến đổi dữ liệu cho bước kế tiếp.";
  return "Một bước xử lý trong workflow.";
};

// ==========================================
// 3. CUSTOM REACT FLOW NODE RENDERERS
// ==========================================

function N8nStickyNoteRenderer({ data }: NodeProps<Node<StickyNoteData>>) {
  const theme = STICKY_COLOR_MAP[data.color] || STICKY_COLOR_MAP[5];
  const contentLines = String(data.content || "").split("\n");

  return (
    <div
      style={{
        width: `${data.width}px`,
        height: `${data.height}px`,
      }}
      className={`rounded-2xl border-2 border-dashed ${theme.border} ${theme.bg} p-5 select-none pointer-events-none transition-all duration-300 flex flex-col justify-start`}
    >
      {contentLines[0] && (
        <h4 className={`text-sm font-bold tracking-wide uppercase ${theme.header} mb-2`}>
          {contentLines[0]}
        </h4>
      )}
      <div className="text-xs text-slate-300/85 leading-relaxed space-y-1 whitespace-pre-wrap">
        {contentLines.slice(1).join("\n")}
      </div>
    </div>
  );
}

function N8nFlowNodeRenderer({ id, data }: NodeProps<Node<FlowNodeData>>) {
  const { icon: NodeIcon, bg: iconBg } = getNodeCategory(data.nodeType, data.name);
  const liveStatus = data.liveStatus || "idle";

  const getBorderStatusClass = () => {
    switch (liveStatus) {
      case "running":
        return "n8n-node--running";
      case "success":
        return "n8n-node--success";
      case "slow":
        return "n8n-node--slow";
      case "error":
        return "n8n-node--error";
      default:
        return "border-slate-800 hover:border-slate-700 bg-slate-900/90";
    }
  };

  const getGlowDot = () => {
    switch (liveStatus) {
      case "running":
        return "bg-cyan-400 animate-ping";
      case "success":
        return "bg-emerald-400";
      case "slow":
        return "bg-amber-400";
      case "error":
        return "bg-rose-500 animate-pulse";
      default:
        return null;
    }
  };

  const glowDotColor = getGlowDot();

  return (
    <div
      className={`relative group flex flex-col items-center select-none transition-transform duration-200 ${
        liveStatus === "running" ? "scale-105" : ""
      }`}
    >
      <div
        className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shadow-lg relative transition-all duration-300 ${getBorderStatusClass()}`}
      >
        <Handle
          type="target"
          position={Position.Left}
          id="main-0"
          className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-950 transition-transform group-hover:scale-125"
        />

        <div
          className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-105`}
        >
          <NodeIcon className="w-5 h-5 stroke-[2.2]" />
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="main-0"
          className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-950 transition-transform group-hover:scale-125"
        />

        {glowDotColor && (
          <span
            className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full ${glowDotColor} border-2 border-slate-950 shadow-sm`}
          />
        )}
      </div>

      <div className="mt-1.5 text-center w-full px-0.5 flex flex-col items-center">
        <span
          className="text-xs font-medium text-slate-200 leading-snug line-clamp-2 max-w-[124px] break-words"
          title={data.name}
        >
          {data.name}
        </span>
        {data.description && (
          <span
            className="mt-0.5 text-[9px] leading-tight text-slate-400 max-w-[124px] line-clamp-2 break-words"
            title={data.description}
          >
            {data.description}
          </span>
        )}
        {data.subLabel && (
          <span className="text-[10px] text-cyan-300 font-mono font-medium max-w-[120px] truncate">
            {data.subLabel}
          </span>
        )}
        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-mono">
          <span className="truncate max-w-[90px]">{formatNodeType(data.nodeType)}</span>
        </div>
      </div>
    </div>
  );
}

const N8N_NODE_TYPES = {
  n8nNode: N8nFlowNodeRenderer,
  stickyNote: N8nStickyNoteRenderer,
};

const CHAT_NODE_ID = "8cf09691-b004-47e7-9df7-e837aec504d8";
const OPENCLAW_FORMAT_NODE_ID = "2f47be3b-91d7-4d22-9ac2-6c68ef1d20e1";
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
      disabled: Boolean(node.disabled),
      liveStatus: "idle",
      subLabel: "",
      description: describeWorkflowNode(node.name || "", node.type || ""),
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
      type: "default",
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
              type: "default",
              animated: false,
              style: { stroke: "#64748b", strokeWidth: 2 },
            });
          });
        });
      });
    });
  }

  return {
    allNodes: [...stickyNotes, ...flowNodes],
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

  const nodeTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const eventSourceRef = useRef<EventSource | null>(null);
  const traceCorrelationRef = useRef<Map<string, string>>(new Map());
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
      timeoutMs = 6000
    ) => {
      const targets = Array.isArray(target) ? target : [target];

      targets.forEach((targetKey) => {
        const existingTimer = nodeTimersRef.current.get(targetKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
      });

      setNodes((current) =>
        current.map((n) => {
          if (n.type !== "n8nNode") return n;
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
                ...(subLabel !== undefined ? { subLabel } : {}),
              },
            };
          }
          return n;
        })
      );

      if (status !== "idle" && timeoutMs > 0) {
        const resetTimer = setTimeout(() => {
          setNodes((current) =>
            current.map((n) => {
              if (n.type !== "n8nNode") return n;
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
        }, timeoutMs);

        targets.forEach((t) => nodeTimersRef.current.set(t, resetTimer));
      }
    },
    [setNodes]
  );

  // Xử lý sự kiện SSE từ Node backend
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
      const isGatewayChatStage = payload.stage === "openclaw.gateway.chat";
      const isFormatStage = payload.stage === "openclaw.format_response";
      const traceId = payload.trace_id;
      const correlationId = payload.correlation_id;
      if (traceId && correlationId) {
        traceCorrelationRef.current.set(traceId, correlationId);
        if (traceCorrelationRef.current.size > 500) {
          const oldestTrace = traceCorrelationRef.current.keys().next().value;
          if (oldestTrace) traceCorrelationRef.current.delete(oldestTrace);
        }
      }
      const requestGroupId = correlationId ||
        (traceId ? traceCorrelationRef.current.get(traceId) : undefined) ||
        traceId || payload.request_id;
      if (requestGroupId) {
        const traceGroup = traceId ? eventGroupsRef.current.get(traceId) : undefined;
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
        if (traceId && requestGroupId !== traceId) {
          eventGroupsRef.current.delete(traceId);
        }
        if (eventGroupsRef.current.size > 500) {
          const oldestGroup = Array.from(eventGroupsRef.current.entries())
            .sort((a, b) => a[1].updatedAt - b[1].updatedAt)[0];
          if (oldestGroup) eventGroupsRef.current.delete(oldestGroup[0]);
        }
      }

      // Only the explicit Node discriminator may route a Gateway lifecycle to Chat.
      if (isGatewayChatStage) {
        const isOrdinaryChat = payload.chat_kind === "ordinary";
        const targetNodeId = isOrdinaryChat ? CHAT_NODE_ID : "node-stage-unclassified";
        const chatLabel = isOrdinaryChat ? "Chat thường" : "openclaw.gateway.chat • chưa phân loại";
        if (eventName === "stage.started") {
          setNodeStatus(targetNodeId, "running", `${chatLabel} • đang chạy`, 120000);
        } else if (eventName === "stage.completed") {
          const duration = payload.duration_ms || 0;
          setNodeStatus(
            targetNodeId,
            duration > 1500 ? "slow" : "success",
            `${chatLabel} • ${getSafeOutcomeLabel(payload.outcome, "completed")} • ${duration}ms`,
            8000
          );
        } else if (eventName === "stage.failed") {
          setNodeStatus(
            targetNodeId,
            "error",
            `${chatLabel} • ${getSafeOutcomeLabel(payload.outcome, "failed")} • lỗi`,
            8000
          );
        }
        return;
      }
      if (eventName === "openclaw.gateway.chat") return;

      const serviceNodeId = isServiceStage
        ? mapServiceIdToNodeId(payload.service_id)
        : undefined;
      if (isServiceStage && !serviceNodeId) {
        const serviceLabel = typeof payload.service_id === "string" && payload.service_id
          ? `Service chưa ánh xạ: ${payload.service_id}`
          : "openclaw.service • thiếu service_id";
        if (eventName === "stage.started") {
          setNodeStatus("node-stage-unclassified", "running", serviceLabel, 120000);
        } else if (eventName === "stage.completed") {
          const duration = payload.duration_ms || 0;
          setNodeStatus(
            "node-stage-unclassified",
            duration > 1500 ? "slow" : "success",
            `${serviceLabel} • ${duration}ms`,
            8000
          );
        } else if (eventName === "stage.failed") {
          setNodeStatus("node-stage-unclassified", "error", `${serviceLabel} • lỗi`, 8000);
        }
        return;
      }

      // 2. Xử lý theo từng loại event chuẩn từ Node backend
      switch (eventName) {
        case "request.started": {
          const method = payload.method || "REQ";
          const route = payload.route || "";
          setNodeStatus(
            [
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
          const targetNodeId = isFormatStage
            ? payload.node_id || OPENCLAW_FORMAT_NODE_ID
            : serviceNodeId || mapStageToNodeId(payload.stage);
          const isUnclassified =
            targetNodeId === "node-stage-unclassified" ||
            (Array.isArray(targetNodeId) && targetNodeId.includes("node-stage-unclassified"));
          const label = isUnclassified
            ? `${payload.stage || "unknown"}`
            : serviceNodeId
            ? `${payload.service_id} • đang chạy`
            : (payload.stage || "running");
          setNodeStatus(targetNodeId, "running", label, 120000);
          break;
        }

        case "stage.completed": {
          const targetNodeId = isFormatStage
            ? payload.node_id || OPENCLAW_FORMAT_NODE_ID
            : serviceNodeId || mapStageToNodeId(payload.stage);
          const duration = payload.duration_ms || 0;
          const status = duration > 1500 ? "slow" : "success";
          const outcome = getSafeOutcomeLabel(payload.outcome, "completed");
          const label = isFormatStage
            ? `${payload.node_name || "Format OpenClaw response"} • ${outcome} • ${duration}ms`
            : serviceNodeId
            ? `${payload.service_id} • ${outcome} • ${duration}ms`
            : `${payload.stage || ""} (${duration}ms)`;
          setNodeStatus(targetNodeId, status, label, 8000);
          break;
        }

        case "stage.failed": {
          const targetNodeId = isFormatStage
            ? payload.node_id || OPENCLAW_FORMAT_NODE_ID
            : serviceNodeId || mapStageToNodeId(payload.stage);
          const duration = payload.duration_ms || 0;
          const outcome = getSafeOutcomeLabel(payload.outcome, "failed");
          const label = isFormatStage
            ? `${payload.node_name || "Format OpenClaw response"} • ${outcome} • ${duration}ms`
            : serviceNodeId
            ? `${payload.service_id} • ${outcome} • ${duration}ms`
            : `Lỗi ${payload.status_code || 500}: ${payload.stage || ""}`;
          setNodeStatus(targetNodeId, "error", label, 8000);
          if (!serviceNodeId && !isFormatStage) {
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
          const statusCode = payload.status_code || 200;
          const isError = statusCode >= 400;
          const duration = payload.duration_ms || 0;
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
    [setNodeStatus]
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
        traceCorrelationRef.current.clear();
        eventGroupsRef.current.clear();
        setNodes((current) =>
          current.map((n) =>
            n.type === "n8nNode"
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
    [processIncomingSSEEvent, setNodes]
  );

  // Cập nhật graph khi có dữ liệu mới
  useEffect(() => {
    if (!graph) return;
    const { allNodes, flowEdges } = convertNormalizedGraphToFlow(graph);

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

    setEdges(flowEdges);

    // The remote graph can arrive after the fallback graph; refit so augmented service nodes stay visible.
    const fitFrame = requestAnimationFrame(() => {
      reactFlowInstanceRef.current?.fitView({ padding: 0.15, duration: 250 });
    });
    return () => cancelAnimationFrame(fitFrame);
  }, [graph, setNodes, setEdges]);

  // Kết nối EventSource SSE tới Next.js Route Handler
  useEffect(() => {
    if (!enableRealtime) return;

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
      nodeTimersRef.current.forEach((t) => clearTimeout(t));
      nodeTimersRef.current.clear();
    };
  }, [enableRealtime, sseUrl, reconnectNonce, processIncomingSSEEvent]);

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
            .n8n-node--running {
              animation: n8n-node-pulse 0.8s ease-in-out infinite !important;
              box-shadow: 0 0 22px rgba(34, 211, 238, 0.85) !important;
              border-color: #22d3ee !important;
              z-index: 20 !important;
            }
            .n8n-node--success {
              box-shadow: 0 0 20px rgba(34, 197, 94, 0.85) !important;
              border-color: #22c55e !important;
              transition: box-shadow 0.3s ease, border-color 0.3s ease;
            }
            .n8n-node--slow {
              box-shadow: 0 0 20px rgba(234, 179, 8, 0.85) !important;
              border-color: #eab308 !important;
              transition: box-shadow 0.3s ease, border-color 0.3s ease;
            }
            .n8n-node--error {
              box-shadow: 0 0 20px rgba(239, 68, 68, 0.9) !important;
              border-color: #ef4444 !important;
              transition: box-shadow 0.3s ease, border-color 0.3s ease;
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
