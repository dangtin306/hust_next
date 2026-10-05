"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  BookOpen,
  Code2,
  Cpu,
  FileCode,
  FileText,
  FolderTree,
  Info,
  Radio,
  RefreshCw,
  Shield,
  Workflow,
  X,
  Zap,
  Maximize2,
  Sparkles,
  Copy,
  Check,
  Layers,
} from "lucide-react";

// ==========================================
// CONFIG API DOMAIN MẸ
// ==========================================
const BASE_DOMAIN = "https://node_md.hust.media";
const MAPS_MAIN_GRAPH_URL = `${BASE_DOMAIN}/openclaw/workflow/maps_main/graph`;
const MAPS_MAIN_FILE_URL = `${BASE_DOMAIN}/openclaw/workflow/maps_main/file`;

// ==========================================
// HÀM TỰ ĐỘNG CĂN CHỈNH ĐỒ THỊ THEO CHUẨN .MD (AUTO-LAYOUT ENGINE)
// Tự sửa, tự căn giữa, cân đối tuyệt đối cho bất kỳ số lượng workspace nào
// ==========================================
export function autoLayoutTopology(rawNodes: Node[], rawEdges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  if (!rawNodes || rawNodes.length === 0) return { nodes: [], edges: [] };

  // 1. Phân loại các node
  const workspaceNodes: Node[] = [];
  const sessionAndFileNodes: Node[] = [];
  const pipelineNodes: Node[] = [];
  let agentNode: Node | null = null;
  let soulNode: Node | null = null;
  let identityNode: Node | null = null;
  let headerTier1: Node | null = null;
  let headerTier2: Node | null = null;

  rawNodes.forEach((node) => {
    if (node.id === "header-tier1") {
      headerTier1 = node;
    } else if (node.id === "header-tier2") {
      headerTier2 = node;
    } else if (node.id === "vault-agents-md") {
      agentNode = node;
    } else if (node.id === "vault-soul-md") {
      soulNode = node;
    } else if (node.id === "vault-identity-md") {
      identityNode = node;
    } else if (
      node.data?.category === "workspace" ||
      node.id.startsWith("vault-ws-")
    ) {
      workspaceNodes.push(node);
    } else if (
      node.data?.category === "session" ||
      node.id.startsWith("vault-chat-") ||
      node.id.startsWith("vault-file-")
    ) {
      sessionAndFileNodes.push(node);
    } else if (
      node.type === "pipelineNode" ||
      node.id.startsWith("pipe-")
    ) {
      pipelineNodes.push(node);
    } else {
      workspaceNodes.push(node);
    }
  });

  // Thứ tự ưu tiên sắp xếp workspace nếu có
  const preferredOrder = ["workspace_backend", "workspace_media", "workspace_tech", "workspace_openclaw"];
  workspaceNodes.sort((a, b) => {
    const nameA = (a.data?.label || a.id) as string;
    const nameB = (b.data?.label || b.id) as string;
    const ia = preferredOrder.indexOf(nameA);
    const ib = preferredOrder.indexOf(nameB);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return nameA.localeCompare(nameB);
  });

  // 2. Tính toán lưới tọa độ tự động chuẩn xác tuyệt đối cho Tầng 1
  const nWs = Math.max(workspaceNodes.length, 1);
  const startX = 60;
  const colSpacingX = 310; // Card width 260 + gap 50 = 310
  const cardWidth = 260;

  // Tổng chiều rộng của toàn bộ dải workspace (từ mép trái cột 0 đến mép phải cột cuối)
  const totalVaultSpan = (nWs - 1) * colSpacingX + cardWidth;
  // Tâm đối xứng hình học chính xác = startX + totalVaultSpan / 2
  // Với 4 cột: 60 + ((3 * 310 + 260) / 2) = 60 + 595 = 655
  const vaultCenterX = startX + totalVaultSpan / 2;

  // Tầng 2 (Pipeline Engine) luôn đặt bên phải Tầng 1 với khoảng cách an toàn 160px
  const tier2X = Math.max(startX + totalVaultSpan + 160, 1400);

  const positionedNodes: Node[] = [];

  // A. Header Tầng 1 (Căn giữa toàn bộ cụm Knowledge Vault)
  if (headerTier1) {
    positionedNodes.push({
      ...headerTier1,
      position: { x: Math.round(vaultCenterX - 180), y: -60 },
    });
  }

  // B. Agent Node chính (AGENTS.md - Đặt tại chính tâm đối xứng hàng 1)
  const agentsX = Math.round(vaultCenterX - cardWidth / 2); // 655 - 130 = 525
  if (agentNode) {
    positionedNodes.push({
      ...agentNode,
      position: { x: agentsX, y: 60 },
    });
  }

  // C. SOUL.md (Căn bên trái AGENTS.md với khoảng cách 50px)
  if (soulNode) {
    const soulX = agentsX - cardWidth - 50; // 525 - 260 - 50 = 215
    positionedNodes.push({
      ...soulNode,
      position: { x: soulX, y: 60 },
    });
  }

  // D. IDENTITY.md (Căn bên phải AGENTS.md với khoảng cách 50px)
  if (identityNode) {
    const identityX = agentsX + cardWidth + 50; // 525 + 260 + 50 = 835
    positionedNodes.push({
      ...identityNode,
      position: { x: identityX, y: 60 },
    });
  }

  // E. Workspaces (Hàng 2: Y = 220, các cột tại startX + idx * colSpacingX)
  const wsIndexMap = new Map<string, number>();
  workspaceNodes.forEach((ws, idx) => {
    const posX = startX + idx * colSpacingX; // 60, 370, 680, 990
    wsIndexMap.set(ws.id, idx);
    positionedNodes.push({
      ...ws,
      position: { x: posX, y: 220 },
    });
  });

  // F. Session Chats & Files (Hàng 3: Xếp thẳng hàng dọc dưới từng workspace, Y bắt đầu từ 380, CỰC KỲ AN TOÀN KHÔNG BAO GIỜ BỊ ĐÈ)
  const wsChildCountMap = new Map<number, number>();
  sessionAndFileNodes.forEach((child) => {
    const parentEdge = rawEdges.find((e) => e.target === child.id);
    let colIdx = 0;
    if (parentEdge && wsIndexMap.has(parentEdge.source)) {
      colIdx = wsIndexMap.get(parentEdge.source)!;
    } else {
      for (const [wsId, idx] of wsIndexMap.entries()) {
        const rawName = wsId.replace("vault-ws-", "");
        if (child.id.includes(rawName)) {
          colIdx = idx;
          break;
        }
      }
    }

    const currentCount = wsChildCountMap.get(colIdx) || 0;
    wsChildCountMap.set(colIdx, currentCount + 1);

    const childX = startX + colIdx * colSpacingX;
    // Node đầu tiên (currentCount = 0): Y = 380 (cách card workspace 220+100=320 một khoảng 60px an toàn)
    // Node tiếp theo (currentCount = 1): Y = 380 + 1 * 130 = 510
    const childY = 380 + currentCount * 130;

    positionedNodes.push({
      ...child,
      position: { x: childX, y: childY },
    });
  });

  // G. Header Tầng 2
  if (headerTier2) {
    positionedNodes.push({
      ...headerTier2,
      position: { x: tier2X - 45, y: -60 },
    });
  }

  // H. Pipeline Nodes Tầng 2 (Thẳng hàng X = tier2X, Y = 60, 190, 320, 450, 580)
  const pipelineOrder = [
    "pipe-webhook",
    "pipe-resolver",
    "pipe-openclaw",
    "pipe-media-tools",
    "pipe-sse-broadcast",
  ];

  pipelineNodes.sort((a, b) => {
    const ia = pipelineOrder.indexOf(a.id);
    const ib = pipelineOrder.indexOf(b.id);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.id.localeCompare(b.id);
  });

  pipelineNodes.forEach((p, idx) => {
    positionedNodes.push({
      ...p,
      position: { x: tier2X, y: 60 + idx * 130 },
    });
  });

  // 3. Chuẩn hóa Edges: mượt mà, định tuyến chính xác giữa các handle
  const updatedEdges: Edge[] = rawEdges.map((edge) => {
    const isBridge = edge.id.includes("bridge") || (edge.source.startsWith("pipe-") && edge.target.startsWith("vault-"));

    if (isBridge) {
      return {
        ...edge,
        type: "smoothstep",
        sourceHandle: "source-left",
        targetHandle: "target-right",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: edge.id.includes("sse") ? "#06b6d4" : "#f59e0b",
        },
        style: {
          stroke: edge.id.includes("sse") ? "#06b6d4" : "#f59e0b",
          strokeDasharray: "5 5",
          strokeWidth: 2,
        },
      };
    }

    if (edge.source === "vault-agents-md") {
      if (edge.target === "vault-soul-md") {
        return {
          ...edge,
          type: "smoothstep",
          sourceHandle: "source-left",
          targetHandle: "target-right",
          style: { stroke: "#a855f7", strokeDasharray: "4 4", strokeWidth: 2 },
        };
      }
      if (edge.target === "vault-identity-md") {
        return {
          ...edge,
          type: "smoothstep",
          sourceHandle: "source-right",
          targetHandle: "target-left",
          style: { stroke: "#a855f7", strokeDasharray: "4 4", strokeWidth: 2 },
        };
      }
      return {
        ...edge,
        type: "smoothstep",
        sourceHandle: "source-bottom",
        targetHandle: "target-top",
        style: { stroke: "#a855f7", strokeWidth: 2 },
      };
    }

    if (edge.source.startsWith("vault-ws-")) {
      return {
        ...edge,
        type: "smoothstep",
        sourceHandle: "source-bottom",
        targetHandle: "target-top",
        style: { stroke: "#10b981", strokeWidth: 2 },
      };
    }

    if (edge.source.startsWith("pipe-")) {
      return {
        ...edge,
        type: "smoothstep",
        sourceHandle: "source-bottom",
        targetHandle: "target-top",
        style: { stroke: "#6366f1", strokeWidth: 2.5 },
      };
    }

    return {
      ...edge,
      type: "smoothstep",
    };
  });

  return { nodes: positionedNodes, edges: updatedEdges };
}

