"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock,
  Cpu,
  HelpCircle,
  Info,
  Network,
  PanelTop,
  Radio,
  RefreshCw,
  Server,
  ShieldAlert,
  Terminal,
  XCircle,
  Zap,
} from "lucide-react";

import {
  DEFAULT_WORKFLOW_ID,
  MOCK_GRAPH_DATA,
  N8N_SERVER_URL,
  N8N_TARGET_PORT,
  TARGET_WEBHOOK_URL,
  NODE_BACKEND_SSE_URL,
  NODE_BACKEND_HEALTH_URL,
  NODE_BACKEND_HOST,
  DEMO_SSE_EVENTS,
  getSseProxyUrl,
  fetchWorkflowGraph,
} from "./process";

import N8nDiagramRenderer from "./n8n_render";

export default function N8nWorkflowMain() {
  const [graphData, setGraphData] = useState(MOCK_GRAPH_DATA);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);

  // Tải sơ đồ n8n thực tế từ backend API
  const loadRemoteGraph = useCallback(async () => {
    setIsLoadingGraph(true);
    const res = await fetchWorkflowGraph();
    if (res.success && res.graph) {
      setGraphData(res.graph);
    }
    setIsLoadingGraph(false);
  }, []);

  useEffect(() => {
    loadRemoteGraph();
  }, [loadRemoteGraph]);

  // Connection & Live State
  // "connecting" | "waiting_backend" | "connected" | "reconnecting" | "unavailable" | "disconnected"
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [lastEventTimestamp, setLastEventTimestamp] = useState(null);
  const [relativeTimeText, setRelativeTimeText] = useState("Chưa có");
  const [isStale, setIsStale] = useState(false);
  const [replayGapNotice, setReplayGapNotice] = useState(null);
  const [isManualReconnecting, setIsManualReconnecting] = useState(false);

  // Grouped Requests Tracking (theo trace_id / request_id)
  const [activeRequests, setActiveRequests] = useState([]);
  const [latestEvent, setLatestEvent] = useState(null);

  const rendererRef = useRef(null);

  // Xử lý sự kiện SSE nhận được từ backend thật
  const handleEventReceived = useCallback((eventName, payload) => {
    // Chỉ cập nhật thời gian khi nhận được event nghiệp vụ thật từ backend
    const now = Date.now();
    setLastEventTimestamp(now);
    setIsStale(false);
    setLatestEvent({ eventName, payload, receivedAt: new Date().toISOString() });

    // Nhóm theo trace_id hoặc request_id
    const requestId = payload.request_id || payload.trace_id;
    if (requestId) {
      setActiveRequests((prev) => {
        const existingIdx = prev.findIndex((r) => r.id === requestId);
        const stage = payload.stage;
        const currentStages = existingIdx >= 0 ? [...prev[existingIdx].stages] : [];

        if (stage && !currentStages.includes(stage)) {
          currentStages.push(stage);
        }

        const updatedItem = {
          id: requestId,
          traceId: payload.trace_id || requestId,
          method: payload.method || (existingIdx >= 0 ? prev[existingIdx].method : "REQ"),
          route: payload.route || (existingIdx >= 0 ? prev[existingIdx].route : "/"),
          status_code: payload.status_code || (existingIdx >= 0 ? prev[existingIdx].status_code : null),
          duration_ms: payload.duration_ms || (existingIdx >= 0 ? prev[existingIdx].duration_ms : null),
          latestEvent: eventName,
          latestStage: stage || (existingIdx >= 0 ? prev[existingIdx].latestStage : null),
          stages: currentStages,
          outcome: payload.outcome || (existingIdx >= 0 ? prev[existingIdx].outcome : null),
          updatedAt: new Date().toLocaleTimeString(),
        };

        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = updatedItem;
          return next;
        } else {
          return [updatedItem, ...prev].slice(0, 8);
        }
      });
    }
  }, []);

  // Xử lý sự kiện replay_gap
  const handleReplayGap = useCallback((payload) => {
    setReplayGapNotice(
      payload?.message ||
        "Phát hiện khoảng trống sự kiện (replay gap), đã đồng bộ lại trạng thái với máy chủ."
    );
    setTimeout(() => {
      setReplayGapNotice(null);
    }, 6000);
  }, []);

  // Bộ định thời kiểm tra tính tươi mới (Stale Detection >30s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastEventTimestamp) {
        setRelativeTimeText("Chưa có");
        setIsStale(false);
        return;
      }

      const diffSec = Math.floor((Date.now() - lastEventTimestamp) / 1000);
      if (diffSec < 5) {
        setRelativeTimeText("Vừa xong");
        setIsStale(false);
      } else if (diffSec < 60) {
        setRelativeTimeText(`${diffSec}s trước`);
        setIsStale(diffSec >= 30);
      } else {
        const diffMin = Math.floor(diffSec / 60);
        setRelativeTimeText(`${diffMin} phút trước`);
        setIsStale(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastEventTimestamp]);

  // Nút thủ công thử kết nối lại
  const handleManualReconnect = () => {
    setIsManualReconnecting(true);
    setConnectionStatus("connecting");
    if (rendererRef.current) {
      rendererRef.current.reconnect();
    }
    setTimeout(() => {
      setIsManualReconnecting(false);
    }, 1500);
  };

  // Kích hoạt mô phỏng sự kiện demo (phân tách rõ ràng với dữ liệu live)
  const handleTriggerDemoEvent = (demoIndex = 0) => {
    const demo = DEMO_SSE_EVENTS[demoIndex];
    if (!demo) return;

    const eventWithNow = {
      ...demo.payload,
      timestamp: new Date().toISOString(),
    };

    if (rendererRef.current) {
      rendererRef.current.triggerSSEEvent(demo.eventName, eventWithNow);
    }
  };

  const flowNodeCount = graphData?.nodes?.length ?? 36;
  const stickyNoteCount = graphData?.stickyNotes?.length ?? 2;
  const edgeCount = Array.isArray(graphData?.edges)
    ? graphData.edges.length
    : Object.keys(graphData?.connections || {}).length || 32;

  return (
    <div className="p-4 md:p-6 w-full flex flex-col gap-4 text-slate-100">
      {/* Top Header Card */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-white truncate">
                Node.js & OpenClaw Realtime Diagram
              </h1>

              {/* Status Pill - CHỈ hiển thị Live: Connected khi nhận được event connected THẬT từ backend */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold transition-all ${
                  connectionStatus === "connected"
                    ? "bg-emerald-950/70 border-emerald-700 text-emerald-300 shadow-sm shadow-emerald-500/10"
                    : connectionStatus === "waiting_backend"
                    ? "bg-amber-950/70 border-amber-700 text-amber-300"
                    : connectionStatus === "reconnecting"
                    ? "bg-orange-950/70 border-orange-700 text-orange-300"
                    : connectionStatus === "connecting"
                    ? "bg-sky-950/70 border-sky-700 text-sky-300"
                    : "bg-rose-950/70 border-rose-800 text-rose-300"
                }`}
              >
                {connectionStatus === "connected" ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Live: Connected</span>
                  </>
                ) : connectionStatus === "waiting_backend" ? (
                  <>
                    <span className="inline-flex rounded-full h-2 w-2 bg-amber-500 animate-pulse"></span>
                    <span>Proxy Open (Chờ {NODE_BACKEND_HOST}...)</span>
                  </>
                ) : connectionStatus === "reconnecting" ? (
                  <>
                    <span className="inline-flex rounded-full h-2 w-2 bg-orange-500 animate-pulse"></span>
                    <span>Reconnecting...</span>
                  </>
                ) : connectionStatus === "connecting" ? (
                  <>
                    <span className="inline-flex rounded-full h-2 w-2 bg-sky-500 animate-pulse"></span>
                    <span>Connecting to Proxy...</span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    <span>Disconnected ({NODE_BACKEND_HOST} chưa khả dụng)</span>
                  </>
                )}
              </div>

              {/* Port & Address Badges */}
              <span className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                <Radio className="w-3 h-3 text-cyan-400" /> SSE: {NODE_BACKEND_HOST}
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                <Server className="w-3 h-3 text-emerald-400" /> Graph: {NODE_BACKEND_HOST}
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                <Boxes className="w-3 h-3 text-indigo-400" /> {graphData?.name || "media_tech_realtime"} ({graphData?.id || "0KwASApTaZfyktBi"})
              </span>

              {/* Stale Warning Badge */}
              {isStale && connectionStatus === "connected" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Stale (&gt;30s không có event)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-mono flex-wrap">
              <span>
                Graph API: <code className="text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">https://{NODE_BACKEND_HOST}/openclaw/workflow/graph</code>
              </span>
              <span className="text-slate-700">|</span>
              <span>
                SSE Stream: <code className="text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">https://{NODE_BACKEND_HOST}/openclaw/workflow/events</code>
              </span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                Event gần nhất: <span className="text-slate-200 font-semibold">{relativeTimeText}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats Pills & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2.5 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-xs shrink-0">
            <div className="flex items-center gap-1.5 text-slate-300" title="Nodes trên đồ thị">
              <Boxes className="w-4 h-4 text-cyan-400" />
              <span>Nodes:</span>
              <span className="font-bold text-white">{flowNodeCount}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-slate-300" title="Vùng quy trình">
              <PanelTop className="w-4 h-4 text-indigo-400" />
              <span>Nhánh:</span>
              <span className="font-bold text-white">{stickyNoteCount}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-slate-300" title="Liên kết Luồng">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Edges:</span>
              <span className="font-bold text-white">{edgeCount}</span>
            </div>
          </div>

          <button
            onClick={loadRemoteGraph}
            disabled={isLoadingGraph}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-700/80 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Đồng bộ lại sơ đồ trực tiếp từ backend API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGraph ? "animate-spin" : ""}`} />
            <span>{isLoadingGraph ? "Đang tải..." : "Tải lại sơ đồ"}</span>
          </button>

          <button
            onClick={handleManualReconnect}
            disabled={isManualReconnecting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Thử kết nối lại SSE tới backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isManualReconnecting ? "animate-spin" : ""}`} />
            <span>{isManualReconnecting ? "Đang thử..." : "Thử kết nối lại"}</span>
          </button>
        </div>
      </header>

      {/* Cảnh báo rõ ràng khi upstream SSE chưa khả dụng */}
      {(connectionStatus === "unavailable" || connectionStatus === "disconnected") && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">
                Upstream Node Backend SSE ({NODE_BACKEND_SSE_URL}) hiện chưa khả dụng (HTTP 404 Not Found)
              </p>
              <p className="text-rose-300/90 mt-1 leading-relaxed">
                Máy chủ Node backend tại <code className="font-mono bg-rose-900/60 px-1 py-0.5 rounded">{NODE_BACKEND_HOST}</code> chưa khả dụng tại endpoint <code className="font-mono bg-rose-900/60 px-1 py-0.5 rounded">/openclaw/workflow/events</code>.
                Frontend proxy hoạt động bình thường, đang ở trạng thái chờ và giữ khả năng tự động kết nối lại khi backend sẵn sàng.
              </p>
            </div>
          </div>

          <button
            onClick={handleManualReconnect}
            className="px-3 py-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-medium transition-colors shrink-0 cursor-pointer self-start md:self-auto flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại ngay
          </button>
        </div>
      )}

      {/* Thông báo Replay Gap nếu phát hiện */}
      {replayGapNotice && (
        <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-700/80 text-amber-200 text-xs flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{replayGapNotice}</span>
          </div>
          <span className="text-[10px] font-mono text-amber-400">Replay Gap Sync</span>
        </div>
      )}

      {/* Bảng ghi nhận sự kiện SSE mới nhất (chỉ hiển thị khi có event thật) */}
      {latestEvent && (
        <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Live Event:
            </span>

            {/* Event Name */}
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {latestEvent.eventName}
            </span>

            {/* Request / Trace ID */}
            {(latestEvent.payload.request_id || latestEvent.payload.trace_id) && (
              <span className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 truncate max-w-xs">
                ID: {latestEvent.payload.request_id || latestEvent.payload.trace_id}
              </span>
            )}

            {/* Stage */}
            {latestEvent.payload.stage && (
              <span className="font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                stage: {latestEvent.payload.stage}
              </span>
            )}

            {/* Method & Route */}
            {latestEvent.payload.route && (
              <span className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {latestEvent.payload.method || "REQ"} {latestEvent.payload.route}
              </span>
            )}

            {/* Duration */}
            {latestEvent.payload.duration_ms !== undefined && (
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{latestEvent.payload.duration_ms} ms</span>
              </span>
            )}

            {/* Status Code */}
            {latestEvent.payload.status_code && (
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold border ${
                  latestEvent.payload.status_code >= 400
                    ? "bg-rose-950 text-rose-300 border-rose-700"
                    : "bg-emerald-950 text-emerald-300 border-emerald-700"
                }`}
              >
                HTTP {latestEvent.payload.status_code}
              </span>
            )}
          </div>

          <div className="text-slate-400 text-[11px] shrink-0 font-mono">
            {latestEvent.payload.timestamp
              ? new Date(latestEvent.payload.timestamp).toLocaleTimeString()
              : ""}
          </div>
        </div>
      )}

      {/* Danh sách Request theo dõi theo trace_id / request_id */}
      {activeRequests.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <Network className="w-3.5 h-3.5 text-blue-400" />
              Nhóm Request Theo Dõi (Grouped by Request ID / Trace ID):
            </span>
            <span className="text-[10px] text-slate-500">Tối đa 8 requests gần nhất</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {activeRequests.map((req) => (
              <div
                key={req.id}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[130px]" title={req.id}>
                    {req.id}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                      req.status_code >= 400
                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                        : req.status_code
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                    }`}
                  >
                    {req.status_code ? `HTTP ${req.status_code}` : req.latestEvent}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-200 truncate">
                  <span className="text-cyan-400 font-bold mr-1">{req.method}</span>
                  <span>{req.route}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">
                    Stages: <span className="text-slate-200">{req.stages.length}</span>
                  </span>
                  {req.duration_ms && (
                    <span className="text-slate-300">{req.duration_ms}ms</span>
                  )}
                  <span>{req.updatedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ghi chú thông tin hệ thống */}
      <div className="px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Hệ thống:</strong> Sơ đồ n8n đồng bộ trực tiếp từ backend API (<code className="text-emerald-300">{NODE_BACKEND_HOST}/openclaw/workflow/graph</code>) và giám sát hoạt động thời gian thực qua SSE (<code className="text-cyan-300">{NODE_BACKEND_HOST}/openclaw/workflow/events</code>).
          </span>
        </div>
      </div>

      {/* Khung sơ đồ chính (React Flow Renderer) */}
      <main className="relative w-full h-[min(1000px,calc(100vh-180px))] min-h-[760px] rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col">
        <N8nDiagramRenderer
          ref={rendererRef}
          graph={graphData}
          onEventReceived={handleEventReceived}
          onConnectionStatusChange={setConnectionStatus}
          onReplayGap={handleReplayGap}
          className="w-full h-full"
        />
      </main>

      {/* Khu vực Công cụ Mô phỏng Demo (ĐƯỢC TÁCH BIỆT RÕ RÀNG VỚI LUỒNG LIVE) */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-xs flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px]">
              [Công cụ Mô phỏng Demo - Tách biệt hoàn toàn với luồng Live]:
            </span>
            <span className="text-[10px] text-slate-400">
              Chỉ dùng để kiểm thử hiển thị giao diện khi backend thật chưa kích hoạt SSE.
            </span>
          </div>

          <button
            onClick={() => rendererRef.current?.resetAllNodes()}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
          >
            <RefreshCw className="w-3 h-3" /> Reset Sơ đồ
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-1">
          <button
            onClick={() => handleTriggerDemoEvent(0)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <PlayIcon className="w-3 h-3 text-cyan-400" /> Req Started
          </button>

          <button
            onClick={() => handleTriggerDemoEvent(1)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Activity className="w-3 h-3 text-blue-400" /> Stage Agent
          </button>

          <button
            onClick={() => handleTriggerDemoEvent(2)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-emerald-900/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Stage Done (135ms)
          </button>

          <button
            onClick={() => handleTriggerDemoEvent(3)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-rose-300 border border-rose-900/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" /> Stage Failed (401)
          </button>

          <button
            onClick={() => handleTriggerDemoEvent(4)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-purple-300 border border-purple-900/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 text-purple-400" /> Stage Chưa Phân Loại
          </button>

          <button
            onClick={() => handleTriggerDemoEvent(5)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-emerald-900/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Req Completed (200)
          </button>

          <button
            onClick={() => handleTriggerDemoEvent(6)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-900/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Replay Gap
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      {...props}
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
