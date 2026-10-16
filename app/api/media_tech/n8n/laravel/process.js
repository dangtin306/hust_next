export const DEFAULT_WORKFLOW_ID = "UpmkgXAE2dj58nV0";
const CONFIGURED_NODE_BACKEND_URL = (process.env.NEXT_PUBLIC_MEDIA_TECH_NODE_URL || "").trim().replace(/\/+$/, "");
const DEFAULT_NODE_BACKEND_URL = CONFIGURED_NODE_BACKEND_URL || "https://node_md.hust.media";

export const getNodeBackendUrl = () => {
  if (CONFIGURED_NODE_BACKEND_URL) return CONFIGURED_NODE_BACKEND_URL;
  if (
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1", "[::1]"].includes(window.location.hostname.toLowerCase())
  ) {
    return "http://127.0.0.1:8818";
  }
  return DEFAULT_NODE_BACKEND_URL;
};

export const API_BASE_URL = DEFAULT_NODE_BACKEND_URL + "/openclaw/workflow/laravel/graph";
export const SOCKET_SERVER_URL = DEFAULT_NODE_BACKEND_URL;
export const HEALTH_API_URL = DEFAULT_NODE_BACKEND_URL + "/openclaw/workflow/laravel/health";
export const LARAVEL_TRACE_URL = DEFAULT_NODE_BACKEND_URL + "/openclaw/workflow/laravel/trace";


