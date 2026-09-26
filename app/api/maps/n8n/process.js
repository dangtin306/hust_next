/**
 * OpenClaw & Node.js Activity Tracing Process Logic
 *
 * Chuẩn địa chỉ hệ thống:
 * - n8n server: http://vip.tecom.pro:8809
 * - Webhook nhận telemetry: http://vip.tecom.pro:8809/webhook/node-activity-trace
 * - Node backend SSE: https://node_md.hust.media/openclaw/workflow/events
 * - Node backend health: https://node_md.hust.media/openclaw/workflow/health
 *
 * Hai nhánh hoạt động độc lập:
 * - Nhánh 1: Node backend node_md.hust.media -> SSE -> Next.js frontend (tín hiệu request/stage realtime)
 * - Nhánh 2: Node backend -> OpenTelemetry Collector -> n8n vip.tecom.pro:8809 (telemetry gửi vào workflow)
 */

export const DEFAULT_WORKFLOW_ID = "OpenClawNodeActivity8809";
export const OPENCLAW_REALTIME_WORKFLOW_ID = "0KwASApTaZfyktBi";

// Cấu hình chuẩn không dùng loopback hay port nhầm
export const N8N_SERVER_URL = "http://vip.tecom.pro:8809";
export const N8N_TARGET_PORT = 8809;
export const TARGET_WEBHOOK_URL = "http://vip.tecom.pro:8809/webhook/node-activity-trace";

export const NODE_BACKEND_SSE_URL = "https://node_md.hust.media/openclaw/workflow/events";
export const NODE_BACKEND_HEALTH_URL = "https://node_md.hust.media/openclaw/workflow/health";
export const NODE_BACKEND_GRAPH_URL = "https://node_md.hust.media/openclaw/workflow/graph";
export const NODE_BACKEND_HOST = "node_md.hust.media";

const OPENCLAW_SERVICE_NODE_DEFINITIONS = [
  { serviceId: "media_text_to_image", id: "ee84c439-2efc-47e7-8b0b-5ebafe22da07", position: { x: 1260, y: -980 } },
  { serviceId: "media_text_to_text", id: "25478a40-28e5-4373-9b66-205c593f8794", position: { x: 1530, y: -980 } },
  { serviceId: "media_content_smart", id: "3e818377-4a3e-42e3-ac1e-8ea637aabc0d", position: { x: 1800, y: -980 } },
  { serviceId: "media_spell_check", id: "40358c2e-4cd5-4ab3-b55d-730bacf216f2", position: { x: 2070, y: -980 } },
  { serviceId: "media_script_writing", id: "187cb020-77d5-4c51-8102-21277c8562fa", position: { x: 1395, y: -800 } },
  { serviceId: "media_image_to_text", id: "d015b908-5547-44f8-99f6-5d4a6f9f99f7", position: { x: 1665, y: -800 } },
  { serviceId: "media_text_to_speech", id: "b3c64536-4524-4716-b9a8-24381b998946", position: { x: 1935, y: -800 } },
];

const SERVICE_REGION_NOTE = {
  id: "openclaw-service-telemetry-region",
  name: "OpenClaw Service Telemetry",
  isStickyNote: true,
  content: "# OpenClaw Service Telemetry\n7 service nodes are highlighted from SSE events using service_id.\nWorkflow: 0KwASApTaZfyktBi",
  color: 6,
  position: { x: 1220, y: -1040 },
  width: 1150,
  height: 410,
};

/**
 * Trả về endpoint proxy SSE trên cùng origin Next.js có tính đến basePath (/next)
 */
export function getSseProxyUrl() {
  if (typeof window === "undefined") {
    return "/next/api/node-activity/events";
  }
  const hasNextPrefix = window.location.pathname.startsWith("/next");
  return hasNextPrefix ? "/next/api/node-activity/events" : "/api/node-activity/events";
}

/**
 * Trả về endpoint proxy Health trên cùng origin Next.js
 */
export function getHealthProxyUrl() {
  if (typeof window === "undefined") {
    return "/next/api/node-activity/health";
  }
  const hasNextPrefix = window.location.pathname.startsWith("/next");
  return hasNextPrefix ? "/next/api/node-activity/health" : "/api/node-activity/health";
}

/**
 * Tải cấu trúc workflow thật từ Node backend API (36 nodes n8n media_tech_realtime)
 */
