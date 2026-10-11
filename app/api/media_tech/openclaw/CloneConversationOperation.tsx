"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import SwaggerClient, { OPENCLAW_SERVER_URL_STORAGE_KEY } from "../SwaggerClient";

const conversationSpec = {
  openapi: "3.0.3",
  info: { title: "Create conversation options", version: "1.0.0" },
  servers: [
    { url: "https://node_md.hust.media/", description: "OpenClaw Production Gateway" },
    { url: "http://localhost:2999/openclaw", description: "Node.js Gateway Local (cổng 2999)" },
    { url: "http://localhost:8818", description: "Backend Node.js local (cổng 8818)" },
    { url: "https://nginx.hust.media/go/ai/test", description: "Backend test" },
  ],
  security: [{ BearerAuth: [] }],
  tags: [{ name: "Conversations" }],
  paths: {
    "/openclaw/v1/conversations": {
      post: {
        operationId: "createConversationWithUserChoice",
        tags: ["Conversations"],
        summary: "Chat với User ID tùy chọn",
        description:
          "Tạo conversation theo một trong hai mẫu request: dùng lại User ID cũ hoặc không gửi User ID cũ cho người mới.",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: true,
                properties: {
                  user_id: {
                    oneOf: [{ type: "integer" }, { type: "boolean" }],
                  },
                  metadata: {
                    type: "object",
                    additionalProperties: true,
                    properties: { source: { type: "string" } },
                  },
                  items: {
                    type: "array",
                    items: { type: "object", additionalProperties: true },
                  },
                },
              },
              examples: {
                existingUser: {
                  summary: "Người dùng cũ — dùng lại User ID",
                  value: { user_id: 69, metadata: { source: "frontend" } },
                },
                newUser: {
                  summary: "Người dùng mới — user_id false",
                  value: { user_id: false, metadata: { source: "frontend" } },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Đã tạo conversation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "id",
                    "conversation_id",
                    "category",
                    "metadata",
                    "created_at",
                    "updated_at",
                  ],
                  properties: {
                    id: { type: "integer", example: 1 },
                    conversation_id: {
                      type: "string",
                      example: "conv_550e8400-e29b-41d4-a716-446655440000",
                    },
                    category: { type: "string", example: "conversation" },
                    user_id: { type: "integer", nullable: true, example: 70 },
                    metadata: {
                      type: "object",
                      additionalProperties: true,
                      example: { source: "frontend" },
                    },
                    created_at: {
                      type: "string",
                      format: "date-time",
                      example: "2026-10-01T10:00:00.000Z",
                    },
                    updated_at: {
                      type: "string",
                      format: "date-time",
                      example: "2026-10-01T10:00:00.000Z",
                    },
                  },
                },
                examples: {
                  existingUser: {
                    summary: "Conversation của người dùng cũ",
                    value: {
                      id: 1,
                      conversation_id: "conv_550e8400-e29b-41d4-a716-446655440000",
                      category: "conversation",
                      user_id: 69,
                      metadata: { source: "frontend" },
                      created_at: "2026-10-01T10:00:00.000Z",
                      updated_at: "2026-10-01T10:00:00.000Z",
                    },
                  },
                  newUser: {
                    summary: "Conversation của người dùng mới",
                    value: {
                      id: 2,
                      conversation_id: "conv_650e8400-e29b-41d4-a716-446655440001",
                      category: "conversation",
                      user_id: 70,
                      metadata: { source: "frontend" },
                      created_at: "2026-10-01T10:05:00.000Z",
                      updated_at: "2026-10-01T10:05:00.000Z",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "Nhập token API, ví dụ media_tech.",
      },
    },
  },
};

export default function CloneConversationOperation() {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const ensureSlot = () => {
      const section = Array.from(document.querySelectorAll<HTMLElement>(".opblock-tag-section")).find(
        (item) => (item.querySelector<HTMLElement>(".opblock-tag")?.textContent || "").trim().startsWith("Conversations"),
      );
      if (!section) return;

      const createOperation = Array.from(
        section.querySelectorAll<HTMLElement>(".opblock"),
      ).find(
        (operation) =>
          !operation.closest("#conversation-create-options-slot") &&
          (operation.id.endsWith("createConversation") ||
            (operation.textContent?.includes("/openclaw/v1/conversations") &&
              operation.textContent?.includes("Tạo một conversation"))),
      );
      if (!createOperation?.parentElement) return;

      let slot = document.getElementById(
        "conversation-create-options-slot",
      ) as HTMLElement | null;
      if (!slot) {
        slot = document.createElement("div");
        slot.id = "conversation-create-options-slot";
      }

      const parent = createOperation.parentElement;
      if (
        slot.parentElement !== parent ||
        slot.previousElementSibling !== createOperation
      ) {
        parent.insertBefore(slot, createOperation.nextSibling);
      }
      setPortalNode(slot);
    };

    ensureSlot();
    const observer = new MutationObserver(ensureSlot);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      setPortalNode(null);
      document.getElementById("conversation-create-options-slot")?.remove();
    };
  }, []);

  if (!portalNode) return null;
  return createPortal(
    <SwaggerClient
      spec={conversationSpec}
      compact
      serverStorageKey={OPENCLAW_SERVER_URL_STORAGE_KEY}
    />,
    portalNode,
  );
}
