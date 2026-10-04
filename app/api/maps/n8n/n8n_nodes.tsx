"use client";

import React from "react";
import {
  ArrowLeftRight,
  Boxes,
  Clock,
  Code2,
  GitBranch,
  GitFork,
  Globe,
  HelpCircle,
  Radio,
  Terminal,
  Zap,
} from "lucide-react";
import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";

export type LiveNodeStatus = "idle" | "running" | "success" | "slow" | "error";

export type FlowNodeData = {
  name: string;
  nodeType: string;
  typeVersion?: number;
  parameters?: Record<string, unknown>;
  sourceHandleIds?: string[];
  targetHandleIds?: string[];
  disabled?: boolean;
  liveStatus: LiveNodeStatus;
  signalVersion?: number;
  subLabel?: string;
  description?: string;
  visualScope?: "architecture";
  [key: string]: unknown;
};

export type StickyNoteData = {
  content: string;
  color: number;
  width: number;
  height: number;
  [key: string]: unknown;
};

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

const getNodeCategory = (nodeType = "", name = "", nodeId = "") => {
  if (nodeType === "node-backend-architecture") {
    return { icon: Boxes, bg: "bg-[#7357d9]" };
  }
  // Render the final OpenClaw workflow nodes by their n8n node type, never by label text.
  if (
    nodeId === "b18073a2-c1a5-4ef4-a803-8e03ad67b3d1" &&
    nodeType === "n8n-nodes-base.if"
  ) {
    return { icon: GitFork, bg: "bg-[#2ca34a]" };
  }
  if (
    [
      "a8b336c8-0af9-4e0e-a87e-2421c8aa0001",
      "a8b336c8-0af9-4e0e-a87e-2421c8aa0003",
    ].includes(nodeId) && nodeType === "n8n-nodes-base.httpRequest"
  ) {
    return { icon: Globe, bg: "bg-[#2867b2]" };
  }
  if (
    [
      "2f47be3b-91d7-4d22-9ac2-6c68ef1d20e1",
      "a8b336c8-0af9-4e0e-a87e-2421c8aa0002",
      "a8b336c8-0af9-4e0e-a87e-2421c8aa0004",
    ].includes(nodeId) && nodeType === "n8n-nodes-base.code"
  ) {
    return { icon: Code2, bg: "bg-[#f59e0b]" };
  }

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

export const describeWorkflowNode = (name = "", nodeType = "") => {
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

function N8nFlowNodeRenderer({ id, data }: NodeProps<Node<FlowNodeData>>) {
  const { icon: NodeIcon, bg: iconBg } = getNodeCategory(data.nodeType, data.name, id);
  const liveStatus = data.liveStatus || "idle";
  const httpMethod = typeof data.parameters?.method === "string"
    ? data.parameters.method.trim().toUpperCase()
    : "";
  const httpUrl = typeof data.parameters?.url === "string"
    ? data.parameters.url.trim()
    : "";
  const httpRequestSummary =
    data.nodeType === "n8n-nodes-base.httpRequest" && httpMethod && httpUrl
      ? `${httpMethod}: ${httpUrl}`
      : "";
  const sourceHandleIds = data.sourceHandleIds?.length
    ? data.sourceHandleIds
    : ["main-0"];
  const targetHandleIds = data.targetHandleIds?.length
    ? data.targetHandleIds
    : ["main-0"];
  const isFormatDecision =
    id === "b18073a2-c1a5-4ef4-a803-8e03ad67b3d1" &&
    data.nodeType === "n8n-nodes-base.if";
  const getHandlePositionStyle = (index: number, count: number) =>
    count > 1 ? { top: `${((index + 1) / (count + 1)) * 100}%` } : undefined;

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
        return "bg-cyan-400 n8n-node-signal-ping";
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
      className={`relative group flex flex-col items-center transition-transform duration-200 ${
        liveStatus === "running" ? "scale-105" : ""
      }`}
    >
      <div
        key={data.signalVersion ?? 0}
        className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center shadow-lg relative transition-all duration-300 ${getBorderStatusClass()}`}
      >
        {targetHandleIds.map((handleId, index) => (
          <Handle
            key={`target-${handleId}`}
            type="target"
            position={Position.Left}
            id={handleId}
            style={getHandlePositionStyle(index, targetHandleIds.length)}
            className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-950 transition-transform group-hover:scale-125"
          />
        ))}

        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-105`}
        >
          <NodeIcon className="w-6 h-6 stroke-[2.2]" />
        </div>

        {sourceHandleIds.map((handleId, index) => {
          const handlePositionStyle = getHandlePositionStyle(index, sourceHandleIds.length);
          const outputLabel = isFormatDecision
            ? handleId === "main-0" ? "true" : handleId === "main-1" ? "false" : undefined
            : undefined;

          return (
            <React.Fragment key={`source-${handleId}`}>
              <Handle
                type="source"
                position={Position.Right}
                id={handleId}
                style={handlePositionStyle}
                className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-950 transition-transform group-hover:scale-125"
              />
              {outputLabel && (
                <span
                  className="absolute z-10 -right-7 -translate-y-1/2 pointer-events-none text-xs leading-none font-semibold text-slate-200"
                  style={handlePositionStyle}
                >
                  {outputLabel}
                </span>
              )}
            </React.Fragment>
          );
        })}

        {glowDotColor && (
          <span
            className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full ${glowDotColor} border-2 border-slate-950 shadow-sm`}
          />
        )}
      </div>

      <div className="nodrag nopan select-text mt-1.5 text-center w-full px-0.5 flex flex-col items-center">
        {data.visualScope === "architecture" && (
          <span className="text-[10px] uppercase tracking-wide text-violet-300">Node backend · architecture</span>
        )}
        <span
          className="text-[17px] font-medium text-slate-200 leading-5 line-clamp-2 max-w-[124px] break-words"
          title={data.name}
        >
          {data.name}
        </span>
        {data.description && (
          <span
            className="mt-0.5 text-[13px] leading-[14px] text-slate-400 max-w-[124px] line-clamp-2 break-words"
            title={data.description}
          >
            {data.description}
          </span>
        )}
        {httpRequestSummary && (
          <span
            className="mt-0.5 text-[13px] leading-[14px] text-sky-300 font-mono max-w-[124px] truncate"
            title={httpRequestSummary}
          >
            {httpRequestSummary}
          </span>
        )}
        {data.subLabel && (
          <span className="text-sm leading-4 text-cyan-300 font-mono font-medium max-w-[120px] truncate">
            {data.subLabel}
          </span>
        )}
        <div className="flex items-center gap-1 mt-0.5 text-sm leading-4 text-slate-400 font-mono">
          <span className="truncate max-w-[90px]">{formatNodeType(data.nodeType)}</span>
        </div>
      </div>
    </div>
  );
}

export const N8N_NODE_TYPES = {
  n8nNode: N8nFlowNodeRenderer,
  architectureNode: N8nFlowNodeRenderer,
  stickyNote: N8nStickyNoteRenderer,
};
