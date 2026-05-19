"use client";

import React, { useEffect, useMemo, useState } from "react";
import { alert_error, alert_success } from "@/app/AppContext";
import { ALLOWED_TOOLS, contentByTool, seoByTool, toolNotesByKey, type Lang, type ToolKey } from "./orders_data";
import type { OrdersPostMetaResponse } from "./orders_api_data";
import OrdersProcess from "./orders_process";
import OrdersContent from "./orders_content";

type OrdersHomeProps = {
  slug_1?: string;
  slug_2?: string;
  initialPostsApiData?: OrdersPostMetaResponse | null;
  initialLang?: Lang;
};
type TtsApiResponse = {
  error?: string;
  message?: string;
  order?: string | number;
  voice?: string;
  text?: string;
  text_vip?: string;
};
type HelpfulVote = "" | "yes" | "no";
const CLIENT_META_CACHE_TTL_MS = 60 * 60 * 1000;

function formatUsDateTime(value: string) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
  if (match) {
    const [, yyyy, mm, dd, hh, mi, ss] = match;
    return `${mm}/${dd}/${yyyy} ${hh}:${mi}:${ss}`;
  }
  return raw;
}

const readCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

const normalizeLang = (value: string): Lang =>
  String(value || "").toLowerCase() === "vi" ? "vi" : "en";

const isToolKey = (value: string): value is ToolKey =>
  ALLOWED_TOOLS.has(value as ToolKey);
const STT_MAX_DURATION_SECONDS = 5 * 60;
const TRANSLATE_MAX_CHARS = 1000;
const OCR_MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const OCR_ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg"]);

