"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import SwaggerClient from "../SwaggerClient";

const modelSelectionSpec = {
  openapi: "3.0.3",
  info: { title: "Model selection", version: "1.0.0" },
  servers: [{ url: "http://localhost:8006", description: "Backend OpenClaw" }],
  security: [{ BearerAuth: [] }],
  tags: [{ name: "Model Selection" }],
  paths: {
    "/openclaw/v1/responses": {
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
      BearerAuth: { type: "http", scheme: "bearer", description: "Nhập token API, ví dụ media_tech." },
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
        item.textContent?.includes("/openclaw/v1/models"),
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
  return createPortal(<SwaggerClient spec={modelSelectionSpec} compact />, portalNode);
}