// Mock graph fallback matching the exact 16 flowNodes, 4 stickyNotes, 16 edges
export const MOCK_GRAPH_DATA = {
  workflowId: DEFAULT_WORKFLOW_ID,
  name: "Hust Laravel Tracing & Monitor",
  active: true,
  workflow: {
    id: DEFAULT_WORKFLOW_ID,
    name: "Hust Laravel Tracing & Monitor",
    active: true,
  },
  nodes: [
    {
      id: "hust-laravel-webhook-receiver",
      name: "Laravel Telemetry Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: { x: 0, y: -80 },
      disabled: false,
    },
    {
      id: "hust-laravel-manual-trigger",
      name: "Manual Test Trigger",
      type: "n8n-nodes-base.manualTrigger",
      typeVersion: 1,
      position: { x: 0, y: 80 },
      disabled: false,
    },
    {
      id: "hust-laravel-trace-parser",
      name: "Parse Laravel Trace",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 200, y: 0 },
      disabled: false,
    },
    {
      id: "hust-laravel-module-router",
      name: "Route by Module",
      type: "n8n-nodes-base.switch",
      typeVersion: 3.2,
      position: { x: 420, y: 0 },
      disabled: false,
    },
    {
      id: "hust-laravel-check-git-control",
      name: "Is Git Control",
      type: "n8n-nodes-base.if",
      typeVersion: 2.3,
      position: { x: 420, y: 160 },
      disabled: false,
    },
    {
      id: "hust-laravel-node-gitea",
      name: "📦 Gitea Service Module",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 640, y: -80 },
      disabled: false,
    },
    {
      id: "hust-laravel-node-git-control",
      name: "🌿 Git Control Local Module",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 640, y: 60 },
      disabled: false,
    },
    {
      id: "hust-laravel-node-core",
      name: "⚙️ Core & System Module",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 640, y: 200 },
      disabled: false,
    },
    {
      id: "hust-laravel-check-status-error",
      name: "Check Error (4xx/5xx)",
      type: "n8n-nodes-base.if",
      typeVersion: 2.3,
      position: { x: 900, y: 20 },
      disabled: false,
    },
    {
      id: "hust-laravel-check-latency",
      name: "Check Latency (>1s)",
      type: "n8n-nodes-base.if",
      typeVersion: 2.3,
      position: { x: 1060, y: 80 },
      disabled: false,
    },
    {
      id: "hust-laravel-node-alert-error",
      name: "🔴 Error & Exception Alert",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 1100, y: -80 },
      disabled: false,
    },
    {
      id: "hust-laravel-node-alert-slow",
      name: "🟡 Slow Request Warning",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 1220, y: 20 },
      disabled: false,
    },
    {
      id: "hust-laravel-node-healthy",
      name: "🟢 Normal Execution (200 OK)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 1220, y: 160 },
      disabled: false,
    },
    {
      id: "hust-laravel-heartbeat-schedule",
      name: "⏱️ Heartbeat (Every 1 Minute)",
      type: "n8n-nodes-base.scheduleTrigger",
      typeVersion: 1.4,
      position: { x: 0, y: 560 },
      disabled: false,
    },
    {
      id: "hust-laravel-ping-http",
      name: "Ping Laravel (Port 8805)",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.5,
      position: { x: 240, y: 560 },
      disabled: false,
    },
    {
      id: "hust-laravel-engine-alive",
      name: "🟢 Laravel Engine Alive",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 500, y: 560 },
      disabled: false,
    },
  ],
  flowNodes: [
    {
      id: "hust-laravel-webhook-receiver",
      name: "Laravel Telemetry Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: { x: 0, y: -80 },
      disabled: false,
    },
    {
      id: "hust-laravel-manual-trigger",
      name: "Manual Test Trigger",
      type: "n8n-nodes-base.manualTrigger",
      typeVersion: 1,
      position: { x: 0, y: 80 },
      disabled: false,
    },
    {
      id: "hust-laravel-trace-parser",
      name: "Parse Laravel Trace",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 200, y: 0 },
      disabled: false,
    },
    {
      id: "hust-laravel-module-router",
      name: "Route by Module",
      type: "n8n-nodes-base.switch",
      typeVersion: 3.2,
      position: { x: 420, y: 0 },
      disabled: false,
    },
    {
      id: "hust-laravel-check-git-control",
      name: "Is Git Control",
      type: "n8n-nodes-base.if",
      typeVersion: 2.3,
      position: { x: 420, y: 160 },
      disabled: false,
    },
    {
      id: "hust-laravel-node-gitea",
      name: "📦 Gitea Service Module",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 640, y: -80 },
      disabled: false,
    },
    {
      id: "hust-laravel-node-git-control",
      name: "🌿 Git Control Local Module",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 640, y: 60 },
      disabled: false,
    },
    {
      id: "hust-laravel-node-core",
      name: "⚙️ Core & System Module",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 640, y: 200 },
      disabled: false,
    },
    {
      id: "hust-laravel-check-status-error",
      name: "Check Error (4xx/5xx)",
      type: "n8n-nodes-base.if",
      typeVersion: 2.3,
      position: { x: 900, y: 20 },
      disabled: false,
    },
    {
      id: "hust-laravel-check-latency",
      name: "Check Latency (>1s)",
      type: "n8n-nodes-base.if",
      typeVersion: 2.3,
      position: { x: 1060, y: 80 },
      disabled: false,
    },
    {
      id: "hust-laravel-node-alert-error",
      name: "🔴 Error & Exception Alert",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 1100, y: -80 },
      disabled: false,
    },
    {
      id: "hust-laravel-node-alert-slow",
      name: "🟡 Slow Request Warning",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 1220, y: 20 },
      disabled: false,
    },
    {
      id: "hust-laravel-node-healthy",
      name: "🟢 Normal Execution (200 OK)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 1220, y: 160 },
      disabled: false,
    },
    {
      id: "hust-laravel-heartbeat-schedule",
      name: "⏱️ Heartbeat (Every 1 Minute)",
      type: "n8n-nodes-base.scheduleTrigger",
      typeVersion: 1.4,
      position: { x: 0, y: 560 },
      disabled: false,
    },
    {
      id: "hust-laravel-ping-http",
      name: "Ping Laravel (Port 8805)",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.5,
      position: { x: 240, y: 560 },
      disabled: false,
    },
    {
      id: "hust-laravel-engine-alive",
      name: "🟢 Laravel Engine Alive",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 500, y: 560 },
      disabled: false,
    },
  ],
  stickyNotes: [
    {
      id: "hust-laravel-note-ingress",
      name: "Sticky Ingress",
      type: "n8n-nodes-base.stickyNote",
      typeVersion: 1,
      position: { x: -40, y: -180 },
      disabled: false,
      content: "### 1. TRACE INGRESS\nWebhook nhận telemetry từ Laravel Middleware (Reflection)",
      width: 380,
      height: 520,
      color: 7,
    },
    {
      id: "hust-laravel-note-modules",
      name: "Sticky Modules",
      type: "n8n-nodes-base.stickyNote",
      typeVersion: 1,
      position: { x: 380, y: -180 },
      disabled: false,
      content: "### 2. LARAVEL MODULES\nTự động phân loại theo Controller và nghiệp vụ đang chạy",
      width: 440,
      height: 520,
      color: 5,
    },
    {
      id: "hust-laravel-note-health",
      name: "Sticky Health",
      type: "n8n-nodes-base.stickyNote",
      typeVersion: 1,
      position: { x: 860, y: -180 },
      disabled: false,
      content: "### 3. HEALTH & METRICS\nTheo dõi lỗi 4xx/5xx và cảnh báo request chậm",
      width: 420,
      height: 520,
      color: 4,
    },
    {
      id: "hust-laravel-note-heartbeat",
      name: "Sticky Heartbeat",
      type: "n8n-nodes-base.stickyNote",
      typeVersion: 1,
      position: { x: -40, y: 380 },
      disabled: false,
      content: "### 4. HEARTBEAT\nPing Laravel port 8805 định kỳ để xác nhận engine còn sống",
      width: 860,
      height: 320,
      color: 6,
    },
  ],
  edges: [
    {
      id: "hust-laravel-webhook-receiver-main-0-hust-laravel-trace-parser-0",
      source: "hust-laravel-webhook-receiver",
      target: "hust-laravel-trace-parser",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-manual-trigger-main-0-hust-laravel-trace-parser-0",
      source: "hust-laravel-manual-trigger",
      target: "hust-laravel-trace-parser",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-trace-parser-main-0-hust-laravel-module-router-0",
      source: "hust-laravel-trace-parser",
      target: "hust-laravel-module-router",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-module-router-main-0-hust-laravel-node-gitea-0",
      source: "hust-laravel-module-router",
      target: "hust-laravel-node-gitea",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-module-router-main-1-hust-laravel-check-git-control-0",
      source: "hust-laravel-module-router",
      target: "hust-laravel-check-git-control",
      sourceHandle: "main-1",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-check-git-control-main-0-hust-laravel-node-git-control-0",
      source: "hust-laravel-check-git-control",
      target: "hust-laravel-node-git-control",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-check-git-control-main-1-hust-laravel-node-core-0",
      source: "hust-laravel-check-git-control",
      target: "hust-laravel-node-core",
      sourceHandle: "main-1",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-node-gitea-main-0-hust-laravel-check-status-error-0",
      source: "hust-laravel-node-gitea",
      target: "hust-laravel-check-status-error",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-node-git-control-main-0-hust-laravel-check-status-error-0",
      source: "hust-laravel-node-git-control",
      target: "hust-laravel-check-status-error",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-node-core-main-0-hust-laravel-check-status-error-0",
      source: "hust-laravel-node-core",
      target: "hust-laravel-check-status-error",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-check-status-error-main-0-hust-laravel-node-alert-error-0",
      source: "hust-laravel-check-status-error",
      target: "hust-laravel-node-alert-error",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-check-status-error-main-1-hust-laravel-check-latency-0",
      source: "hust-laravel-check-status-error",
      target: "hust-laravel-check-latency",
      sourceHandle: "main-1",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-check-latency-main-0-hust-laravel-node-alert-slow-0",
      source: "hust-laravel-check-latency",
      target: "hust-laravel-node-alert-slow",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-check-latency-main-1-hust-laravel-node-healthy-0",
      source: "hust-laravel-check-latency",
      target: "hust-laravel-node-healthy",
      sourceHandle: "main-1",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-heartbeat-schedule-main-0-hust-laravel-ping-http-0",
      source: "hust-laravel-heartbeat-schedule",
      target: "hust-laravel-ping-http",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "hust-laravel-ping-http-main-0-hust-laravel-engine-alive-0",
      source: "hust-laravel-ping-http",
      target: "hust-laravel-engine-alive",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
  ],
  meta: {
    nodeCount: 16,
    stickyNoteCount: 4,
    totalNodeCount: 20,
    edgeCount: 16,
  },
};

