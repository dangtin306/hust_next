"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import SwaggerClient from "../SwaggerClient";

const conversationResponseSpec = {
  openapi: "3.0.3",
  info: { title: "Conversation response", version: "1.0.0" },
  servers: [{ url: "http://localhost:8006", description: "Backend OpenClaw" }],
  security: [{ BearerAuth: [] }],
  tags: [{ name: "Conversations" }],
  paths: {
    "/openclaw/v1/responses": {
      post: {
        operationId: "createConversationResponse",
        tags: ["Conversations"],
        summary: "Gửi tin nhắn để OpenClaw xử lý",
        description: "Gửi tin nhắn mới và liên kết với conversation bằng conversation_id.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true },
              example: {
                model: "gpt-5.6-luna",
                conversation_id: "conv_550e8400-e29b-41d4-a716-446655440000",
                input: [{ role: "user", content: "Xin chào, hãy giới thiệu về Media Tech" }],
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

export default function ConversationResponseOperation() {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const ensureSlot = () => {
      const section = Array.from(document.querySelectorAll<HTMLElement>(".opblock-tag-section")).find(
        (item) => (item.querySelector<HTMLElement>(".opblock-tag")?.textContent || "").trim().startsWith("Conversations"),
      );
      if (!section) return;
      let slot = section.querySelector<HTMLElement>("#conversation-response-operation-slot");
      if (!slot) {
        slot = document.createElement("div");
        slot.id = "conversation-response-operation-slot";
      }
      if (slot.parentElement !== section) section.appendChild(slot);
      setPortalNode(slot);
    };

    ensureSlot();
    const observer = new MutationObserver(ensureSlot);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      setPortalNode(null);
      document.getElementById("conversation-response-operation-slot")?.remove();
    };
  }, []);

  if (!portalNode) return null;
  return createPortal(
    <div className="conversation-response-swagger">
      <SwaggerClient spec={conversationResponseSpec} compact />
    </div>,
    portalNode,
  );
}
