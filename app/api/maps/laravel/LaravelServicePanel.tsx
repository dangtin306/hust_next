"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Server, Layers, Code2, Cpu, ChevronRight } from "lucide-react";

const services = [
  { name: "Laravel Chat Bot", tag: "Chat Bot", method: "Laravel Chat Bot API · 7 routes", model: "Laravel", payload: "chat_bot_session · JSON", reason: "Tạo/liên kết phòng, lấy danh sách phòng và lịch sử, lưu lượt chat, cập nhật phòng." },
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
    <section className="w-full mb-3.5 rounded-2xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-xs backdrop-blur-md">
      <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 px-2.5 py-0.5 text-xs font-semibold text-blue-700 shadow-xs">
            <Server className="h-3.5 w-3.5 text-blue-600" />
            <span>Laravel OpenClaw Integration</span>
          </div>
          <h2 className="mt-1.5 text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Các API tích hợp Laravel
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-600">
            6 service downstream dùng chung Gateway <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-800 border border-slate-200/60">POST /openclaw/v1/responses</code>; Chat Bot dùng các route Laravel riêng.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-xs">
          <Layers className="h-3.5 w-3.5 text-slate-500" />
          <span>6 service Gateway · 1 nhóm Chat Bot</span>
        </div>
      </div>

      <div className="grid gap-2.5 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <button
            key={service.name}
            type="button"
            onClick={() => scrollToService(service.tag)}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 bg-white p-3.5 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                  {service.name}
                </h3>
                <span className="rounded-md border border-blue-100 bg-blue-50/80 px-2 py-0.5 text-[11px] font-semibold text-blue-700 whitespace-nowrap">
                  {service.tag}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <code className="rounded bg-slate-100/90 px-2 py-0.5 font-mono text-xs font-medium text-slate-700 border border-slate-200/60 truncate">
                  {service.method}
                </code>
              </div>

              <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-500 flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-slate-400" /> Model:
                  </span>
                  <code className="rounded border border-indigo-100 bg-indigo-50/90 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-indigo-700">
                    {service.model}
                  </code>
                </div>

                <div>
                  <span className="block font-medium text-slate-500 mb-0.5">Payload chính:</span>
                  <code
                    className="block w-full truncate rounded border border-slate-200/70 bg-slate-50/80 px-2 py-1 font-mono text-[11px] text-slate-700"
                    title={service.payload}
                  >
                    {service.payload}
                  </code>
                </div>

                <div>
                  <span className="block font-medium text-slate-500 mb-0.5">Vì sao cần:</span>
                  <p className="text-xs leading-relaxed text-slate-600 line-clamp-2">
                    {service.reason}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3.5 flex items-center justify-between border-t border-slate-100/90 pt-2.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
              <span>Bấm để xem endpoint</span>
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
    </section>,
    portalNode,
  );
}
