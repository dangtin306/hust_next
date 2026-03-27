"use client";

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Head from "next/head";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { alert_error, alert_success } from "@/app/AppContext";
import { ALLOWED_TOOLS, contentByTool, seoByTool, toolTabs, type Lang, type ToolKey } from "./orders_data";

type OrdersHomeProps = {
  slug_1?: string;
  slug_2?: string;
};
type TtsApiResponse = {
  status?: number | string;
  message?: string;
  voice?: string;
};

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

const normalizeLang = (value: string): Lang =>
  String(value || "").toLowerCase() === "vi" ? "vi" : "en";

const subscribeLang = (onStoreChange: () => void) => {
  if (typeof window === "undefined") return () => {};
  const id = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(id);
};

const parseSlugs = (pathname: string) => {
  const segments = String(pathname || "")
    .split("/")
    .filter(Boolean);
  const normalized = segments[0] === "next" ? segments.slice(1) : segments;

  return {
    slug_1: normalized[0] || "",
    slug_2: normalized[1] || "",
  };
};

const isToolKey = (value: string): value is ToolKey =>
  ALLOWED_TOOLS.has(value as "speech_text" | "text_speech" | "image_text");

const OrdersHome = ({ slug_1: slug1Prop, slug_2: slug2Prop }: OrdersHomeProps = {}) => {
  const pathname = usePathname();
  const parsedSlugs = useMemo(() => parseSlugs(pathname || ""), [pathname]);
  const slug_1 = slug1Prop || parsedSlugs.slug_1;
  const slug_2 = slug2Prop || parsedSlugs.slug_2;

  const [ttsInput, setTtsInput] = useState("");
  const [ocrInput, setOcrInput] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedVoiceUrl, setGeneratedVoiceUrl] = useState("");

  const lang = useSyncExternalStore<Lang>(
    subscribeLang,
    () => normalizeLang(readCookie("national_market")),
    () => "en"
  );

  const activeTool = isToolKey(slug_2) ? slug_2 : null;
  const showToolPage = (slug_1 === "plans" || slug_1 === "orders_once") && !!activeTool;

  const activeSeo = activeTool ? seoByTool[activeTool][lang] : null;
  const activeContent = activeTool ? contentByTool[activeTool][lang] : null;
  const routeRoot = slug_1 === "plans" ? "plans" : "orders_once";
  const apiKey = readCookie("apikey");

  useEffect(() => {
    setGeneratedVoiceUrl("");
    setActionMessage("");
  }, [activeTool]);

  useEffect(() => {
    if (!activeSeo) return;
    document.title = activeSeo.title;
    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.setAttribute("name", "description");
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.setAttribute("content", activeSeo.description);
  }, [activeSeo]);

  if (!showToolPage || !activeTool || !activeSeo || !activeContent) {
    return null;
  }

  const handleConfirmTool = async () => {
    if (isSubmitting) return;

    if (activeTool === "text_speech" && !ttsInput.trim()) {
      setActionMessage(
        lang === "vi"
          ? "Vui lòng nhập nội dung trước khi xác nhận."
          : "Please enter content before confirming."
      );
      return;
    }

    if (activeTool === "image_text" && !ocrInput.trim()) {
      setActionMessage(
        lang === "vi"
          ? "Vui lòng nhập dữ liệu OCR trước khi xác nhận."
          : "Please enter OCR content before confirming."
      );
      return;
    }

    if (activeTool === "text_speech") {
      const convertedText = ttsInput.replace(/\n/g, ".").trim();
      const payload = new URLSearchParams({
        caption: "",
        key: apiKey,
        text: convertedText,
        thanhcong: "false",
        social: "viettel-north-women",
        typeuser: apiKey ? "personal" : "guest",
        service_name: "",
        cumfm: "NO",
      });

      setIsSubmitting(true);
      setActionMessage(lang === "vi" ? "Đang gửi yêu cầu..." : "Sending request...");
      setGeneratedVoiceUrl("");

      try {
        const response = await fetch("https://tecom.pro/truyenthanh/texttovice.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
          body: payload.toString(),
        });

        const rawText = await response.text();
        let data: TtsApiResponse = {};
        try {
          data = JSON.parse(rawText) as TtsApiResponse;
        } catch {
          data = { message: rawText };
        }

        const statusNum = Number(data?.status ?? 0);
        const voiceUrl = String(data?.voice || "");
        const message = String(data?.message || "");

        if (!response.ok) {
          throw new Error(message || `HTTP ${response.status}`);
        }
        if (voiceUrl.includes("lỗi")) {
          throw new Error(lang === "vi" ? "Tiêu đề đã tồn tại" : "Title already exists");
        }
        if (statusNum !== 1 || !voiceUrl) {
          throw new Error(message || (lang === "vi" ? "Xử lý thất bại." : "Processing failed."));
        }

        setGeneratedVoiceUrl(voiceUrl);
        setActionMessage(
          lang === "vi"
            ? "Thành công. Bạn có thể phát audio bên dưới."
            : "Success. You can play the generated audio below."
        );
        alert_success(lang === "vi" ? "Thành công" : "Success");
        return;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setActionMessage(
          lang === "vi"
            ? `Lỗi xử lý: ${msg}`
            : `Processing error: ${msg}`
        );
        alert_error(msg);
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    setActionMessage(
      lang === "vi"
        ? "Đã xác nhận. Yêu cầu đã sẵn sàng xử lý qua API hiện tại."
        : "Confirmed. Your request is ready to be processed by the current API."
    );
  };

  return (
    <>
      <Head>
        <title>{activeSeo.title}</title>
        <meta name="description" content={activeSeo.description} />
        <meta name="keywords" content={activeSeo.keywords} />
        <meta property="og:title" content={activeSeo.title} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://hust.media/reactapp/hustmedia.ico" />
        <meta property="og:description" content={activeSeo.description} />
        <meta property="og:url" content="https://hust.media" />
        <link rel="icon" href="https://hust.media/reactapp/hustmedia.ico" />
      </Head>

      <article className="mx-auto max-w-5xl px-2 pb-8 pt-3">
        <section className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            {lang === "vi" ? "Chọn công cụ AI" : "Choose AI Tool"}
          </h2>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
            {toolTabs.map((tab) => {
              const isActive = activeTool === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={`/${routeRoot}/${tab.key}`}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {lang === "vi" ? tab.vi : tab.en}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/60 bg-gradient-to-r from-emerald-100/80 via-white/80 to-cyan-100/80 px-4 py-4 shadow-sm backdrop-blur-md">
          <div className="flex items-start gap-2">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500/90 shadow-sm" />
            <h1 className="text-base font-semibold leading-snug text-slate-900">{activeContent.heading}</h1>
          </div>
          <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
            {activeContent.summary.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            {lang === "vi" ? "Ai nên dùng mô-đun này?" : "Who should use this module?"}
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 marker:text-emerald-600">
            {activeContent.audience.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            {lang === "vi" ? "Ví dụ thực tế (Input/Output)" : "Practical Input/Output Examples"}
          </h2>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
            {activeContent.examples.map((example, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {example}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            {lang === "vi" ? "Bài viết liên quan" : "Related Articles"}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {activeContent.related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-800 hover:bg-cyan-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-indigo-200 bg-white px-4 py-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              {lang === "vi" ? "Công cụ AI" : "AI Tool"}
            </h2>
          </div>

          {activeTool === "text_speech" && (
            <div>
              <label className="mb-1 block text-sm text-slate-700">
                {lang === "vi" ? "Nhập văn bản để tạo giọng đọc" : "Enter text to generate narration"}
              </label>
              <textarea
                value={ttsInput}
                onChange={(e) => setTtsInput(e.target.value)}
                placeholder={lang === "vi" ? "Ví dụ: Mô tả sản phẩm, hướng dẫn..." : "Example: Product description, guide..."}
                className="h-36 w-full resize-none rounded-lg border border-slate-300 p-3 text-sm text-slate-800 outline-none ring-0 focus:border-slate-400"
              />
              <p className="mt-2 text-xs text-slate-600">
                {lang === "vi" ? "Số ký tự hiện tại:" : "Current characters:"} {ttsInput.length}
              </p>
            </div>
          )}

          {activeTool === "speech_text" && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p>
                {lang === "vi"
                  ? "Tải file audio hoặc ghi âm để chuyển thành văn bản."
                  : "Upload or record audio to convert to text."}
              </p>
              <div className="mt-2 rounded border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-500">
                {lang === "vi"
                  ? "Khu vực upload/record đang hoạt động theo API hiện tại."
                  : "Upload/record area is running on the current API."}
              </div>
            </div>
          )}

          {activeTool === "image_text" && (
            <div>
              <label className="mb-1 block text-sm text-slate-700">
                {lang === "vi" ? "Dán nội dung ảnh cần OCR" : "Paste image note for OCR"}
              </label>
              <textarea
                value={ocrInput}
                onChange={(e) => setOcrInput(e.target.value)}
                placeholder={lang === "vi" ? "Ví dụ: Ảnh biên lai tháng 03..." : "Example: Receipt screenshot, March..."}
                className="h-28 w-full resize-none rounded-lg border border-slate-300 p-3 text-sm text-slate-800 outline-none ring-0 focus:border-slate-400"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirmTool}
            disabled={isSubmitting}
            className="mt-4 w-full rounded-full bg-slate-900 px-5 py-3 text-left text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? lang === "vi"
                ? "Đang xử lý..."
                : "Processing..."
              : lang === "vi"
                ? "✔ Xác nhận xử lý"
                : "✔ Confirm Processing"}
            <span className="float-right">➤</span>
          </button>

          {actionMessage ? (
            <p className="mt-2 text-xs text-slate-600">{actionMessage}</p>
          ) : null}

          {activeTool === "text_speech" && generatedVoiceUrl ? (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-medium text-slate-700">
                {lang === "vi" ? "Audio đã tạo" : "Generated audio"}
              </p>
              <audio controls className="w-full" src={generatedVoiceUrl}>
                Your browser does not support the audio element.
              </audio>
              <a
                href={generatedVoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs text-cyan-700 underline"
              >
                {lang === "vi" ? "Mở audio ở tab mới" : "Open audio in new tab"}
              </a>
            </div>
          ) : null}
        </section>
      </article>
    </>
  );
};

export default OrdersHome;