export async function fetchWorkflowGraph() {
  try {
    const res = await fetch(NODE_BACKEND_GRAPH_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return { success: true, graph: upsertOpenClawServiceNodes(data) };
  } catch (err) {
    console.warn("[WorkflowGraph] Could not fetch remote graph, falling back to local:", err);
    return { success: false, error: err };
  }
}

/**
 * Ánh xạ stage từ sự kiện SSE lên node ID/tên tương ứng trên đồ thị.
 * Khớp chuẩn cả sơ đồ n8n 36-node thực tế từ backend lẫn sơ đồ fallback.
 */
export function mapStageToNodeId(stageName) {
  if (!stageName) return "node-stage-unclassified";
  const s = String(stageName).trim().toLowerCase();

  // 1. Khớp chính xác các stage thực tế từ Node backend OpenClaw
  if (s === "openclaw.codex" || s.includes("codex")) {
    return [
      "2f47be3b-91d7-4d22-9ac2-6c68ef1d20e0",
      "OpenClaw Chat API",
      "node-stage-codex",
    ];
  }
  if (s === "openclaw.conversations" || s.includes("conversation")) {
    return [
      "b84a8b04-86ec-4a97-a35c-9b733490b9a2",
      "Prepare media_tech OpenClaw message",
      "node-stage-conversations",
    ];
  }
  if (s === "openclaw.pairing_gate" || s.includes("pairing")) {
    return [
      "2f47be3b-91d7-4d22-9ac2-6c68ef1d20df",
      "2f47be3b-91d7-4d22-9ac2-6c68ef1d20c4",
      "Is OpenClaw?",
      "Route chat command (/oc /level /v3 /v4)",
      "node-stage-pairing-gate",
    ];
  }
  if (s === "openclaw.native" || s.includes("native")) {
    return "node-stage-native";
  }
  if (s === "qdrant" || s.includes("qdrant") || s.includes("vector") || s.includes("rag")) {
    return [
      "2f47be3b-91d7-4d22-9ac2-6c68ef1d20cd",
      "IBM Search API",
      "Build V4 RAG prompt",
      "node-stage-qdrant",
    ];
  }
  if (s === "ai.test_1" || s === "test_1" || s.includes("test_1")) {
    return [
      "2f47be3b-91d7-4d22-9ac2-6c68ef1d20b7",
      "Qwen Level API",
      "node-stage-ai-test1",
    ];
  }
  if (s === "ai.test_2" || s === "test_2" || s.includes("test_2")) {
    return [
      "2f47be3b-91d7-4d22-9ac2-6c68ef1d20b4",
      "Qwen V4 API",
      "node-stage-ai-test2",
    ];
  }
  if (s === "openclaw.docker_test" || s.includes("docker_test")) {
    return [
      "2f47be3b-91d7-4d22-9ac2-6c68ef1d20c2",
      "Test input - change route here",
      "node-stage-docker-test",
    ];
  }
  if (s === "openclaw.docker_input" || s.includes("docker_input")) {
    return [
      "2f47be3b-91d7-4d22-9ac2-6c68ef1d20c1",
      "Run test data",
      "node-stage-docker-input",
    ];
  }

  // 2. Khớp generic dự phòng
  if (s.includes("auth") || s.includes("token") || s.includes("security")) {
    return ["2f47be3b-91d7-4d22-9ac2-6c68ef1d20df", "Is OpenClaw?", "node-stage-pairing-gate"];
  }
  if (s.includes("agent") || s.includes("llm") || s.includes("prompt") || s.includes("inference")) {
    return ["2f47be3b-91d7-4d22-9ac2-6c68ef1d20e0", "OpenClaw Chat API", "node-stage-codex"];
  }
  if (s.includes("tool") || s.includes("cli") || s.includes("command") || s.includes("terminal")) {
    return "node-stage-native";
  }
  if (s.includes("stream") || s.includes("synthesis") || s.includes("chunk") || s.includes("sse")) {
    return ["node-sse-stream"];
  }

  // Stage chưa phân loại
  return "node-stage-unclassified";
}

// Map each OpenClaw service execution to its dedicated node in the live workflow graph.
export function mapServiceIdToNodeId(serviceId) {
  return OPENCLAW_SERVICE_NODE_DEFINITIONS.find((node) => node.serviceId === serviceId)?.id || null;
}

/** Upsert telemetry nodes only into the intended media_tech_realtime workflow graph. */
export function upsertOpenClawServiceNodes(inputGraph) {
  const graph = inputGraph?.graph && typeof inputGraph.graph === "object"
    ? inputGraph.graph
    : inputGraph;
  const workflowId = graph?.id || graph?.workflowId || graph?.workflow?.id;
  if (workflowId !== OPENCLAW_REALTIME_WORKFLOW_ID) return inputGraph;

  const sourceNodes = Array.isArray(graph.nodes)
    ? graph.nodes
    : Array.isArray(graph.flowNodes)
    ? graph.flowNodes
    : [];
  const nodesById = new Map(sourceNodes.filter((node) => node?.id).map((node) => [node.id, node]));

  OPENCLAW_SERVICE_NODE_DEFINITIONS.forEach(({ serviceId, id, position }) => {
    const existing = nodesById.get(id);
    nodesById.set(id, existing
      ? { ...existing, name: serviceId }
      : {
          id,
          name: serviceId,
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position,
          disabled: false,
          parameters: {},
        });
  });

  const nodes = Array.from(nodesById.values());
  const stickyNotes = Array.isArray(graph.stickyNotes) ? graph.stickyNotes : [];
  const notesById = new Map(stickyNotes.filter((note) => note?.id).map((note) => [note.id, note]));
  if (!notesById.has(SERVICE_REGION_NOTE.id)) {
    notesById.set(SERVICE_REGION_NOTE.id, SERVICE_REGION_NOTE);
  }

  const patchedGraph = {
    ...graph,
    nodes,
    ...(Array.isArray(graph.flowNodes) ? { flowNodes: nodes } : {}),
    stickyNotes: Array.from(notesById.values()),
  };

  return graph === inputGraph ? patchedGraph : { ...inputGraph, graph: patchedGraph };
}

// Cấu trúc Graph thể hiện rõ 2 nhánh độc lập và các stage thực tế từ OpenClaw backend
export const MOCK_GRAPH_DATA = {
  workflowId: DEFAULT_WORKFLOW_ID,
  name: "Node.js & n8n Dual-Branch Realtime Pipeline",
  active: true,
  workflow: {
    id: DEFAULT_WORKFLOW_ID,
    name: "Node.js & n8n Dual-Branch Realtime Pipeline",
    active: true,
  },
  nodes: [
    // ==========================================
    // NHÁNH 1: Node Backend Runtime & SSE (node_md.hust.media)
    // ==========================================
    {
      id: "node-backend-server",
      name: "Node Ingress (node_md.hust.media)",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: { x: -30, y: -40 },
      disabled: false,
    },
    {
      id: "node-request-started",
      name: "Request Started (Method & Route)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 190, y: -40 },
      disabled: false,
    },

    // Gateway & Storage
    {
      id: "node-stage-pairing-gate",
      name: "🚪 Pairing Gate (openclaw.pairing_gate)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 420, y: -130 },
      disabled: false,
    },
    {
      id: "node-stage-conversations",
      name: "💬 Conversations (openclaw.conversations)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 420, y: 50 },
      disabled: false,
    },

    // Core Engine & Services
    {
      id: "node-stage-codex",
      name: "🧠 Codex LLM Engine (openclaw.codex)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 660, y: -170 },
      disabled: false,
    },
    {
      id: "node-stage-native",
      name: "⚙️ OpenClaw Native (openclaw.native)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 660, y: -50 },
      disabled: false,
    },
    {
      id: "node-stage-qdrant",
      name: "🔍 Qdrant Vector DB (qdrant)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 660, y: 60 },
      disabled: false,
    },

    // Sandboxes & AI Processing
    {
      id: "node-stage-docker-test",
      name: "🐳 Docker Test (openclaw.docker_test)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 910, y: -200 },
      disabled: false,
    },
    {
      id: "node-stage-docker-input",
      name: "📥 Docker Input (openclaw.docker_input)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 910, y: -120 },
      disabled: false,
    },
    {
      id: "node-stage-ai-test1",
      name: "⚡ AI Pipeline 1 (ai.test_1)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 910, y: -40 },
      disabled: false,
    },
    {
      id: "node-stage-ai-test2",
      name: "⚡ AI Pipeline 2 (ai.test_2)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 910, y: 40 },
      disabled: false,
    },
    {
      id: "node-stage-unclassified",
      name: "❓ Dynamic Stage (Fallback)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 910, y: 130 },
      disabled: false,
    },

    // Outcome
    {
      id: "node-request-outcome",
      name: "Request Outcome (200 / 4xx / 5xx)",
      type: "n8n-nodes-base.switch",
      typeVersion: 3.2,
      position: { x: 1150, y: -40 },
      disabled: false,
    },

    // SSE Stream & Frontend Client
    {
      id: "node-sse-stream",
      name: "📡 Node Backend SSE (/events)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 190, y: 160 },
      disabled: false,
    },
    {
      id: "node-frontend-client",
      name: "💻 Next.js Client (EventSource)",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: { x: 190, y: 250 },
      disabled: false,
    },

    // ==========================================
    // NHÁNH 2: OpenTelemetry & n8n Workflow (8809)
    // ==========================================
    {
      id: "node-otel-collector",
      name: "📊 OpenTelemetry Collector",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: { x: 1380, y: -90 },
      disabled: false,
    },
    {
      id: "node-n8n-webhook-ingress",
      name: "n8n Webhook Ingress (8809)",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: { x: 1570, y: -90 },
      disabled: false,
    },
    {
      id: "node-n8n-pipeline-router",
      name: "n8n Workflow Pipeline Router",
      type: "n8n-nodes-base.switch",
      typeVersion: 3.2,
      position: { x: 1570, y: 10 },
      disabled: false,
    },
    {
      id: "node-n8n-sla-monitor",
      name: "n8n SLA & Error Monitor (>1.5s)",
      type: "n8n-nodes-base.if",
      typeVersion: 2.3,
      position: { x: 1570, y: 110 },
      disabled: false,
    },
    {
      id: "node-n8n-execution-ack",
      name: "n8n Execution Status (Độc lập)",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: { x: 1570, y: 210 },
      disabled: false,
    },
  ],
  stickyNotes: [
    {
      id: "sticky-branch-1-sse",
      content:
        "Nhánh 1: Node Backend Runtime & SSE Stream (https://node_md.hust.media)\nPhát tín hiệu realtime: request.started, stage.started, stage.completed, stage.failed, request.completed.\nPhản ánh trực tiếp các công đoạn: Pairing Gate -> Conversations -> Codex LLM -> Docker & AI -> Outcome.",
      color: 5, // Blue
      position: { x: -60, y: -240 },
      width: 1400,
      height: 560,
    },
    {
      id: "sticky-branch-2-n8n",
      content:
        "Nhánh 2: OpenTelemetry Collector & n8n Workflow (vip.tecom.pro:8809)\nNode backend gửi telemetry sang OpenTelemetry Collector rồi nạp vào n8n qua webhook http://vip.tecom.pro:8809/webhook/node-activity-trace.\nQuy trình n8n chạy độc lập và không phụ thuộc vào trạng thái SSE.",
      color: 4, // Emerald
      position: { x: 1350, y: -240 },
      width: 440,
      height: 560,
    },
  ],
  edges: [
    // Nhánh 1: Ingress -> Started
    {
      id: "e-backend-to-req",
      source: "node-backend-server",
      target: "node-request-started",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    // Ingress -> SSE -> Frontend Client
    {
      id: "e-backend-to-sse",
      source: "node-backend-server",
      target: "node-sse-stream",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-sse-to-frontend",
      source: "node-sse-stream",
      target: "node-frontend-client",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },

    // Started -> Gateway & Storage
    {
      id: "e-req-to-pairing",
      source: "node-request-started",
      target: "node-stage-pairing-gate",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-pairing-to-conv",
      source: "node-stage-pairing-gate",
      target: "node-stage-conversations",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },

    // Conversations -> Core Engines
    {
      id: "e-conv-to-codex",
      source: "node-stage-conversations",
      target: "node-stage-codex",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-conv-to-native",
      source: "node-stage-conversations",
      target: "node-stage-native",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-conv-to-qdrant",
      source: "node-stage-conversations",
      target: "node-stage-qdrant",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },

    // Codex -> Sandboxes & AI Pipelines
    {
      id: "e-codex-to-docker-test",
      source: "node-stage-codex",
      target: "node-stage-docker-test",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-docker-test-to-input",
      source: "node-stage-docker-test",
      target: "node-stage-docker-input",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-codex-to-ai-test1",
      source: "node-stage-codex",
      target: "node-stage-ai-test1",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-ai-test1-to-ai-test2",
      source: "node-stage-ai-test1",
      target: "node-stage-ai-test2",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-req-to-unclassified",
      source: "node-request-started",
      target: "node-stage-unclassified",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },

    // Stages -> Request Outcome
    {
      id: "e-pairing-to-outcome",
      source: "node-stage-pairing-gate",
      target: "node-request-outcome",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-conv-to-outcome",
      source: "node-stage-conversations",
      target: "node-request-outcome",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-codex-to-outcome",
      source: "node-stage-codex",
      target: "node-request-outcome",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-native-to-outcome",
      source: "node-stage-native",
      target: "node-request-outcome",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-qdrant-to-outcome",
      source: "node-stage-qdrant",
      target: "node-request-outcome",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-docker-to-outcome",
      source: "node-stage-docker-input",
      target: "node-request-outcome",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-ai-to-outcome",
      source: "node-stage-ai-test2",
      target: "node-request-outcome",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-unclassified-to-outcome",
      source: "node-stage-unclassified",
      target: "node-request-outcome",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },

    // Nhánh 2: Node Backend -> Otel -> n8n Webhook -> Router -> SLA -> Execution Ack
    {
      id: "e-backend-to-otel",
      source: "node-backend-server",
      target: "node-otel-collector",
      sourceHandle: "main-0",
      targetHandle: "main-0",
      style: { strokeDasharray: "5,5", stroke: "#10b981" },
    },
    {
      id: "e-otel-to-n8n-webhook",
      source: "node-otel-collector",
      target: "node-n8n-webhook-ingress",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-n8n-webhook-to-router",
      source: "node-n8n-webhook-ingress",
      target: "node-n8n-pipeline-router",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-n8n-router-to-sla",
      source: "node-n8n-pipeline-router",
      target: "node-n8n-sla-monitor",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
    {
      id: "e-n8n-sla-to-ack",
      source: "node-n8n-sla-monitor",
      target: "node-n8n-execution-ack",
      sourceHandle: "main-0",
      targetHandle: "main-0",
    },
  ],
  meta: {
    nodeCount: 19,
    stickyNoteCount: 2,
    totalNodeCount: 21,
    edgeCount: 23,
  },
};

// Preset sự kiện SSE mẫu DÀNH RIÊNG CHO MỤC ĐÍCH DEMO / KIỂM THỬ (tách bạch rõ ràng với luồng live)
export const DEMO_SSE_EVENTS = [
  {
    name: "[Demo] 1. Request Started (POST /openclaw/v1/responses)",
    eventName: "request.started",
    payload: {
      id: "evt_req_start_1",
      type: "request.started",
      request_id: "demo_trace_01",
      trace_id: "demo_trace_01",
      method: "POST",
      route: "/openclaw/v1/responses",
      timestamp: new Date().toISOString(),
    },
  },
  {
    name: "[Demo] 2. Stage: openclaw.pairing_gate (Auth & Route Check)",
    eventName: "stage.started",
    payload: {
      id: "evt_stage_pairing_2",
      type: "stage.started",
      request_id: "demo_trace_01",
      trace_id: "demo_trace_01",
      stage: "openclaw.pairing_gate",
      timestamp: new Date().toISOString(),
    },
  },
  {
    name: "[Demo] 3. Stage: openclaw.conversations (Session Context)",
    eventName: "stage.started",
    payload: {
      id: "evt_stage_conv_3",
      type: "stage.started",
      request_id: "demo_trace_01",
      trace_id: "demo_trace_01",
      stage: "openclaw.conversations",
      timestamp: new Date().toISOString(),
    },
  },
  {
    name: "[Demo] 4. Stage: openclaw.codex (LLM Inference)",
    eventName: "stage.started",
    payload: {
      id: "evt_stage_codex_4",
      type: "stage.started",
      request_id: "demo_trace_01",
      trace_id: "demo_trace_01",
      stage: "openclaw.codex",
      timestamp: new Date().toISOString(),
    },
  },
  {
    name: "[Demo] 5. Stage Completed: openclaw.codex (850ms)",
    eventName: "stage.completed",
    payload: {
      id: "evt_stage_codex_comp_5",
      type: "stage.completed",
      request_id: "demo_trace_01",
      trace_id: "demo_trace_01",
      stage: "openclaw.codex",
      duration_ms: 850,
      outcome: "success",
      timestamp: new Date().toISOString(),
    },
  },
  {
    name: "[Demo] 6. Request Completed (HTTP 200 OK)",
    eventName: "request.completed",
    payload: {
      id: "evt_req_comp_6",
      type: "request.completed",
      request_id: "demo_trace_01",
      trace_id: "demo_trace_01",
      method: "POST",
      route: "/openclaw/v1/responses",
      status_code: 200,
      duration_ms: 920,
      outcome: "success",
      timestamp: new Date().toISOString(),
    },
  },
  {
    name: "[Demo] 7. Replay Gap Detected",
    eventName: "replay_gap",
    payload: {
      id: "evt_replay_gap_7",
      type: "replay_gap",
      message: "Replay window gap detected. State re-synchronized with server.",
      timestamp: new Date().toISOString(),
    },
  },
];
