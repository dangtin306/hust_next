"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import SwaggerClient from "../SwaggerClient";

const secondResponseSpec = {
  openapi: "3.0.3",
  info: { title: "Second response", version: "1.0.0" },
  servers: [{ url: "http://localhost:8006", description: "Backend OpenClaw" }],
  security: [{ BearerAuth: [] }],
  tags: [{ name: "Responses" }],
  paths: {
    "/openclaw/v1/responses": {
      post: {
        operationId: "createSecondResponse",
        tags: ["Responses"],
        summary: "Tin nhắn thứ hai",
        description: "Gửi tin nhắn tiếp theo bằng previous_response_id.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true },
              example: {
                model: "gpt-5.6-luna",
                previous_response_id: "resp_abc123",
                input: [{ role: "user", content: "Hãy viết tiếp phần kết luận." }],
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

export default function SecondResponseOperation() {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const ensureSlot = () => {
      const section = Array.from(document.querySelectorAll<HTMLElement>(".opblock-tag-section")).find(
        (item) => (item.querySelector<HTMLElement>(".opblock-tag")?.textContent || "").trim().startsWith("Responses"),
      );
      if (!section) return;
      const responseOperation = Array.from(section.querySelectorAll<HTMLElement>(".opblock")).find(
        (item) => item.textContent?.includes("/openclaw/v1/responses"),
      );
      if (!responseOperation?.parentElement) return;
      let slot = section.querySelector<HTMLElement>("#second-response-operation-slot");
      if (!slot) {
        slot = document.createElement("div");
        slot.id = "second-response-operation-slot";
      }
      const parent = responseOperation.parentElement;
      if (slot.parentElement !== parent || slot.previousElementSibling !== responseOperation) {
        parent.insertBefore(slot, responseOperation.nextSibling);
      }
      setPortalNode(slot);
    };

    ensureSlot();
    const observer = new MutationObserver(ensureSlot);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      setPortalNode(null);
      document.getElementById("second-response-operation-slot")?.remove();
    };
  }, []);

  if (!portalNode) return null;
  return createPortal(
    <SwaggerClient spec={secondResponseSpec} compact />,
    portalNode,
  );
}
