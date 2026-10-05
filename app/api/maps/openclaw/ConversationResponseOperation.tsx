"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import SwaggerClient, { OPENCLAW_SERVER_URL_STORAGE_KEY } from "../SwaggerClient";

const conversationResponseSpec = {
  openapi: "3.0.3",
  info: { title: "Conversation response", version: "1.0.0" },
  servers: [
    { url: "https://node_md.hust.media/", description: "OpenClaw Production Gateway" },
    { url: "http://localhost:2999/openclaw", description: "Node.js Gateway Local (cổng 2999)" },
    { url: "http://localhost:8818", description: "Backend Node.js local (cổng 8818)" },
    { url: "https://nginx.hust.media/go/ai/test", description: "Backend test" },
  ],
  security: [{ BearerAuth: [] }],
  tags: [{ name: "Responses" }],
  paths: {
    "/openclaw/v1/responses": {
      post: {
        operationId: "createConversationResponse",
        tags: ["Responses"],
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
        (item) => (item.querySelector<HTMLElement>(".opblock-tag")?.textContent || "").trim().startsWith("Responses"),
      );
      if (!section) return;
      let slot = document.getElementById("conversation-response-operation-slot") as HTMLElement | null;
      if (!slot) {
        slot = document.createElement("div");
        slot.id = "conversation-response-operation-slot";
      }
      const secondSlot = section.querySelector<HTMLElement>("#second-response-operation-slot");
      const baseResponse = Array.from(section.querySelectorAll<HTMLElement>(".opblock")).find(
        (item) =>
          !item.closest("#second-response-operation-slot, #conversation-response-operation-slot") &&
          item.textContent?.includes("/openclaw/v1/responses"),
      );
      const targetElement = secondSlot || baseResponse;
      if (targetElement?.parentElement) {
        if (slot.parentElement !== targetElement.parentElement || slot.previousElementSibling !== targetElement) {
          targetElement.parentElement.insertBefore(slot, targetElement.nextSibling);
        }
      } else if (slot.parentElement !== section) {
        section.appendChild(slot);
      }
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
      <SwaggerClient
        spec={conversationResponseSpec}
        compact
        serverStorageKey={OPENCLAW_SERVER_URL_STORAGE_KEY}
      />
    </div>,
    portalNode,
  );
}
