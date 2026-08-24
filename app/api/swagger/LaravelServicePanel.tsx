"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const services = [
  {
    name: "Chat thường",
    method: "OpenClawService::responses()",
    model: "gpt-5.6-luna",
    payload: "role + content",
    reason: "Gửi hội thoại và tiếp tục ngữ cảnh bằng previous_response_id khi room đã có phiên trước.",
  },
  {
    name: "Viết tin thông minh",
    method: "OpenClawService::responses()",
    model: "gpt-5.6-luna",
    payload: "title + desc + len + tone",
    reason: "Các field mô tả chủ đề, dàn ý, độ dài và giọng văn để agent tạo bài viết đúng yêu cầu.",
  },
  {
    name: "Kiểm tra chính tả",
    method: "OpenClawService::checkSpelling()",
    model: "gpt-5.6-luna",
    payload: "input_text",
    reason: "Nội dung cần kiểm tra được gửi dưới dạng input_text để Laravel parse danh sách từ sai và gợi ý.",
  },
  {
    name: "Text to Speech",
    method: "OpenClawService::tts()",
    model: "F5_vie",
    payload: "text + tool: media_text_to_speech",
    reason: "tool định tuyến request vào service TTS thay vì xử lý như chat text thông thường.",
  },
  {
    name: "OCR hình ảnh",
    method: "OpenClawService::extractTextFromImage()",
    model: "gpt-5.6-luna",
    payload: "input_text + input_image",
    reason: "Laravel chuyển file thành Data URI Base64 để Gateway nhận được cả hướng dẫn và hình ảnh.",
  },
  {
    name: "Tạo hình ảnh",
    method: "OpenClawService::generateImage()",
    model: "openai/gpt-image-2",
    payload: "prompt + size + aspectRatio + quality + style + tone",
    reason: "Image generation cũng đi qua responses để dùng chung agent, response.id và pipeline lưu kết quả.",
  },
];

export default function LaravelServicePanel() {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const ensurePanelSlot = () => {
      const swaggerRoot = document.querySelector(".swagger-ui");
      const firstOperation = document.querySelector(".opblock-tag-section");
      const parent = firstOperation?.parentElement;

      if (!swaggerRoot || !firstOperation || !parent) return;

      let slot = swaggerRoot.querySelector<HTMLElement>("#laravel-service-contracts-slot");
      if (!slot) {
        slot = document.createElement("div");
        slot.id = "laravel-service-contracts-slot";
        parent.insertBefore(slot, firstOperation);
      }
      setPortalNode(slot);
    };

    ensurePanelSlot();
    const observer = new MutationObserver(ensurePanelSlot);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      setPortalNode(null);
      const slot = document.getElementById("laravel-service-contracts-slot");
      slot?.remove();
    };
  }, []);

  if (!portalNode) return null;

  return createPortal(
    <section className="mx-auto mb-6 max-w-[1480px] rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          Laravel OpenClawService
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-800">
          Downstream service contracts
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Tất cả service bên dưới đều gọi cùng một endpoint: POST /openclaw/v1/responses.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <article key={service.name} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-800">{service.name}</h3>
            <p className="mt-2 text-xs font-semibold text-blue-700">{service.method}</p>
            <dl className="mt-3 space-y-2 text-sm text-slate-600">
              <div>
                <dt className="font-semibold text-slate-700">Model</dt>
                <dd><code>{service.model}</code></dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Payload chính</dt>
                <dd><code>{service.payload}</code></dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Vì sao cần</dt>
                <dd>{service.reason}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>,
    portalNode,
  );
}