// Sample mock trace events matching stage_node_ids
export const SAMPLE_TRACES = [
  {
    event: "laravel_trace",
    event_id: "demo-trace-success",
    workflow_id: DEFAULT_WORKFLOW_ID,
    status: "success",
    status_code: 200,
    duration_ms: 38.6,
    stage_node_ids: [
      "laravel-chat-api-ingress",
      "laravel-chat-session-middleware",
      "laravel-chat-rate-limit",
      "hust-laravel-node-core",
      "laravel-chat-endpoint-router",
      "laravel-chat-list-rooms",
      "laravel-chat-legacy-database",
      "laravel-chat-json-response",
    ],
    trace: {
      uri: "api/chat/bot/rooms/list",
      method: "GET",
    },
    timestamp: new Date().toISOString(),
  },
  {
    event: "laravel_trace",
    event_id: "demo-trace-slow",
    workflow_id: DEFAULT_WORKFLOW_ID,
    status: "slow",
    status_code: 200,
    duration_ms: 1240.2,
    stage_node_ids: [
      "laravel-chat-api-ingress",
      "laravel-chat-session-middleware",
      "laravel-chat-rate-limit",
      "hust-laravel-node-core",
      "laravel-chat-endpoint-router",
      "laravel-chat-save-turn",
      "laravel-chat-save-turn-service",
      "laravel-chat-legacy-database",
      "laravel-chat-json-response",
    ],
    trace: {
      uri: "api/chat/bot/rooms/1/messages",
      method: "POST",
    },
    timestamp: new Date().toISOString(),
  },
  {
    event: "laravel_trace",
    event_id: "demo-trace-error",
    workflow_id: DEFAULT_WORKFLOW_ID,
    status: "error",
    status_code: 500,
    duration_ms: 85.1,
    stage_node_ids: [
      "laravel-chat-api-ingress",
      "laravel-chat-session-middleware",
      "laravel-chat-rate-limit",
      "hust-laravel-node-core",
      "laravel-chat-endpoint-router",
      "laravel-chat-create-room",
      "laravel-chat-create-room-service",
      "laravel-chat-openclaw-create-conversation",
      "laravel-chat-error-json-response",
    ],
    trace: {
      uri: "api/chat/bot/rooms",
      method: "POST",
    },
    timestamp: new Date().toISOString(),
  },
];

