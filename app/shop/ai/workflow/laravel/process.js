export const DEFAULT_WORKFLOW_ID = "HueSDxMrKc1Y4aqk";
export const API_BASE_URL = "https://node_js.hust.media/n8n/workflow_graph";
export const SOCKET_SERVER_URL = "https://node_js.hust.media";

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
      "hust-laravel-webhook-receiver",
      "hust-laravel-trace-parser",
      "hust-laravel-module-router",
      "hust-laravel-node-gitea",
      "hust-laravel-check-status-error",
      "hust-laravel-check-latency",
      "hust-laravel-node-healthy",
    ],
    trace: {
      uri: "laravel/gitea/health",
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
      "hust-laravel-webhook-receiver",
      "hust-laravel-trace-parser",
      "hust-laravel-module-router",
      "hust-laravel-node-gitea",
      "hust-laravel-check-status-error",
      "hust-laravel-check-latency",
      "hust-laravel-node-alert-slow",
    ],
    trace: {
      uri: "laravel/reports/daily_aggregate",
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
      "hust-laravel-webhook-receiver",
      "hust-laravel-trace-parser",
      "hust-laravel-module-router",
      "hust-laravel-node-gitea",
      "hust-laravel-check-status-error",
      "hust-laravel-node-alert-error",
    ],
    trace: {
      uri: "laravel/auth/oauth/token",
      method: "POST",
    },
    timestamp: new Date().toISOString(),
  },
];

/**
 * Fetch workflow graph from node_js.hust.media API and normalize response
 */
export const fetchWorkflowGraph = async (workflowId = DEFAULT_WORKFLOW_ID) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}?workflow_id=${encodeURIComponent(workflowId)}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Lỗi mạng HTTP: ${response.status} ${response.statusText}`);
    }

    const body = await response.json();
    const results = body.api_results || body;
    const graph = results.graph;

    const isSuccess =
      (body.api_status === "success" || results.graph_status === "success") &&
      Boolean(graph);

    if (isSuccess && graph) {
      const workflow = results.workflow || {
        id: graph.workflowId || workflowId,
        name: graph.name || "Hust Laravel Tracing & Monitor",
        active: graph.active !== false,
      };

      const nodes = graph.nodes || graph.flowNodes || [];
      const flowNodes = graph.flowNodes || graph.nodes || [];
      const stickyNotes = graph.stickyNotes || [];
      const edges = graph.edges || [];

      return {
        success: true,
        graph: {
          workflow,
          workflowId: workflow.id,
          name: workflow.name,
          active: workflow.active,
          nodes,
          flowNodes,
          stickyNotes,
          edges,
          meta: graph.meta || {
            nodeCount: flowNodes.length,
            stickyNoteCount: stickyNotes.length,
            totalNodeCount: flowNodes.length + stickyNotes.length,
            edgeCount: edges.length,
          },
        },
      };
    }

    const apiErr = results || {};
    return {
      success: false,
      error: {
        message:
          apiErr.graph_error === "Unauthorized"
            ? "Dịch vụ n8n backend phản hồi 'Unauthorized (401)'."
            : apiErr.graph_error || body.message || "Không thể tải sơ đồ workflow n8n",
        httpStatus: apiErr.http_status || 401,
        graphError: apiErr.graph_error || "Unauthorized",
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
 * Mẫu Socket payload chuẩn phát ra từ backend khi có event n8n:graph
 */
export const SAMPLE_GRAPH_SOCKET_EVENT = {
  event: "workflow_graph",
  workflow_id: DEFAULT_WORKFLOW_ID,
  workflow: {
    id: DEFAULT_WORKFLOW_ID,
    name: "Hust Laravel Tracing & Monitor",
    active: true,
  },
  graph: MOCK_GRAPH_DATA,
  timestamp: new Date().toISOString(),
};