const OrdersHome = ({
  slug_1: slug1Prop,
  slug_2: slug2Prop,
  initialPostsApiData = null,
  initialLang = "en",
}: OrdersHomeProps = {}) => {
  const slug_1 = slug1Prop || "";
  const slug_2 = slug2Prop || "";

  const [ttsInput, setTtsInput] = useState("");
  const [ocrImageFile, setOcrImageFile] = useState<File | null>(null);
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrExpanded, setOcrExpanded] = useState(false);
  const [ocrCopied, setOcrCopied] = useState(false);
  const [sttFile, setSttFile] = useState<File | null>(null);
  const [sttDuration, setSttDuration] = useState<number>(0);
  const [sttText, setSttText] = useState("");
  const [sttExpanded, setSttExpanded] = useState(false);
  const [sttCopied, setSttCopied] = useState(false);
  const [sttPreviewUrl, setSttPreviewUrl] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedVoiceUrl, setGeneratedVoiceUrl] = useState("");
  const [helpfulVote, setHelpfulVote] = useState<HelpfulVote>("");
  const [translateInput, setTranslateInput] = useState("");
  const [translateText, setTranslateText] = useState("");
  const [postsMetaData, setPostsMetaData] = useState<OrdersPostMetaResponse | null>(initialPostsApiData);
  const postsApiData = postsMetaData?.post || null;
  const relatedInsights = postsMetaData?.relatedPosts || [];

  const [lang, setLang] = useState<Lang>(() => normalizeLang(initialLang));

  useEffect(() => {
    const syncLang = () => setLang(normalizeLang(readCookie("national_market")));
    syncLang();
    window.addEventListener("focus", syncLang);
    window.addEventListener("visibilitychange", syncLang);
    return () => {
      window.removeEventListener("focus", syncLang);
      window.removeEventListener("visibilitychange", syncLang);
    };
  }, []);

  useEffect(() => {
    setPostsMetaData(initialPostsApiData);
  }, [initialPostsApiData, slug_1, slug_2]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!slug_2) return;
    const host = window.location.hostname.toLowerCase();
    const isLocalHost = host === "localhost" || host === "127.0.0.1" || host === "::1";
    if (isLocalHost) return;

    const cacheKey = `orders_post_meta:${slug_1 || "orders_once"}:${slug_2}`;

    if ((!postsMetaData?.post || !String(postsMetaData?.post?.title || "").trim()) && window.sessionStorage) {
      try {
        const raw = window.sessionStorage.getItem(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw) as { at?: number; data?: OrdersPostMetaResponse };
          const age = Date.now() - Number(parsed?.at || 0);
          if (parsed?.data && age >= 0 && age <= CLIENT_META_CACHE_TTL_MS) {
            setPostsMetaData(parsed.data);
            return;
          }
          window.sessionStorage.removeItem(cacheKey);
        }
      } catch {
        window.sessionStorage.removeItem(cacheKey);
      }
    }

    if (!postsMetaData?.post) return;
    try {
      window.sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          at: Date.now(),
          data: postsMetaData,
        })
      );
    } catch {
      // Ignore storage quota failures.
    }
  }, [postsMetaData, slug_1, slug_2]);

  const activeTool = isToolKey(slug_2) ? slug_2 : null;
  const showToolPage = (slug_1 === "plans" || slug_1 === "orders_once") && !!activeTool;

  const activeSeo = activeTool ? seoByTool[activeTool][lang] : null;
  const activeContent = activeTool ? contentByTool[activeTool][lang] : null;
  const activeNotes = activeTool ? toolNotesByKey[activeTool] : null;
  const routeRoot = slug_1 === "plans" ? "plans" : "orders_once";
  const writtenDateLabel = lang === "vi" ? "Ngày viết:" : "Written date:";
  const articleTitle = String(postsApiData?.title || "");
  const articleDescription = String(postsApiData?.description || "");
  const writtenDateValue = formatUsDateTime(String(postsApiData?.createdate || "").trim());

  useEffect(() => {
    setGeneratedVoiceUrl("");
    setActionMessage("");
    setTranslateText("");
    setSttCopied(false);
    setOcrCopied(false);
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

  const activeContentEn = activeTool ? contentByTool[activeTool].en : contentByTool.text_speech.en;
  const moduleUsageGuideText =
    activeContent?.moduleUsageGuide?.trim() || activeContentEn?.moduleUsageGuide || "hellow world";
  const moduleUsageGuideBlocks = useMemo(() => {
    const moduleUsageGuideLines = moduleUsageGuideText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const blocks: Array<
      | { type: "paragraph"; text: string }
      | { type: "bullets"; items: string[] }
    > = [];
    let currentBullets: string[] = [];

    const flushBullets = () => {
      if (currentBullets.length > 0) {
        blocks.push({ type: "bullets", items: currentBullets });
        currentBullets = [];
      }
    };

    moduleUsageGuideLines.forEach((line) => {
      if (line.startsWith("•")) {
        currentBullets.push(line.replace(/^•\s*/, ""));
        return;
      }
      flushBullets();
      blocks.push({ type: "paragraph", text: line });
    });

    flushBullets();
    return blocks;
  }, [moduleUsageGuideText]);

  if (!showToolPage || !activeTool || !activeSeo || !activeContent) {
    return null;
  }

  const readerValueTitle = "Reader Value";
  const readerValueText = activeContent.readerValue?.trim() || activeContentEn.readerValue;
  const conclusionTitle = "Conclusion";
  const conclusionText = activeContent.conclusion?.trim() || activeContentEn.conclusion;

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

    if (activeTool === "image_text" && ocrImageFile && ocrImageFile.size > OCR_MAX_IMAGE_BYTES) {
      setActionMessage(
        lang === "vi"
          ? "Ảnh vượt quá 20MB. Vui lòng chọn ảnh nhỏ hơn."
          : "Image exceeds 20MB. Please choose a smaller image."
      );
      return;
    }
    if (activeTool === "image_text" && ocrImageFile && !OCR_ALLOWED_MIME_TYPES.has(ocrImageFile.type)) {
      setActionMessage(
        lang === "vi"
          ? "Chỉ hỗ trợ định dạng PNG hoặc JPG."
          : "Only PNG or JPG formats are supported."
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

    if (activeTool === "speech_text" && sttDuration > STT_MAX_DURATION_SECONDS) {
      setActionMessage(
        lang === "vi"
          ? "File audio vượt quá 5 phút. Vui lòng chọn file ngắn hơn."
          : "Audio is longer than 5 minutes. Please choose a shorter file."
      );
      return;
    }

    if (activeTool === "translate_vi_en" && !translateInput.trim()) {
      setActionMessage(
        lang === "vi"
          ? "Vui lòng nhập nội dung trước khi xác nhận."
          : "Please enter content before confirming."
      );
      return;
    }

    if (activeTool === "translate_vi_en" && translateInput.length > TRANSLATE_MAX_CHARS) {
      setActionMessage(
        lang === "vi"
          ? "Nội dung vượt quá 1000 ký tự. Vui lòng rút gọn."
          : "Text exceeds 1000 characters. Please shorten it."
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
          service: "127806",
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
        setSttCopied(false);
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
          service: "909650",
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
        setOcrCopied(false);
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

    if (activeTool === "translate_vi_en") {
      setIsSubmitting(true);
      setActionMessage(lang === "vi" ? "Đang gửi yêu cầu..." : "Sending request...");

      try {
        const payload = {
          action: "add",
          comments: translateInput.trim(),
          link: "translate",
          username: "",
          quantity: Math.max(1, translateInput.trim().length),
          national_market: normalizeLang(readCookie("national_market")),
          service: "909649",
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

        setTranslateText(text);
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
      <article
        className="mx-auto mt-4 w-full max-w-[1320px] overflow-x-hidden px-2 pb-8 pt-3 lg:mt-4 lg:px-8 xl:px-12"
        style={{ "--tool-col": "clamp(215px, 21.5vw, 280px)" } as React.CSSProperties}
      >
        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-start">
          <OrdersProcess
                lang={lang}
                activeTool={activeTool}
                routeRoot={routeRoot}
                relatedInsights={relatedInsights}
                showUtilitiesOnMobile={false}
              />

          <div className="min-w-0 flex-1 space-y-3">
            <OrdersContent
              activeContent={activeContent}
              articleTitle={articleTitle}
              articleDescription={articleDescription}
              writtenDateLabel={writtenDateLabel}
              writtenDateValue={writtenDateValue}
              lang={lang}
              activeNotes={activeNotes}
              moduleUsageGuideBlocks={moduleUsageGuideBlocks}
              activeTool={activeTool}
              ttsInput={ttsInput}
              setTtsInput={setTtsInput}
              sttFile={sttFile}
              setSttFile={setSttFile}
              sttText={sttText}
              setSttText={setSttText}
              sttCopied={sttCopied}
              setSttCopied={setSttCopied}
              sttExpanded={sttExpanded}
              setSttExpanded={setSttExpanded}
              sttDuration={sttDuration}
              setSttDuration={setSttDuration}
              sttPreviewUrl={sttPreviewUrl}
              STT_MAX_DURATION_SECONDS={STT_MAX_DURATION_SECONDS}
              ocrImageFile={ocrImageFile}
              setOcrImageFile={setOcrImageFile}
              ocrPreviewUrl={ocrPreviewUrl}
              ocrText={ocrText}
              setOcrText={setOcrText}
              ocrCopied={ocrCopied}
              setOcrCopied={setOcrCopied}
              ocrExpanded={ocrExpanded}
              setOcrExpanded={setOcrExpanded}
              OCR_ALLOWED_MIME_TYPES={OCR_ALLOWED_MIME_TYPES}
              OCR_MAX_IMAGE_BYTES={OCR_MAX_IMAGE_BYTES}
              setActionMessage={setActionMessage}
              translateInput={translateInput}
              setTranslateInput={setTranslateInput}
              translateText={translateText}
              TRANSLATE_MAX_CHARS={TRANSLATE_MAX_CHARS}
              handleConfirmTool={handleConfirmTool}
              isSubmitting={isSubmitting}
              actionMessage={actionMessage}
              generatedVoiceUrl={generatedVoiceUrl}
              activeContentEn={activeContentEn}
              readerValueTitle={readerValueTitle}
              readerValueText={readerValueText}
              conclusionTitle={conclusionTitle}
              conclusionText={conclusionText}
            />

            <div className="mt-4 mb-2 rounded-2xl border border-slate-200/75 bg-white/80 px-4 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                <div>
                  {helpfulVote ? (
                    <div className="text-sm font-medium text-slate-700">
                      {helpfulVote === "yes"
                        ? "Thank you for your feedback! We're glad you found this helpful."
                        : "Thank you for your feedback! We'll work on improving our content."}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-base font-semibold text-slate-800">
                        Was this content helpful to you?
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setHelpfulVote("yes")}
                          className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-lg border border-slate-400/70 bg-white px-4 text-base font-medium text-blue-700 transition hover:bg-slate-50"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setHelpfulVote("no")}
                          className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-lg border border-slate-400/70 bg-white px-4 text-base font-medium text-blue-700 transition hover:bg-slate-50"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
            </div>

            <div className="mt-4 lg:hidden">
              <OrdersProcess
                lang={lang}
                activeTool={activeTool}
                routeRoot={routeRoot}
                relatedInsights={relatedInsights}
                showToc={false}
              />
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default OrdersHome;