/**
 * Fetch the dedicated media_tech_laravel graph from the new Node backend.
 */
export const fetchWorkflowGraph = async (workflowId = DEFAULT_WORKFLOW_ID) => {
  try {
    const query = workflowId ? `?workflow_id=${encodeURIComponent(workflowId)}` : "";
    const response = await fetch(`${getNodeBackendUrl()}/openclaw/workflow/laravel/graph${query}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Lỗi mạng HTTP: ${response.status} ${response.statusText}`);
    }

    const body = await response.json();
    // Node backend bọc graph n8n đã chuẩn hóa trong api_results.graph.
    const graph = body.nodes || body.connections ? body : body.api_results?.graph || body.graph;

    if (graph && (graph.nodes || graph.flowNodes)) {
      const isSticky = (n) => Boolean(
        n?.isStickyNote ||
        n?.type === "stickyNote" ||
        n?.type === "n8n-nodes-base.stickyNote" ||
        (typeof n?.type === "string" && n.type.toLowerCase().includes("stickynote"))
      );

      const allRawNodes = graph.nodes || graph.flowNodes || [];
      const flowNodes = allRawNodes.filter((n) => !isSticky(n));

      // Gộp và deduplicate stickyNotes từ cả stickyNotes và các node stickyNote trong nodes
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

      const connections = graph.connections || {};
      const edges = graph.edges || [];
      const resolvedWorkflowId = graph.workflow_id || graph.id || workflowId;
      const resolvedName = graph.name || "media_tech_realtime";

      return {
        success: true,
        graph: {
          ...graph,
          id: resolvedWorkflowId,
          workflowId: resolvedWorkflowId,
          name: resolvedName,
          nodes: flowNodes,
          flowNodes: flowNodes,
          stickyNotes,
          connections,
          edges,
          version: graph.version,
          updated_at: graph.updated_at,
          meta: graph.meta || {
            nodeCount: flowNodes.length,
            stickyNoteCount: stickyNotes.length,
            totalNodeCount: flowNodes.length + stickyNotes.length,
            connectionCount: Object.keys(connections).length,
            edgeCount: edges.length,
          },
        },
      };
    }

    return {
      success: false,
      error: {
        message: body.message || "Không thể tải sơ đồ workflow từ máy chủ.",
        httpStatus: response.status,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : "Đã có lỗi xảy ra khi kết nối tới API.",
      },
    };
  }
};

/**
 * Kiểm tra trạng thái health và cấu hình xác thực Laravel trace của Node backend
 * Endpoint: GET <Node backend>/openclaw/workflow/laravel/health
 */
export const fetchWorkflowHealth = async () => {
  try {
    const response = await fetch(`${getNodeBackendUrl()}/openclaw/workflow/laravel/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const isJson = (response.headers.get("content-type") || "").includes("application/json");
    const data = isJson ? await response.json() : { raw: await response.text() };

    return {
      success: response.ok,
      httpStatus: response.status,
      data,
      laravelTraceReceiverConfigured: Boolean(data?.laravel_trace_receiver_configured),
    };
  } catch (err) {
    return {
      success: false,
      httpStatus: 0,
      error: err instanceof Error ? err.message : "Không thể kết nối máy chủ health.",
      laravelTraceReceiverConfigured: false,
    };
  }
};

/**
 * Pipeline trace mẫu khớp với các node của media_tech_laravel.
 */
export const SAMPLE_REALTIME_LARAVEL_PIPELINE = [
  {
    event: "stage.started",
    request_id: "laravel-req-demo-1",
    stage: "laravel.chat_bot",
    phase: "start",
    stage_node_ids: [
      "laravel-chat-api-ingress",
      "laravel-chat-session-middleware",
      "laravel-chat-rate-limit",
    ],
    timestamp: new Date().toISOString(),
  },
  {
    event: "stage.completed",
    request_id: "laravel-req-demo-1",
    stage: "laravel.chat_bot",
    phase: "complete",
    duration_ms: 450,
    outcome: "success",
    stage_node_ids: [
      "laravel-chat-api-ingress",
      "laravel-chat-session-middleware",
      "laravel-chat-rate-limit",
      "hust-laravel-node-core",
      "laravel-chat-endpoint-router",
      "laravel-chat-create-room",
      "laravel-chat-create-room-service",
      "laravel-chat-openclaw-create-conversation",
      "laravel-chat-legacy-database",
      "laravel-chat-json-response",
    ],
    timestamp: new Date().toISOString(),
  },
];