// ==========================================
// CUSTOM NODE COMPONENTS
// ==========================================

function VaultNode({ data, selected }: { data: any; selected?: boolean }) {
  const isSelected = selected;
  const bgClass =
    data.category === "agent"
      ? "border-purple-500/80 bg-purple-950/40 text-purple-200"
      : data.category === "workspace"
      ? "border-emerald-500/80 bg-emerald-950/40 text-emerald-200"
      : data.category === "session"
      ? "border-cyan-500/80 bg-cyan-950/40 text-cyan-200"
      : "border-slate-600 bg-slate-900/60 text-slate-300";

  const badgeColor =
    data.category === "agent"
      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
      : data.category === "workspace"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : data.category === "session"
      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
      : "bg-slate-700/50 text-slate-300 border-slate-600";

  return (
    <div
      className={`w-[260px] rounded-xl border p-3.5 shadow-xl backdrop-blur-md transition-all duration-200 relative ${bgClass} ${
        isSelected ? "ring-2 ring-purple-400 shadow-purple-500/30 shadow-2xl scale-[1.02]" : "hover:border-slate-400"
      }`}
    >
      {/* Ẩn các chấm kết nối thô kệch, chỉ giữ neo kết nối vô hình để dây nối bắt điểm chuẩn xác và viền thẻ sạch bóng */}
      <Handle type="target" position={Position.Top} id="target-top" className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="target" position={Position.Left} id="target-left" style={{ top: "35%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="source" position={Position.Left} id="source-left" style={{ top: "65%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="target" position={Position.Right} id="target-right" style={{ top: "35%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="source" position={Position.Right} id="source-right" style={{ top: "65%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          {data.category === "agent" ? (
            <Shield className="h-4 w-4 shrink-0 text-purple-400" />
          ) : data.category === "workspace" ? (
            <FolderTree className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : data.category === "session" ? (
            <FileText className="h-4 w-4 shrink-0 text-cyan-400" />
          ) : (
            <FileCode className="h-4 w-4 shrink-0 text-slate-400" />
          )}
          <span className="font-semibold text-xs tracking-wide text-white truncate max-w-[140px]">
            {data.label}
          </span>
        </div>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${badgeColor}`}>
          {data.badge || data.math}
        </span>
      </div>

      {data.description && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300 line-clamp-2">
          {data.description}
        </p>
      )}

      {/* Hiển thị danh sách các tệp .md mà workspace đang chứa */}
      {data.category === "workspace" && data.files && Array.isArray(data.files) && data.files.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <div className="text-[10px] font-semibold text-emerald-400 mb-1 flex items-center gap-1">
            <FileCode className="h-3 w-3" />
            <span>Tài liệu .md ({data.files.length}):</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {data.files.map((fileName: string) => (
              <span
                key={fileName}
                className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-emerald-300 border border-emerald-500/30"
              >
                📄 {fileName}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.path && (
        <div className="mt-2 text-[10px] font-mono text-slate-400 truncate bg-black/40 px-2 py-1 rounded border border-white/5">
          {data.path}
        </div>
      )}
    </div>
  );
}

function PipelineNode({ data, selected }: { data: any; selected?: boolean }) {
  const isSelected = selected;
  return (
    <div
      className={`w-[270px] rounded-xl border border-indigo-500/80 bg-indigo-950/40 p-3.5 shadow-xl backdrop-blur-md transition-all duration-200 relative ${
        isSelected ? "ring-2 ring-indigo-400 shadow-indigo-500/30 shadow-2xl scale-[1.02]" : "hover:border-indigo-400"
      }`}
    >
      <Handle type="target" position={Position.Top} id="target-top" className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="target" position={Position.Left} id="target-left" style={{ top: "35%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="source" position={Position.Left} id="source-left" style={{ top: "65%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="target" position={Position.Right} id="target-right" style={{ top: "35%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />
      <Handle type="source" position={Position.Right} id="source-right" style={{ top: "65%" }} className="!opacity-0 !w-2 !h-2 !border-0 pointer-events-none" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          {data.icon === "webhook" ? (
            <Radio className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
          ) : data.icon === "code" ? (
            <Code2 className="h-4 w-4 shrink-0 text-sky-400" />
          ) : data.icon === "ai" ? (
            <Cpu className="h-4 w-4 shrink-0 text-pink-400" />
          ) : (
            <Workflow className="h-4 w-4 shrink-0 text-indigo-400" />
          )}
          <span className="font-semibold text-xs tracking-wide text-white truncate max-w-[150px]">
            {data.label}
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
          {data.badge}
        </span>
      </div>

      {data.description && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-indigo-200 line-clamp-2">
          {data.description}
        </p>
      )}

      {data.subtext && (
        <div className="mt-2 text-[10px] font-mono text-indigo-300 truncate bg-black/40 px-2 py-1 rounded border border-white/5">
          {data.subtext}
        </div>
      )}
    </div>
  );
}

function SectionLabelNode({ data }: { data: any }) {
  return (
    <div className="w-[360px] rounded-2xl border border-white/10 bg-black/60 p-3.5 shadow-2xl backdrop-blur-xl text-center">
      <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-wider uppercase text-white">
        {data.icon === "vault" ? (
          <BookOpen className="h-4 w-4 text-purple-400 shrink-0" />
        ) : (
          <Zap className="h-4 w-4 text-amber-400 shrink-0" />
        )}
        <span>{data.title}</span>
      </div>
      <p className="mt-1 text-[11px] text-slate-400 leading-snug">{data.subtitle}</p>
    </div>
  );
}

const nodeTypes = {
  vaultNode: VaultNode,
  pipelineNode: PipelineNode,
  sectionLabelNode: SectionLabelNode,
};

// ==========================================
// FALLBACK DATA DỰ PHÒNG CHUẨN
// ==========================================
const INITIAL_FALLBACK_NODES: Node[] = [
  {
    id: "header-tier1",
    type: "sectionLabelNode",
    position: { x: 475, y: -60 },
    data: {
      title: "TẦNG 1: Markdown Knowledge Vault",
      subtitle: "Không gian tri thức toán học K(c) gồm 4 domain workspaces trong OpenClaw",
      icon: "vault",
    },
    selectable: false,
  },
  {
    id: "header-tier2",
    type: "sectionLabelNode",
    position: { x: 1355, y: -60 },
    data: {
      title: "TẦNG 2: n8n Execution Engine",
      subtitle: "Pipeline thực thi động 5 node nạp động file .md qua Dynamic Path Resolution",
      icon: "pipeline",
    },
    selectable: false,
  },
  {
    id: "vault-agents-md",
    type: "vaultNode",
    position: { x: 525, y: 60 },
    data: {
      label: "AGENTS.md",
      category: "agent",
      badge: "Global f_A",
      math: "f_A(A)",
      description: "Định nghĩa vai trò toàn cục, triết lý vận hành & toán tử hợp Monoid.",
      path: "/workspace_maps_main/AGENTS.md",
    },
  },
];

const INITIAL_FALLBACK_EDGES: Edge[] = [];

// ==========================================
// FLOW INNER COMPONENT (HỖ TRỢ FITVIEW & CONTROLS)
// ==========================================
function MapsMainCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_FALLBACK_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_FALLBACK_EDGES);
  const [activeFilter, setActiveFilter] = useState<"all" | "vault" | "pipeline">("all");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const { fitView } = useReactFlow();

  // Load dữ liệu từ domain mẹ và tự động căn chỉnh
  const loadGraphFromDomain = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(MAPS_MAIN_GRAPH_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const rawNodes: Node[] = json.data?.nodes || json.graph?.nodes || json.nodes || [];
      const rawEdges: Edge[] = json.data?.edges || json.graph?.edges || json.edges || [];

      if (rawNodes.length > 0) {
        const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayoutTopology(rawNodes, rawEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setLastSyncTime(new Date().toLocaleTimeString());

        setTimeout(() => {
          fitView({ padding: 0.18, duration: 400 });
        }, 100);
      }
    } catch (err) {
      console.warn("Could not load from parent domain, applying fallback:", err);
    } finally {
      setIsLoading(false);
    }
  }, [setNodes, setEdges, fitView]);

  useEffect(() => {
    loadGraphFromDomain();
  }, [loadGraphFromDomain]);

  // Nút người dùng click để tự động căn giữa lại toàn bộ sơ đồ
  const handleReAlign = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayoutTopology(nodes, edges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => {
      fitView({ padding: 0.18, duration: 400 });
    }, 50);
  }, [nodes, edges, setNodes, setEdges, fitView]);

  // Khi click vào node, load nội dung file .md trực tiếp từ API domain mẹ
  const onNodeClick = useCallback(async (_: any, node: Node) => {
    if (node.type === "sectionLabelNode") return;
    setSelectedNode(node);
    setFileContent(null);
    setCopied(false);

    const relativePath = node.data?.path as string | undefined;
    if (relativePath) {
      try {
        const url = `${MAPS_MAIN_FILE_URL}?path=${encodeURIComponent(relativePath)}`;
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const content = json.content || json.data?.content;
          if (content) {
            setFileContent(content);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch file content:", err);
      }
    }
    setFileContent((node.data?.content as string) || null);
  }, []);

  const handleCopyContent = useCallback(() => {
    if (!fileContent) return;
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fileContent]);

  const filteredNodes = useMemo(() => {
    if (activeFilter === "vault") {
      return nodes.filter(
        (n) => n.id.startsWith("vault-") || n.id === "header-tier1"
      );
    }
    if (activeFilter === "pipeline") {
      return nodes.filter(
        (n) => n.id.startsWith("pipe-") || n.id === "header-tier2"
      );
    }
    return nodes;
  }, [nodes, activeFilter]);

  const filteredEdges = useMemo(() => {
    const visibleIds = new Set(filteredNodes.map((n) => n.id));
    return edges.filter(
      (e) => visibleIds.has(e.source) && visibleIds.has(e.target)
    );
  }, [edges, filteredNodes]);

  const stats = useMemo(() => {
    const wsCount = nodes.filter((n) => n.data?.category === "workspace").length;
    const sessionCount = nodes.filter((n) => n.data?.category === "session").length;
    const pipeCount = nodes.filter((n) => n.type === "pipelineNode").length;
    return { wsCount, sessionCount, pipeCount };
  }, [nodes]);

  return (
    <div className="relative h-[88vh] w-full rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden font-sans">
      {/* HEADER BAR */}
      <div className="absolute top-0 left-0 right-0 z-10 flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/30 border border-indigo-500/50 text-indigo-400">
            <Workflow className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Bản đồ Tổng thể Tri thức & Thực thi (Maps Main)
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/30">
                Auto-Align Live
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span>Domain: <strong className="text-indigo-400">node_md.hust.media</strong></span>
              <span>&bull;</span>
              <span>{stats.wsCount} Workspaces</span>
              <span>&bull;</span>
              <span>{stats.sessionCount} Sessions</span>
              <span>&bull;</span>
              <span>{stats.pipeCount} Pipeline Nodes</span>
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-800 bg-slate-900/90 p-0.5 text-xs">
            <button
              onClick={() => setActiveFilter("all")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                activeFilter === "all"
                  ? "bg-indigo-600 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Toàn cảnh
            </button>
            <button
              onClick={() => setActiveFilter("vault")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                activeFilter === "vault"
                  ? "bg-purple-600 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Tri thức (.md)
            </button>
            <button
              onClick={() => setActiveFilter("pipeline")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                activeFilter === "pipeline"
                  ? "bg-amber-600 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pipeline n8n
            </button>
          </div>

          {/* NÚT TỰ CĂN CHỈNH */}
          <button
            onClick={handleReAlign}
            title="Tự động tính toán và căn chỉnh đều toàn bộ các node"
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/60 px-2.5 py-1 text-xs text-indigo-300 hover:text-white hover:bg-indigo-900/80 transition-colors shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Tự căn chỉnh
          </button>

          <button
            onClick={loadGraphFromDomain}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            Sync
          </button>

          <button
            onClick={() => fitView({ padding: 0.18, duration: 300 })}
            title="Căn giữa toàn màn hình"
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/90 p-1 text-slate-300 hover:text-white transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* REACT FLOW CANVAS */}
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelectedNode(null)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.2}
        maxZoom={1.8}
        className="pt-14"
      >
        <Background color="#334155" gap={20} size={1} variant={BackgroundVariant.Dots} />
        <Controls className="!bg-slate-900 !border-slate-800 !text-white [&>button]:!border-slate-800 [&>button]:!fill-white" />
        <MiniMap
          nodeColor={(node) => {
            if (node.id.startsWith("vault-")) return "#a855f7";
            if (node.id.startsWith("pipe-")) return "#6366f1";
            return "#64748b";
          }}
          className="!bg-slate-900/90 !border-slate-800 rounded-lg overflow-hidden"
          maskColor="rgba(15, 23, 42, 0.7)"
        />
      </ReactFlow>

      {/* INSPECTOR DRAWER ĐỌC NỘI DUNG FILE .MD */}
      {selectedNode && (
        <div className="absolute right-4 top-16 bottom-4 z-20 w-80 md:w-96 rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Chi tiết Thực thể Tri thức (.md)
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-3 overflow-y-auto max-h-[55vh] pr-1">
              <div>
                <div className="text-[11px] font-medium text-slate-400">Tên Node</div>
                <div className="text-sm font-semibold text-white">{selectedNode.data.label}</div>
              </div>

              {selectedNode.data.math && (
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Toán học ánh xạ</div>
                  <div className="inline-block mt-0.5 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs border border-indigo-500/30">
                    {selectedNode.data.math}
                  </div>
                </div>
              )}

              {selectedNode.data.description && (
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Mô tả</div>
                  <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">
                    {selectedNode.data.description}
                  </p>
                </div>
              )}

              {selectedNode.data.path && (
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Tệp tin .md liên kết</div>
                  <div className="mt-0.5 text-xs font-mono text-emerald-400 bg-black/50 px-2 py-1.5 rounded border border-emerald-500/20 break-all">
                    {selectedNode.data.path}
                  </div>
                </div>
              )}

              {/* KHỐI NỘI DUNG MARKDOWN THỰC TẾ CỦA FILE */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>Nội dung tệp (.md preview)</span>
                  {fileContent && (
                    <button
                      onClick={handleCopyContent}
                      className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  )}
                </div>
                {fileContent ? (
                  <pre className="text-[11px] font-mono text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                    {fileContent}
                  </pre>
                ) : (
                  <div className="text-[11px] italic text-slate-500 bg-slate-950/50 p-2 rounded border border-slate-800">
                    Đang nạp nội dung file từ API domain mẹ...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <button
              onClick={() => setSelectedNode(null)}
              className="w-full rounded-lg bg-slate-800 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Đóng bảng chi tiết
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MapsMainCanvas() {
  return (
    <ReactFlowProvider>
      <MapsMainCanvasInner />
    </ReactFlowProvider>
  );
}
