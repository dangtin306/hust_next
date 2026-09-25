"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const services = [
  { name: "Chat thường", tag: "Chat", method: "OpenClawService::responses()", model: "gpt-5.6-luna", payload: "role + content", reason: "Gửi hội thoại và tiếp tục ngữ cảnh bằng previous_response_id khi room đã có phiên trước." },
  { name: "Viết tin thông minh", tag: "Smart Writing", method: "OpenClawService::responses()", model: "gpt-5.6-luna", payload: "title + desc + len + tone", reason: "Các field mô tả chủ đề, dàn ý, độ dài và giọng văn để agent tạo bài viết đúng yêu cầu." },
  { name: "Kiểm tra chính tả", tag: "Spell Check", method: "OpenClawService::checkSpelling()", model: "gpt-5.6-luna", payload: "input_text", reason: "Nội dung cần kiểm tra được gửi dưới dạng input_text để Laravel parse danh sách từ sai và gợi ý." },
  { name: "Text to Speech", tag: "Text to Speech", method: "OpenClawService::tts()", model: "Vie_Neu", payload: "text + tool: media_text_to_speech", reason: "tool định tuyến request vào service TTS thay vì xử lý như chat text thông thường." },
  { name: "OCR hình ảnh", tag: "Image to Text", method: "OpenClawService::extractTextFromImage()", model: "gpt-5.6-luna", payload: "input_text + input_image", reason: "Laravel chuyển file thành Data URI Base64 để Gateway nhận được cả hướng dẫn và hình ảnh." },
  { name: "Tạo hình ảnh", tag: "Image Generation", method: "OpenClawService::generateImage()", model: "openai/gpt-image-2", payload: "prompt + size + aspectRatio + quality + style + tone", reason: "Image generation cũng đi qua responses để dùng chung agent, response.id và pipeline lưu kết quả." },
];

const exampleMatchers: Record<string, string[]> = {
  Chat: ["chat thường", "chat"],
  "Smart Writing": ["viết tin", "smart writing"],
  "Spell Check": ["kiểm tra chính tả", "spell check"],
  "Text to Speech": ["text to speech", "tts"],
  "Image to Text": ["ocr", "image to text"],
  "Image Generation": ["tạo hình ảnh", "image generation"],
};

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
      document.getElementById("laravel-service-contracts-slot")?.remove();
    };
  }, []);

  useEffect(() => {
    if (!portalNode) return;
    const configuredSelects = new WeakSet<HTMLSelectElement>();
    const configureExamplesByTag = () => {
      document.querySelectorAll<HTMLElement>(".opblock-tag-section").forEach((section) => {
        const heading = section.querySelector<HTMLElement>(".opblock-tag");
        const tag = Object.keys(exampleMatchers).find((name) =>
          (heading?.textContent || "").trim().startsWith(name),
        );
        if (!tag) return;
        const matchers = exampleMatchers[tag];
        section.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
          if (configuredSelects.has(select)) return;
          const matchingOptions = Array.from(select.options).filter((option) =>
            matchers.some((matcher) => (option.textContent || "").toLowerCase().includes(matcher)),
          );
          if (matchingOptions.length === 0) return;
          configuredSelects.add(select);
          Array.from(select.options).forEach((option) => {
            option.hidden = !matchingOptions.includes(option);
          });
          const selectedOption = matchingOptions[0];
          const nativeSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
          if (selectedOption && select.value !== selectedOption.value) {
            nativeSetter?.call(select, selectedOption.value);
            select.dispatchEvent(new Event("input", { bubbles: true }));
            select.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      });
    };
    configureExamplesByTag();
    const observer = new MutationObserver(configureExamplesByTag);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [portalNode]);

  if (!portalNode) return null;

  const scrollToService = (tag: string) => {
    const normalizedTag = tag.trim().replace(/\s+/g, "-");
    const idTarget =
      document.getElementById(`operations-${tag}`) ||
      document.getElementById(`operations-tag-${tag}`) ||
      document.getElementById(`operations-${normalizedTag}`) ||
      document.getElementById(`operations-tag-${normalizedTag}`) ||
      document.querySelector(`[data-section-id="operations-${tag}"]`) ||
      document.querySelector(`[data-section-id="operations-tag-${tag}"]`) ||
      document.querySelector(`[id$="-${normalizedTag}"]`) ||
      document.querySelector(`[id$="-${tag}"]`);
    const textTarget = Array.from(document.querySelectorAll(".opblock-tag")).find((element) =>
      (element.textContent || "").trim().startsWith(tag),
    );
    const target = idTarget || textTarget?.closest(".opblock-tag-section") || textTarget;
    if (target instanceof HTMLElement) {
      window.history.replaceState(null, "", `#/${encodeURIComponent(tag)}`);
      const scroll = () => {
        const top = target.getBoundingClientRect().top + window.scrollY - 24;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      };
      scroll();
      window.setTimeout(scroll, 180);
    }
  };

  return createPortal(
    <section className="mx-auto mb-6 max-w-[1480px] rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Laravel OpenClawService</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-800">Các contract service downstream</h2>
        <p className="mt-1 text-sm text-slate-600">Tất cả service bên dưới đều gọi cùng một endpoint: POST /openclaw/v1/responses.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <button key={service.name} type="button" onClick={() => scrollToService(service.tag)} className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400">
            <h3 className="font-semibold text-slate-800">{service.name}</h3>
            <p className="mt-2 text-xs font-semibold text-blue-700">{service.method}</p>
            <dl className="mt-3 space-y-2 text-sm text-slate-600">
              <div><dt className="font-semibold text-slate-700">Model</dt><dd><code>{service.model}</code></dd></div>
              <div><dt className="font-semibold text-slate-700">Payload chính</dt><dd><code>{service.payload}</code></dd></div>
              <div><dt className="font-semibold text-slate-700">Vì sao cần</dt><dd>{service.reason}</dd></div>
            </dl>
          </button>
        ))}
      </div>
    </section>,
    portalNode,
  );
}
