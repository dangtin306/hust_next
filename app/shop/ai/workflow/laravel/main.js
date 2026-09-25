"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock,
  HelpCircle,
  PanelTop,
  Radio,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Workflow,
  XCircle,
  Zap,
} from "lucide-react";

import {
  DEFAULT_WORKFLOW_ID,
  MOCK_GRAPH_DATA,
  SAMPLE_TRACES,
  SAMPLE_GRAPH_SOCKET_EVENT,
  fetchWorkflowGraph,
} from "./process";

import N8nDiagramRenderer from "./n8n_render";

export default function N8nWorkflowMain() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Realtime Live State
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [latestTrace, setLatestTrace] = useState(null);

  const rendererRef = useRef(null);

  const handleSocketStatusChange = useCallback((status) => {
    if (typeof status === "boolean") {
      setSocketStatus(status ? "connected" : "disconnected");
    } else {
      setSocketStatus(status || "disconnected");
    }
  }, []);

  const loadWorkflow = useCallback(async (workflowId = DEFAULT_WORKFLOW_ID) => {
    setReloading(true);
    setErrorInfo(null);
    setIsDemoMode(false);

    const result = await fetchWorkflowGraph(workflowId);

    if (result.success && result.graph) {
      setGraphData(result.graph);
    } else {
      setErrorInfo(result.error);
      setGraphData(null);
    }

    setLoading(false);
    setReloading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    loadWorkflow(DEFAULT_WORKFLOW_ID);
  }, [loadWorkflow]);

  // Load Mock graph fallback
  const handleLoadMock = () => {
    setGraphData(MOCK_GRAPH_DATA);
    setIsDemoMode(true);
    setErrorInfo(null);
  };

  // Xử lý sự kiện n8n:graph từ Socket.IO theo Yêu cầu 2
  const handleGraphReceived = useCallback((payload) => {
    const graph = payload?.graph;
    if (!graph) return;

    const flowNodes = graph.flowNodes || graph.nodes || [];
    const stickyNotes = graph.stickyNotes || [];
    const edges = graph.edges || [];

    setGraphData((previous) => ({
      ...previous,
      ...graph,
      workflow: payload.workflow || previous?.workflow,
      workflowId:
        payload.workflow_id ||
        payload.workflow?.id ||
        previous?.workflowId ||
        DEFAULT_WORKFLOW_ID,
      name: payload.workflow?.name || previous?.name || "Hust Laravel Tracing & Monitor",
      active: payload.workflow?.active ?? previous?.active ?? true,
      nodes: flowNodes,
      flowNodes,
      stickyNotes,
      edges,
      graph,
      meta: graph.meta || previous?.meta || {
        nodeCount: flowNodes.length,
        stickyNoteCount: stickyNotes.length,
        totalNodeCount: flowNodes.length + stickyNotes.length,
        edgeCount: edges.length,
      },
      lastGraphUpdated: payload.timestamp || new Date().toISOString(),
    }));
  }, []);

  // Simulate trace locally for instant visual verification
  const handleSimulateTrace = (sampleIndex = 0) => {
    const sample = SAMPLE_TRACES[sampleIndex] || SAMPLE_TRACES[0];
    const traceWithNow = {
      ...sample,
      timestamp: new Date().toISOString(),
    };

    if (!graphData) {
      setGraphData(MOCK_GRAPH_DATA);
      setIsDemoMode(true);
    }

    setLatestTrace(traceWithNow);

    if (rendererRef.current) {
      rendererRef.current.triggerTraceAnimation(traceWithNow);
    }
  };

  // Simulate receiving an updated n8n:graph via Socket.IO
  const handleSimulateGraphUpdate = () => {
    handleGraphReceived({
      ...SAMPLE_GRAPH_SOCKET_EVENT,
      timestamp: new Date().toISOString(),
      workflow: {
        id: DEFAULT_WORKFLOW_ID,
        name: "Hust Laravel Tracing & Monitor",
        active: true,
      },
      graph: {
        ...MOCK_GRAPH_DATA,
        timestamp: new Date().toISOString(),
      },
    });
  };

  const flowNodeCount =
    graphData?.flowNodes?.length ??
    graphData?.graph?.flowNodes?.length ??
    graphData?.nodes?.length ??
    16;
  const stickyNoteCount =
    graphData?.stickyNotes?.length ??
    graphData?.graph?.stickyNotes?.length ??
    4;
  const edgeCount =
    graphData?.edges?.length ??
    graphData?.graph?.edges?.length ??
    16;
  const workflowName =
    graphData?.name ||
    graphData?.workflow?.name ||
    "Hust Laravel Tracing & Monitor";
  const isWorkflowActive =
    graphData?.active ??
    graphData?.workflow?.active ??
    true;
  const workflowId =
    graphData?.workflowId ||
    graphData?.workflow?.id ||
    DEFAULT_WORKFLOW_ID;

  return (
    <div className="p-4 md:p-6 w-full flex flex-col gap-4 text-slate-100">
      {/* Top Header Card */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Workflow className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-white truncate">
                {workflowName}
              </h1>
              {graphData && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    isWorkflowActive
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-700/40 text-slate-400 border-slate-700"
                  }`}
                >
                  {isWorkflowActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động (Active)
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" /> Đã tắt (Inactive)
                    </>
                  )}
                </span>
              )}
              {graphData?.lastGraphUpdated && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  title={`Graph cập nhật từ Socket lúc ${new Date(graphData.lastGraphUpdated).toLocaleTimeString()}`}
                >
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> Graph Sync: {new Date(graphData.lastGraphUpdated).toLocaleTimeString()}
                </span>
              )}
              {isDemoMode && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-3 h-3" /> Chế độ Demo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1 truncate">
              Workflow ID:{" "}
              <span className="text-amber-400 font-medium">
                {workflowId}
              </span>
            </p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Realtime Live Connection Status Pill theo Yêu cầu 7 */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              socketStatus === "connected"
                ? "bg-emerald-950/70 border-emerald-700 text-emerald-300 shadow-sm shadow-emerald-500/10"
                : socketStatus === "reconnecting"
                ? "bg-amber-950/70 border-amber-700 text-amber-300 shadow-sm shadow-amber-500/10"
                : socketStatus === "connecting"
                ? "bg-sky-950/70 border-sky-700 text-sky-300 shadow-sm shadow-sky-500/10"
                : "bg-slate-900 border-slate-700 text-slate-400"
            }`}
          >
            {socketStatus === "connected" ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-emerald-300">Live: Connected</span>
              </>
            ) : socketStatus === "reconnecting" ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="font-semibold text-amber-300">Live: Reconnecting</span>
              </>
            ) : socketStatus === "connecting" ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                </span>
                <span className="font-semibold text-sky-300">Live: Connecting</span>
              </>
            ) : (
              <>
                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                <span>Live: Disconnected</span>
              </>
            )}
          </div>

          {graphData && (
            <div className="flex items-center gap-2.5 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300" title="Số lượng Node xử lý">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>Nodes:</span>
                <span className="font-bold text-white">{flowNodeCount}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5 text-slate-300" title="Số lượng Vùng Sticky Note">
                <PanelTop className="w-4 h-4 text-indigo-400" />
                <span>Zones:</span>
                <span className="font-bold text-white">{stickyNoteCount}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5 text-slate-300" title="Số lượng Kết nối Edges">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Connections:</span>
                <span className="font-bold text-white">{edgeCount}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => loadWorkflow(DEFAULT_WORKFLOW_ID)}
            disabled={reloading || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} />
            <span>{reloading ? "Đang tải..." : "Tải lại"}</span>
          </button>
        </div>
      </header>

      {/* Realtime Trace Telemetry Bar */}
      {latestTrace && (
        <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Laravel Trace:
            </span>

            {/* Method */}
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
              {latestTrace.trace?.method || "GET"}
            </span>

            {/* URI */}
            <span className="font-mono text-slate-200 font-medium bg-slate-950 px-2 py-0.5 rounded border border-slate-800 truncate max-w-xs md:max-w-md">
              {latestTrace.trace?.uri || "laravel/trace"}
            </span>

            {/* Status code */}
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold border ${
                latestTrace.status_code >= 400
                  ? "bg-rose-950/80 text-rose-300 border-rose-700"
                  : "bg-emerald-950/80 text-emerald-300 border-emerald-700"
              }`}
            >
              {latestTrace.status_code || 200}
            </span>

            {/* Duration */}
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{latestTrace.duration_ms} ms</span>
            </span>

            {/* Status Badge */}
            <span
              className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] tracking-wider border ${
                latestTrace.status === "error"
                  ? "bg-rose-950 text-rose-300 border-rose-600"
                  : latestTrace.status === "slow"
                  ? "bg-amber-950 text-amber-300 border-amber-600"
                  : "bg-emerald-950 text-emerald-300 border-emerald-600"
              }`}
            >
              {latestTrace.status}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px] shrink-0">
            <span>
              {latestTrace.timestamp ? new Date(latestTrace.timestamp).toLocaleTimeString() : ""}
            </span>
          </div>
        </div>
      )}

      {/* Realtime Simulation Buttons */}
      <div className="flex items-center justify-between gap-2 px-1 flex-wrap text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Test nhanh hiệu ứng Realtime Trace:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulateTrace(0)}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3 h-3" /> Test Success Trace
          </button>
          <button
            onClick={() => handleSimulateTrace(1)}
            className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-700/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Clock className="w-3 h-3" /> Test Slow Trace
          </button>
          <button
            onClick={() => handleSimulateTrace(2)}
            className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3" /> Test Error Trace
          </button>
          <button
            onClick={handleSimulateGraphUpdate}
            className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 transition-colors flex items-center gap-1 cursor-pointer"
            title="Mô phỏng nhận event Socket.IO n8n:graph"
          >
            <Radio className="w-3 h-3 text-indigo-400" /> Test Socket n8n:graph
          </button>
        </div>
      </div>

      {/* Content Area - Rendered by N8nDiagramRenderer */}
      <main className="relative w-full h-[760px] rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col">
        {loading ? (
          /* Loading State */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-950/90 text-slate-300">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <div className="text-center">
              <p className="font-medium text-base text-slate-200">Đang tải sơ đồ n8n...</p>
              <p className="text-xs text-slate-500 mt-1">Đang lấy cấu trúc graph từ máy chủ</p>
            </div>
          </div>
        ) : errorInfo && !isDemoMode ? (
          /* Error State */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Lỗi nạp sơ đồ Workflow</h2>
              {errorInfo.httpStatus && (
                <div className="mt-1">
                  <span className="inline-block text-xs font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800">
                    HTTP {errorInfo.httpStatus}: {errorInfo.graphError}
                  </span>
                </div>
              )}
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                {errorInfo.message}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => loadWorkflow(DEFAULT_WORKFLOW_ID)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700 shadow cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </button>
              <button
                onClick={handleLoadMock}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Xem dữ liệu mẫu (Mock Demo)
              </button>
            </div>
          </div>
        ) : !graphData ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <p className="text-slate-300 font-medium">Không tìm thấy node nào trong workflow</p>
            <button
              onClick={handleLoadMock}
              className="text-xs text-amber-400 hover:underline cursor-pointer"
            >
              Xem thử workflow mẫu
            </button>
          </div>
        ) : (
          /* Specialized N8N Renderer from n8n_render.tsx */
          <N8nDiagramRenderer
            ref={rendererRef}
            graph={graphData}
            onTraceReceived={setLatestTrace}
            onGraphReceived={handleGraphReceived}
            onSocketStatusChange={handleSocketStatusChange}
            className="w-full h-full"
          />
        )}
      </main>
    </div>
  );
}
