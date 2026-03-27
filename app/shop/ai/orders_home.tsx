"use client";

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { alert_error, alert_success } from "@/app/AppContext";
import { ALLOWED_TOOLS, contentByTool, seoByTool, toolTabs, type Lang, type ToolKey } from "./orders_data";

type OrdersHomeProps = {
  slug_1?: string;
  slug_2?: string;
};
type TtsApiResponse = {
  error?: string;
  message?: string;
  order?: string | number;
  voice?: string;
  text?: string;
  text_vip?: string;
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
  const [ocrImageFile, setOcrImageFile] = useState<File | null>(null);
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrExpanded, setOcrExpanded] = useState(false);
  const [sttFile, setSttFile] = useState<File | null>(null);
  const [sttDuration, setSttDuration] = useState<number>(0);
  const [sttText, setSttText] = useState("");
  const [sttExpanded, setSttExpanded] = useState(false);
  const [sttPreviewUrl, setSttPreviewUrl] = useState("");
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

  useEffect(() => {
    setGeneratedVoiceUrl("");
    setActionMessage("");
  }, [activeTool]);

  useEffect(() => {
    if (!sttFile) {
      setSttPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(sttFile);
    setSttPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [sttFile]);

  useEffect(() => {
    if (!ocrImageFile) {
      setOcrPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(ocrImageFile);
    setOcrPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [ocrImageFile]);

  useEffect(() => {
    if (!activeSeo) return;

    const ensureMetaTag = (selector: string, attrs: Record<string, string>) => {
      let tag = document.querySelector(selector) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        Object.entries(attrs).forEach(([key, value]) => tag?.setAttribute(key, value));
        document.head.appendChild(tag);
      }
      return tag;
    };

    document.title = activeSeo.title;
    const descriptionTag = ensureMetaTag('meta[name="description"]', { name: "description" });
    const keywordsTag = ensureMetaTag('meta[name="keywords"]', { name: "keywords" });
    const ogTitleTag = ensureMetaTag('meta[property="og:title"]', { property: "og:title" });
    const ogDescriptionTag = ensureMetaTag('meta[property="og:description"]', { property: "og:description" });

    descriptionTag.setAttribute("content", activeSeo.description);
    keywordsTag.setAttribute("content", activeSeo.keywords);
    ogTitleTag.setAttribute("content", activeSeo.title);
    ogDescriptionTag.setAttribute("content", activeSeo.description);
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

    if (activeTool === "image_text" && !ocrImageFile) {
      setActionMessage(
        lang === "vi"
          ? "Vui lòng chọn ảnh trước khi xác nhận."
          : "Please select an image before confirming."
      );
      return;
    }

    if (activeTool === "speech_text" && !sttFile) {
      setActionMessage(
        lang === "vi"
          ? "Vui lòng tải file audio trước khi xác nhận."
          : "Please upload an audio file before confirming."
      );
      return;
    }

    if (activeTool === "text_speech") {
      const convertedText = ttsInput.replace(/\n/g, ".").trim();
      const payload = {
        action: "add",
        comments: "",
        link: convertedText,
        username: "",
        quantity: 12,
        national_market: normalizeLang(readCookie("national_market")),
        service: "120665",
      };

      setIsSubmitting(true);
      setActionMessage(lang === "vi" ? "Đang gửi yêu cầu..." : "Sending request...");
      setGeneratedVoiceUrl("");

      try {
        const response = await fetch("https://hust.media/api/v3", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const rawText = await response.text();
        let data: TtsApiResponse = {};
        try {
          data = JSON.parse(rawText) as TtsApiResponse;
        } catch {
          data = { message: rawText };
        }
        const apiError = typeof data?.error === "string" ? data.error : "";
        const message = String(data?.message || "");
        const voiceUrl = String(data?.voice || "");
        const orderId = data?.order;

        if (!response.ok) {
          throw new Error(message || `HTTP ${response.status}`);
        }
        if (apiError) {
          throw new Error(apiError);
        }
        if (!message && !voiceUrl && !orderId) {
          throw new Error(message || (lang === "vi" ? "Xử lý thất bại." : "Processing failed."));
        }

        setGeneratedVoiceUrl(/^https?:\/\//i.test(voiceUrl) ? voiceUrl : "");
        setActionMessage(
          lang === "vi"
            ? message || `Thành công. Mã đơn: ${orderId ?? "N/A"}`
            : message || `Success. Order: ${orderId ?? "N/A"}`
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

    if (activeTool === "speech_text") {
      const fileToDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("File read failed"));
          reader.readAsDataURL(file);
        });

      setIsSubmitting(true);
      setActionMessage(lang === "vi" ? "Đang gửi yêu cầu..." : "Sending request...");

      try {
        const voiceData = await fileToDataUrl(sttFile as File);
        const payload = {
          action: "add",
          comments: { voice_data: voiceData },
          link: "file_audio",
          username: "",
          quantity: Math.max(1, Math.round(sttDuration || 1)),
          national_market: normalizeLang(readCookie("national_market")),
          service: "122727",
        };

        const response = await fetch("https://hust.media/api/v3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const rawText = await response.text();
        let data: TtsApiResponse = {};
        try {
          data = JSON.parse(rawText) as TtsApiResponse;
        } catch {
          data = { message: rawText };
        }
        const apiError = typeof data?.error === "string" ? data.error : "";
        const message = String(data?.message || "");
        const text = String(data?.text_vip || data?.text || "");
        const orderId = data?.order;

        if (!response.ok) {
          throw new Error(message || `HTTP ${response.status}`);
        }
        if (apiError) {
          throw new Error(apiError);
        }

        if (!text && !orderId && !message) {
          throw new Error(lang === "vi" ? "Không có dữ liệu trả về." : "No response data returned.");
        }

        setSttText(text);
        setSttExpanded(false);
        setActionMessage(
          lang === "vi"
            ? message || `Thành công. Mã đơn: ${orderId ?? "N/A"}`
            : message || `Success. Order: ${orderId ?? "N/A"}`
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

    if (activeTool === "image_text") {
      const fileToDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("File read failed"));
          reader.readAsDataURL(file);
        });

      setIsSubmitting(true);
      setActionMessage(lang === "vi" ? "Đang gửi yêu cầu..." : "Sending request...");

      try {
        const imageBase64 = await fileToDataUrl(ocrImageFile as File);
        const payload = {
          action: "add",
          comments: "",
          images_data: [{ id: 1, img: imageBase64 }],
          link: "image_text",
          username: "",
          quantity: 1,
          national_market: normalizeLang(readCookie("national_market")),
          service: "93811",
        };

        const response = await fetch("https://hust.media/api/v3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const rawText = await response.text();
        let data: TtsApiResponse = {};
        try {
          data = JSON.parse(rawText) as TtsApiResponse;
        } catch {
          data = { message: rawText };
        }
        const apiError = typeof data?.error === "string" ? data.error : "";
        const message = String(data?.message || "");
        const text = String(data?.text_vip || data?.text || "");
        const orderId = data?.order;

        if (!response.ok) {
          throw new Error(message || `HTTP ${response.status}`);
        }
        if (apiError) {
          throw new Error(apiError);
        }
        if (!text && !orderId && !message) {
          throw new Error(lang === "vi" ? "Không có dữ liệu trả về." : "No response data returned.");
        }

        setOcrText(text);
        setOcrExpanded(false);
        setActionMessage(
          lang === "vi"
            ? message || `Thành công. Mã đơn: ${orderId ?? "N/A"}`
            : message || `Success. Order: ${orderId ?? "N/A"}`
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
                suppressHydrationWarning
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
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="text-sm text-slate-700">
                {lang === "vi"
                  ? "Tải lên tệp âm thanh để chuyển đổi thành văn bản."
                  : "Upload an audio file to convert it into text."}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {lang === "vi"
                  ? "Hỗ trợ định dạng phổ biến: MP3, WAV, M4A, OGG."
                  : "Common formats supported: MP3, WAV, M4A, OGG."}
              </p>

              <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white p-3">
                <input
                  id="stt-audio-file"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSttFile(file);
                    setSttText("");
                    if (!file) {
                      setSttDuration(0);
                      return;
                    }
                    const audioUrl = URL.createObjectURL(file);
                    const audio = new Audio(audioUrl);
                    audio.addEventListener("loadedmetadata", () => {
                      setSttDuration(Math.max(1, Math.floor(audio.duration + 1)));
                      URL.revokeObjectURL(audioUrl);
                    });
                  }}
                />
                <label
                  htmlFor="stt-audio-file"
                  className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  {lang === "vi" ? "Chọn file âm thanh" : "Choose audio file"}
                </label>

                <p className="mt-2 text-xs text-slate-600">
                  {sttFile
                    ? (lang === "vi" ? "Đã chọn:" : "Selected:") + ` ${sttFile.name}`
                    : (lang === "vi" ? "Chưa có tệp nào được chọn." : "No file selected.")}
                </p>
                {sttDuration > 0 ? (
                  <p className="mt-1 text-xs text-slate-600">
                    {lang === "vi" ? "Thời lượng ước tính:" : "Estimated duration:"} {sttDuration}s
                  </p>
                ) : null}
                {sttFile && sttPreviewUrl ? (
                  <audio controls className="mt-3 w-full" src={sttPreviewUrl}>
                    Your browser does not support the audio element.
                  </audio>
                ) : null}
              </div>
              {sttText ? (
                <div className="mt-3 rounded border border-slate-200 bg-white p-3">
                  <p className="mb-1 text-xs font-medium text-slate-700">
                    {lang === "vi" ? "Kết quả STT" : "STT Output"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {lang === "vi"
                      ? "Nội dung được tạo tự động, vui lòng kiểm tra lại trước khi sử dụng."
                      : "This output is machine-generated. Please review before using."}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {lang === "vi"
                      ? "Chỉ dùng để tham khảo. Không tải dữ liệu cá nhân nhạy cảm."
                      : "For informational use only. Do not upload sensitive personal data."}
                  </p>
                  <div className="mt-2 max-h-44 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-2">
                    <p className="whitespace-pre-wrap break-words text-sm text-slate-700">
                      {sttExpanded || sttText.length <= 800 ? sttText : `${sttText.slice(0, 800)}...`}
                    </p>
                  </div>
                  {sttText.length > 800 ? (
                    <button
                      type="button"
                      onClick={() => setSttExpanded((prev) => !prev)}
                      className="mt-2 text-xs font-medium text-cyan-700 underline"
                    >
                      {sttExpanded
                        ? lang === "vi"
                          ? "Thu gọn"
                          : "Show less"
                        : lang === "vi"
                          ? "Xem thêm"
                          : "Show more"}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}

          {activeTool === "image_text" && (
            <div>
              <label className="mb-1 block text-sm text-slate-700">
                {lang === "vi" ? "Tải ảnh để nhận diện văn bản (OCR)" : "Upload an image for OCR text recognition"}
              </label>
              <p className="mb-2 text-xs text-slate-500">
                {lang === "vi"
                  ? "Phù hợp cho chứng từ, ảnh chụp màn hình, tài liệu học tập. Vui lòng chỉ tải nội dung bạn có quyền sử dụng."
                  : "Best for receipts, screenshots, and study documents. Please upload only content you are authorized to use."}
              </p>
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                <input
                  id="ocr-image-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setOcrImageFile(file);
                    setOcrText("");
                  }}
                />
                <label
                  htmlFor="ocr-image-file"
                  className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  {lang === "vi" ? "Tải tệp hình ảnh" : "Upload image file"}
                </label>
                <p className="mt-2 text-xs text-slate-600">
                  {ocrImageFile
                    ? (lang === "vi" ? "Đã chọn:" : "Selected:") + ` ${ocrImageFile.name}`
                    : (lang === "vi" ? "Chưa có ảnh nào được chọn." : "No image selected.")}
                </p>
                {ocrPreviewUrl ? (
                  <img
                    src={ocrPreviewUrl}
                    alt="OCR preview"
                    className="mt-3 max-h-56 rounded-md border border-slate-200 object-contain"
                  />
                ) : null}
              </div>
              {ocrText ? (
                <div className="mt-3 rounded border border-slate-200 bg-white p-3">
                  <p className="mb-1 text-xs font-medium text-slate-700">
                    {lang === "vi" ? "Kết quả OCR" : "OCR Output"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {lang === "vi"
                      ? "Nội dung được tạo tự động, vui lòng kiểm tra lại trước khi sử dụng."
                      : "This output is machine-generated. Please review before using."}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {lang === "vi"
                      ? "Chỉ dùng để tham khảo. Không tải dữ liệu cá nhân nhạy cảm."
                      : "For informational use only. Do not upload sensitive personal data."}
                  </p>
                  <div className="mt-2 max-h-44 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-2">
                    <p className="whitespace-pre-wrap break-words text-sm text-slate-700">
                      {ocrExpanded || ocrText.length <= 800 ? ocrText : `${ocrText.slice(0, 800)}...`}
                    </p>
                  </div>
                  {ocrText.length > 800 ? (
                    <button
                      type="button"
                      onClick={() => setOcrExpanded((prev) => !prev)}
                      className="mt-2 text-xs font-medium text-cyan-700 underline"
                    >
                      {ocrExpanded
                        ? lang === "vi"
                          ? "Thu gọn"
                          : "Show less"
                        : lang === "vi"
                          ? "Xem thêm"
                          : "Show more"}
                    </button>
                  ) : null}
                </div>
              ) : null}
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
