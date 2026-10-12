"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  Info,
  Link2,
  Lock,
  PanelTop,
  Radio,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import {
  DEFAULT_WORKFLOW_ID,
  MOCK_GRAPH_DATA,
  SAMPLE_TRACES,
  SAMPLE_REALTIME_LARAVEL_PIPELINE,
  fetchWorkflowGraph,
  fetchWorkflowHealth,
  HEALTH_API_URL,
  LARAVEL_TRACE_URL,
  API_BASE_URL,
  SSE_EVENTS_URL,
} from "./process";

import N8nDiagramRenderer from "./n8n_render";

export default function N8nWorkflowMain() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Realtime Live State (SSE)
  const [sseStatus, setSseStatus] = useState("connecting");
  const [latestTrace, setLatestTrace] = useState(null);

  // Health check & Laravel Trace Auth state
  const [healthData, setHealthData] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [dismissWarning, setDismissWarning] = useState(false);
  const [showEndpointGuide, setShowEndpointGuide] = useState(false);

  const rendererRef = useRef(null);

  const handleSseStatusChange = useCallback((status) => {
    if (typeof status === "boolean") {
      setSseStatus(status ? "connected" : "disconnected");
    } else {
      setSseStatus(status || "disconnected");
    }
  }, []);

  const checkHealth = useCallback(async () => {
    setCheckingHealth(true);
    const res = await fetchWorkflowHealth();
    setHealthData(res);
    setCheckingHealth(false);
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

  // Initial fetch & health monitoring
  useEffect(() => {
    loadWorkflow(DEFAULT_WORKFLOW_ID);
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, [loadWorkflow, checkHealth]);

  // Load Mock graph fallback
  const handleLoadMock = () => {
    setGraphData(MOCK_GRAPH_DATA);
    setIsDemoMode(true);
    setErrorInfo(null);
  };

  // Xử lý sự kiện workflow.graph.updated từ SSE
  const handleGraphReceived = useCallback((payload) => {
    const graph = payload?.graph;
    if (!graph) return;

    const isSticky = (n) => Boolean(
      n?.isStickyNote ||
      n?.type === "stickyNote" ||
      n?.type === "n8n-nodes-base.stickyNote" ||
      (typeof n?.type === "string" && n.type.toLowerCase().includes("stickynote"))
    );

    const allRawNodes = graph.flowNodes || graph.nodes || [];
    const flowNodes = allRawNodes.filter((n) => !isSticky(n));

    const stickyMap = new Map();
    (graph.stickyNotes || []).forEach((s, idx) => {
      const id = s.id || `sticky-${idx}`;
      if (!stickyMap.has(id)) stickyMap.set(id, s);
    });
    allRawNodes.filter(isSticky).forEach((s, idx) => {
      const id = s.id || `sticky-from-node-${idx}`;
      if (!stickyMap.has(id)) stickyMap.set(id, s);
    });
    const stickyNotes = Array.from(stickyMap.values());
    const edges = graph.edges || [];
    const connections = graph.connections || {};

    setGraphData((previous) => ({
      ...previous,
      ...graph,
      workflow: payload.workflow || previous?.workflow,
      workflowId:
        payload.workflow_id ||
        payload.workflow?.id ||
        previous?.workflowId ||
        DEFAULT_WORKFLOW_ID,
      name: payload.workflow?.name || graph.name || previous?.name || "media_tech_realtime",
      active: payload.workflow?.active ?? previous?.active ?? true,
      nodes: flowNodes,
      flowNodes,
      stickyNotes,
      connections,
      edges,
      graph,
      meta: graph.meta || previous?.meta || {
        nodeCount: flowNodes.length,
        stickyNoteCount: stickyNotes.length,
        totalNodeCount: flowNodes.length + stickyNotes.length,
        connectionCount: Object.keys(connections).length,
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

  // Simulate receiving stage events via SSE (stage.started, stage.completed, stage.failed)
  const handleSimulateStageEvent = (eventName = "stage.started") => {
    const sampleNode = graphData?.nodes?.[0]?.name || "chat bot tuong tac tv";
    if (rendererRef.current) {
      rendererRef.current.triggerStageEvent(eventName, {
        type: eventName,
        stage: "openclaw.service",
        node_name: sampleNode,
        duration_ms: eventName === "stage.completed" ? 350 : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Simulate pipeline of Laravel realtime trace (start -> complete)
  const handleSimulateLaravelPipeline = () => {
    const startEvent = SAMPLE_REALTIME_LARAVEL_PIPELINE[0];
    const completeEvent = SAMPLE_REALTIME_LARAVEL_PIPELINE[1];

    const startPayload = {
      ...startEvent,
      timestamp: new Date().toISOString(),
    };

    setLatestTrace({
      event: startPayload.event,
      status: "running",
      phase: "start",
      request_id: startPayload.request_id,
      trace: {
        uri: "openclaw/workflow/laravel-trace",
        method: "POST",
        stage_node_ids: startPayload.stage_node_ids,
      },
      status_code: 200,
      duration_ms: 0,
      timestamp: startPayload.timestamp,
    });

    if (rendererRef.current) {
      rendererRef.current.triggerStageEvent("stage.started", startPayload);
    }

    setTimeout(() => {
      const completePayload = {
        ...completeEvent,
        timestamp: new Date().toISOString(),
      };

      setLatestTrace({
        event: completePayload.event,
        status: "success",
        phase: "complete",
        request_id: completePayload.request_id,
        trace: {
          uri: "openclaw/workflow/laravel-trace",
          method: "POST",
          stage_node_ids: completePayload.stage_node_ids,
        },
        status_code: 200,
        duration_ms: completePayload.duration_ms || 450,
        timestamp: completePayload.timestamp,
      });

      if (rendererRef.current) {
        rendererRef.current.triggerStageEvent("stage.completed", completePayload);
      }
    }, 700);
  };

  // Simulate graph refresh
  const handleSimulateGraphUpdate = () => {
    loadWorkflow(DEFAULT_WORKFLOW_ID);
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
          {/* Realtime Live Connection Status Pill (SSE) */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              sseStatus === "connected"
                ? "bg-emerald-950/70 border-emerald-700 text-emerald-300 shadow-sm shadow-emerald-500/10"
                : sseStatus === "reconnecting"
                ? "bg-amber-950/70 border-amber-700 text-amber-300 shadow-sm shadow-amber-500/10"
                : sseStatus === "connecting"
                ? "bg-sky-950/70 border-sky-700 text-sky-300 shadow-sm shadow-sky-500/10"
                : "bg-slate-900 border-slate-700 text-slate-400"
            }`}
          >
            {sseStatus === "connected" ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-emerald-300">Live: Connected (SSE)</span>
              </>
            ) : sseStatus === "reconnecting" ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="font-semibold text-amber-300">Live: Reconnecting</span>
              </>
            ) : sseStatus === "connecting" ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                </span>
                <span className="font-semibold text-sky-300">Live: Connecting (SSE)</span>
              </>
            ) : (
              <>
                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                <span>Live: Disconnected</span>
              </>
            )}
          </div>

          {/* Node Backend Health Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              healthData?.success
                ? "bg-slate-950/80 border-slate-700 text-slate-300 shadow-sm"
                : healthData
                ? "bg-rose-950/60 border-rose-800 text-rose-300 shadow-sm"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>Health:</span>
            {checkingHealth ? (
              <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
            ) : healthData?.success ? (
              <span className="font-semibold text-emerald-400">200 OK</span>
            ) : healthData ? (
              <span className="font-semibold text-rose-400">{healthData.httpStatus || "Lỗi"}</span>
            ) : (
              <span className="text-slate-500">Checking...</span>
            )}
          </div>

          {/* Laravel Trace Auth Badge */}
          <button
            onClick={() => checkHealth()}
            title="Click để kiểm tra lại cấu hình auth trace"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
              healthData?.laravelTraceAuthConfigured
                ? "bg-emerald-950/70 border-emerald-700 text-emerald-300 shadow-sm shadow-emerald-500/10 hover:bg-emerald-900/60"
                : "bg-amber-950/70 border-amber-600/80 text-amber-200 shadow-sm shadow-amber-500/10 hover:bg-amber-900/60"
            }`}
          >
            {healthData?.laravelTraceAuthConfigured ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Trace Auth: <strong className="text-emerald-300">Configured</strong></span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                <span>Trace Auth: <strong className="text-amber-300">Chưa cấu hình (503)</strong></span>
              </>
            )}
          </button>

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

      {/* Warning Banner: laravel_trace_auth_configured: false */}
      {healthData && !healthData.laravelTraceAuthConfigured && !dismissWarning && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-amber-300 text-sm">
                  Cảnh báo Xác thực Laravel Trace: Chưa cấu hình (503 Service Unavailable)
                </span>
                <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-900/70 text-amber-200 border border-amber-700 text-[11px]">
                  laravel_trace_auth_configured: false
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                Node backend hiện đang phản hồi các API bình thường, nhưng báo <code className="text-amber-300 bg-amber-950/80 px-1 py-0.5 rounded">laravel_trace_auth_configured: false</code>. Các callback trace gửi từ Laravel sang <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">POST /openclaw/workflow/laravel-trace</code> sẽ bị từ chối với mã lỗi <strong className="text-rose-400">HTTP 503</strong>.
              </p>
              <p className="text-slate-400 text-[11px]">
                👉 Cần cấu hình cùng một mã <code className="text-amber-300 bg-amber-950 px-1 py-0.5 rounded">LARAVEL_TRACE_CALLBACK_TOKEN</code> ở cả Laravel (.env) và Node backend để tín hiệu trace của Laravel có thể phát vào luồng realtime SSE.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => checkHealth()}
              disabled={checkingHealth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-colors font-medium cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? "animate-spin" : ""}`} />
              Kiểm tra lại
            </button>
            <button
              onClick={() => setShowEndpointGuide((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Xem Endpoint
            </button>
            <button
              onClick={() => setDismissWarning(true)}
              className="p-1.5 rounded-lg hover:bg-amber-900/40 text-amber-400 hover:text-amber-200 transition-colors cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Endpoint Connection Guide (Collapsible) */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md overflow-hidden transition-all">
        <button
          onClick={() => setShowEndpointGuide((prev) => !prev)}
          className="w-full px-4 py-3 flex items-center justify-between gap-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">Thông số Kết nối Hệ thống (Endpoints & SSE Specs)</span>
            <span className="text-slate-500 text-[11px] font-mono">OpenClaw Realtime Pipeline</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>{showEndpointGuide ? "Thu gọn" : "Chi tiết 4 cổng kết nối"}</span>
            {showEndpointGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showEndpointGuide && (
          <div className="p-4 pt-0 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mt-3">
            {/* 1. REST API Tải Graph */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400">1. REST API — Tải Graph</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">GET</span>
              </div>
              <p className="font-mono text-[11px] text-slate-300 break-all bg-slate-900/80 p-1.5 rounded border border-slate-800">
                {API_BASE_URL}
              </p>
              <p className="text-[11px] text-slate-400">
                Trả về: <code className="text-slate-300">id</code>, <code className="text-slate-300">workflow_id</code>, <code className="text-slate-300">nodes</code>, <code className="text-slate-300">stickyNotes</code>, <code className="text-slate-300">connections</code>.
              </p>
            </div>

            {/* 2. Realtime SSE */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">2. Realtime — SSE Events</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">SSE</span>
              </div>
              <p className="font-mono text-[11px] text-slate-300 break-all bg-slate-900/80 p-1.5 rounded border border-slate-800">
                {SSE_EVENTS_URL}
              </p>
              <p className="text-[11px] text-slate-400">
                Sự kiện: <code className="text-slate-300">stage.started</code>, <code className="text-slate-300">stage.completed</code>, <code className="text-slate-300">stage.failed</code>, <code className="text-slate-300">connected</code>.
              </p>
            </div>

            {/* 3. Health Check */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-400">3. Trạng thái & Auth</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">GET</span>
              </div>
              <p className="font-mono text-[11px] text-slate-300 break-all bg-slate-900/80 p-1.5 rounded border border-slate-800">
                {HEALTH_API_URL}
              </p>
              <p className="text-[11px] text-slate-400">
                Kiểm tra: <code className="text-slate-300">laravel_trace_auth_configured</code>. Nếu false, callback trả về 503.
              </p>
            </div>

            {/* 4. Laravel Trace Callback */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">4. Laravel Trace Callback</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">POST</span>
              </div>
              <p className="font-mono text-[11px] text-slate-300 break-all bg-slate-900/80 p-1.5 rounded border border-slate-800">
                {LARAVEL_TRACE_URL}
              </p>
              <p className="text-[11px] text-slate-400">
                Header: <code className="text-slate-300">Authorization: Bearer &lt;TOKEN&gt;</code>. Gửi <code className="text-slate-300">stage_node_ids</code>, <code className="text-slate-300">stage_edges</code>.
              </p>
            </div>
          </div>
        )}
      </div>

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
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSimulateLaravelPipeline}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-200 border border-amber-500/40 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold shadow-sm"
            title="Mô phỏng chuỗi pipeline Laravel thực tế: stage.started -> stage.completed qua 10 nodes"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Test Laravel Pipeline (Start → Complete)
          </button>
          <button
            onClick={() => handleSimulateStageEvent("stage.started")}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 transition-colors flex items-center gap-1 cursor-pointer"
            title="Mô phỏng SSE event: stage.started"
          >
            <Zap className="w-3 h-3 text-cyan-400" /> Test stage.started
          </button>
          <button
            onClick={() => handleSimulateStageEvent("stage.completed")}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 transition-colors flex items-center gap-1 cursor-pointer"
            title="Mô phỏng SSE event: stage.completed"
          >
            <CheckCircle2 className="w-3 h-3" /> Test stage.completed
          </button>
          <button
            onClick={() => handleSimulateStageEvent("stage.failed")}
            className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 transition-colors flex items-center gap-1 cursor-pointer"
            title="Mô phỏng SSE event: stage.failed"
          >
            <AlertTriangle className="w-3 h-3" /> Test stage.failed
          </button>
          <button
            onClick={() => checkHealth()}
            disabled={checkingHealth}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            title="Gọi GET https://node_md.hust.media/openclaw/workflow/health"
          >
            <Server className={`w-3 h-3 text-slate-400 ${checkingHealth ? "animate-spin" : ""}`} /> Kiểm tra Health (GET)
          </button>
          <button
            onClick={handleSimulateGraphUpdate}
            className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 transition-colors flex items-center gap-1 cursor-pointer"
            title="Tải lại graph từ REST API"
          >
            <RefreshCw className="w-3 h-3 text-indigo-400" /> Tải lại Graph (GET)
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
            onSSEStatusChange={handleSseStatusChange}
            className="w-full h-full"
          />
        )}
      </main>
    </div>
  );
}
