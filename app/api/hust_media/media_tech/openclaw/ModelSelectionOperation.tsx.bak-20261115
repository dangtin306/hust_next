"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import SwaggerClient, { OPENCLAW_SERVER_URL_STORAGE_KEY } from "../SwaggerClient";

const modelSelectionSpec = {
  openapi: "3.0.3",
  info: { title: "Model selection", version: "1.0.0" },
  servers: [
    { url: "/next/api/hust/openclaw", description: "Hust Next.js OpenClaw API Proxy" },
    { url: "https://node_js.hust.media/openclaw", description: "OpenClaw Production Gateway" },
    { url: "http://localhost:2999/openclaw", description: "Node.js Gateway Local (cổng 2999)" },
    { url: "http://localhost:8818/openclaw", description: "Backend Node.js local (cổng 8818)" },
  ],
  security: [{ BearerAuth: [] }],
  tags: [{ name: "Model Selection" }],
  paths: {
    "/v1/responses": {
      post: {
        operationId: "createResponseWithSelectedModel",
        tags: ["Model Selection"],
        summary: "Chuyển model cho request",
        description: "Chọn model từ danh sách rồi gửi model đó trong request Responses.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true },
              example: {
                model: "gpt-5.6-luna",
                input: [{ role: "user", content: "Xin chào" }],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Response hoàn tất theo định dạng Responses API",
            content: { "application/json": { schema: { type: "object", additionalProperties: true } } },
          },
          "400": { description: "Request không hợp lệ" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: { type: "http", scheme: "bearer", description: "Nhập token API, ví dụ hust_media." },
    },
  },
};

// This is a second documented use of the same Responses endpoint, not a new route.
const resetChatSpec = {
  openapi: "3.0.3",
  info: { title: "Reset chat", version: "1.0.0" },
  servers: [
    { url: "/next/api/hust/openclaw", description: "Hust Next.js OpenClaw API Proxy" },
    { url: "https://node_js.hust.media/openclaw", description: "OpenClaw Production Gateway" },
    { url: "http://localhost:2999/openclaw", description: "Node.js Gateway Local (cổng 2999)" },
    { url: "http://localhost:8818/openclaw", description: "Backend Node.js local (cổng 8818)" },
  ],
  security: [{ BearerAuth: [] }],
  tags: [{ name: "Model Selection" }],
  paths: {
    "/v1/responses": {
      post: {
        operationId: "resetOpenClawChat",
        tags: ["Model Selection"],
        summary: "Reset hoàn toàn chat bằng /reset",
        description: "Gửi /reset như tin nhắn user qua Responses API hiện có để OpenClaw reset phiên chat. Đây không phải endpoint riêng.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true },
              example: {
                model: "gpt-5.6-luna",
                input: [{ role: "user", content: "/reset" }],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OpenClaw đã xử lý lệnh reset",
            content: { "application/json": { schema: { type: "object", additionalProperties: true } } },
          },
          "400": { description: "Request không hợp lệ" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: { type: "http", scheme: "bearer", description: "Nhập token API, ví dụ hust_media." },
    },
  },
};

export default function ModelSelectionOperation() {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const ensureSlot = () => {
      const section = Array.from(document.querySelectorAll<HTMLElement>(".opblock-tag-section")).find(
        (item) => (item.querySelector<HTMLElement>(".opblock-tag")?.textContent || "").trim().startsWith("Model Selection"),
      );
      if (!section) return;
      const modelsOperation = Array.from(section.querySelectorAll<HTMLElement>(".opblock")).find((item) =>
        !item.closest("#model-selection-operation-slot") && item.textContent?.includes("/v1/models"),
      );
      if (!modelsOperation?.parentElement) return;
      let slot = section.querySelector<HTMLElement>("#model-selection-operation-slot");
      if (!slot) {
        slot = document.createElement("div");
        slot.id = "model-selection-operation-slot";
      }
      const parent = modelsOperation.parentElement;
      if (slot.parentElement !== parent || slot.previousElementSibling !== modelsOperation) {
        parent.insertBefore(slot, modelsOperation.nextSibling);
      }
      setPortalNode(slot);
    };

    ensureSlot();
    const observer = new MutationObserver(ensureSlot);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      setPortalNode(null);
      document.getElementById("model-selection-operation-slot")?.remove();
    };
  }, []);

  if (!portalNode) return null;
  return createPortal(
    <div className="model-selection-operations">
      <SwaggerClient
        spec={modelSelectionSpec}
        compact
        serverStorageKey={OPENCLAW_SERVER_URL_STORAGE_KEY}
      />
      <SwaggerClient
        spec={resetChatSpec}
        compact
        serverStorageKey={OPENCLAW_SERVER_URL_STORAGE_KEY}
      />
    </div>,
    portalNode,
  );
}
