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
} from "lucide-react";

// ==========================================
// CONFIG API DOMAIN MẸ
// ==========================================
const BASE_DOMAIN = "https://node_md.hust.media";
const MAPS_MAIN_GRAPH_URL = `${BASE_DOMAIN}/openclaw/workflow/maps_main/graph`;
const MAPS_MAIN_FILE_URL = `${BASE_DOMAIN}/openclaw/workflow/maps_main/file`;

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
      className={`w-[260px] rounded-xl border p-3.5 shadow-xl backdrop-blur-md transition-all duration-200 ${bgClass} ${
        isSelected ? "ring-2 ring-purple-400 shadow-purple-500/30 shadow-2xl scale-[1.02]" : "hover:border-slate-400"
      }`}
    >
      {/* HANDLES ON ALL 4 SIDES TO PREVENT LINE TANGLING */}
      <Handle type="target" position={Position.Top} id="target-top" className="!bg-purple-400 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="!bg-emerald-400 !w-2.5 !h-2.5" />
      <Handle type="target" position={Position.Left} id="target-left" className="!bg-purple-400 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Left} id="source-left" className="!bg-purple-400 !w-2.5 !h-2.5" />
      <Handle type="target" position={Position.Right} id="target-right" className="!bg-emerald-400 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} id="source-right" className="!bg-emerald-400 !w-2.5 !h-2.5" />

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
      className={`w-[270px] rounded-xl border border-indigo-500/80 bg-indigo-950/40 p-3.5 shadow-xl backdrop-blur-md transition-all duration-200 ${
        isSelected ? "ring-2 ring-indigo-400 shadow-indigo-500/30 shadow-2xl scale-[1.02]" : "hover:border-indigo-400"
      }`}
    >
      {/* HANDLES */}
      <Handle type="target" position={Position.Top} id="target-top" className="!bg-indigo-400 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className="!bg-indigo-400 !w-2.5 !h-2.5" />
      <Handle type="target" position={Position.Left} id="target-left" className="!bg-amber-400 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Left} id="source-left" className="!bg-amber-400 !w-2.5 !h-2.5" />
      <Handle type="target" position={Position.Right} id="target-right" className="!bg-indigo-400 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} id="source-right" className="!bg-indigo-400 !w-2.5 !h-2.5" />

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
    <div className="w-[340px] rounded-2xl border border-white/10 bg-black/60 p-3.5 shadow-2xl backdrop-blur-xl text-center">
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
// FALLBACK DATA (CÂN ĐỐI)
// ==========================================

const FALLBACK_NODES: Node[] = [
  {
    id: "header-tier1",
    type: "sectionLabelNode",
    position: { x: 340, y: -80 },
    data: {
      title: "TẦNG 1: Markdown Knowledge Vault",
      subtitle: "Không gian tri thức toán học c ∈ W ∈ A gắn với các file .md trong OpenClaw",
      icon: "vault",
    },
    selectable: false,
  },
  {
    id: "header-tier2",
    type: "sectionLabelNode",
    position: { x: 1040, y: -80 },
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
    position: { x: 380, y: 40 },
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

const FALLBACK_EDGES: Edge[] = [];

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function MapsMainCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(FALLBACK_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(FALLBACK_EDGES);
  const [activeFilter, setActiveFilter] = useState<"all" | "vault" | "pipeline">("all");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Hàm load dữ liệu từ domain mẹ
  const loadGraphFromDomain = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(MAPS_MAIN_GRAPH_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.graph) {
        setNodes(json.graph.nodes || []);
        setEdges(json.graph.edges || []);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn("Could not load from parent domain, using fallback:", err);
    } finally {
      setIsLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    loadGraphFromDomain();
  }, [loadGraphFromDomain]);

  // Khi click vào node, load nội dung file .md trực tiếp từ API domain mẹ
  const onNodeClick = useCallback(async (_: any, node: Node) => {
    if (node.type === "sectionLabelNode") return;
    setSelectedNode(node);
    setFileContent(null);

    const relativePath = node.data?.path as string | undefined;
    if (relativePath) {
      try {
        const url = `${MAPS_MAIN_FILE_URL}?path=${encodeURIComponent(relativePath)}`;
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.content) {
            setFileContent(json.content);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch file content:", err);
      }
    }
    setFileContent((node.data?.content as string) || null);
  }, []);

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
                Live Topology
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              Domain mẹ: <span className="text-indigo-400">node_md.hust.media</span> &bull; {lastSyncTime ? `Đồng bộ: ${lastSyncTime}` : "Đang tải..."}
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
              Toàn cảnh (Dual-Tier)
            </button>
            <button
              onClick={() => setActiveFilter("vault")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                activeFilter === "vault"
                  ? "bg-purple-600 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cây Tri thức (.md)
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

          <button
            onClick={loadGraphFromDomain}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            Sync
          </button>

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Connected
          </div>
        </div>
      </div>

      {/* REACT FLOW CANVAS */}
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
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

      {/* INSPECTOR DRAWER */}
      {selectedNode && (
        <div className="absolute right-4 top-16 bottom-4 z-20 w-80 md:w-96 rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Chi tiết Thực thể
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
                  <div className="text-[11px] font-medium text-slate-400">Chức năng & Quy tắc</div>
                  <div className="text-xs leading-relaxed text-slate-300 mt-0.5 bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                    {selectedNode.data.description}
                  </div>
                </div>
              )}

              {selectedNode.data.path && (
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Đường dẫn file (.md)</div>
                  <div className="text-[10px] font-mono text-emerald-400 break-all mt-0.5 bg-slate-950/60 p-2 rounded border border-white/5">
                    {selectedNode.data.path}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                  <span>Nội dung file trực tiếp</span>
                  <span className="text-[9px] text-indigo-400 font-mono">Live from node_md</span>
                </div>
                <pre className="text-[10px] font-mono text-slate-300 bg-black/60 p-2.5 rounded-lg border border-white/5 overflow-x-auto whitespace-pre-wrap max-h-48 mt-1">
                  {fileContent || "Đang tải nội dung file..."}
                </pre>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Trạng thái: Đồng bộ Live</span>
            <span className="text-emerald-400 font-mono">Isolated (W_1 ∩ W_2 = ∅)</span>
          </div>
        </div>
      )}
    </div>
  );
}
