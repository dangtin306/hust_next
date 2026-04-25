"use client";

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { alert_error, alert_success } from "@/app/AppContext";
import { ALLOWED_TOOLS, contentByTool, seoByTool, type Lang, type ToolKey } from "./orders_data";
import OrdersProcess from "./orders_process";

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
type HelpfulVote = "" | "yes" | "no";

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
  if (typeof window === "undefined") return () => { };
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
  ALLOWED_TOOLS.has(value as ToolKey);

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
  const [helpfulVote, setHelpfulVote] = useState<HelpfulVote>("");
  const [translateInput, setTranslateInput] = useState("");
  const [translateText, setTranslateText] = useState("");

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
    setTranslateText("");
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

  const activeContentEn = contentByTool[activeTool].en;
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

    if (activeTool === "speech_text" && !sttFile) {
      setActionMessage(
        lang === "vi"
          ? "Vui lòng tải file audio trước khi xác nhận."
          : "Please upload an audio file before confirming."
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
          service: "899522",
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
            showUtilitiesOnMobile={false}
          />

          <div className="min-w-0 flex-1 space-y-2">
            <section id="section-introduction" className="w-full min-w-0 rounded-2xl border border-white/60 bg-gradient-to-r from-emerald-100/80 via-white/80 to-cyan-100/80 px-4 py-4 shadow-sm backdrop-blur-md lg:flex-1">
              <div className="mb-2 mt-1 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold leading-tight text-slate-900">
                    {activeContent.title}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-medium tracking-wide text-slate-600 sm:text-xs">
                      By Hust Media
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-medium tracking-wide text-slate-600 sm:text-xs">
                      Digital Suite
                    </span>
                  </div>
                </div>

                <a
                  href="/ai/utility/home_ai"
                  className="inline-flex shrink-0 items-center rounded-2xl border border-pink-200 bg-pink-50 px-3 py-1.5 text-sm font-semibold text-slate-900 no-underline shadow-sm transition hover:bg-pink-100 hover:no-underline active:scale-[0.98]"
                >
                  Back to Suite
                </a>
              </div>

              <div className="mt-3 pl-1 sm:pl-1.5">
                <h2 className="text-sm font-semibold leading-snug text-slate-800">
                  {activeContent.heading}
                </h2>
                <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
                  {activeContent.summary.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>
            <div>
              <section id="section-audience" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  {lang === "vi" ? "Ai nên dùng mô-đun này?" : "Who should use this module?"}
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 marker:text-emerald-600">
                  {activeContent.audience.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>

            <div>
              <section id="section-notes" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  {activeTool === "text_speech"
                    ? "How My Vietnamese Text-to-Speech Pipeline Runs on a Flask AI Server"
                    : activeTool === "speech_text"
                      ? "How My Vietnamese Speech-to-Text Pipeline Runs on a Flask AI Server"
                      : activeTool === "image_text"
                        ? "How My Image-to-Text Module Works in a Rule-Based OCR Workflow"
                        : activeTool === "translate_vi_en"
                          ? "How My Vietnamese-to-English Module Runs on a Flask AI Server"
                          : (lang === "vi" ? "Bài viết liên quan" : "Related Articles")}
                </h2>
                {activeTool === "text_speech" ? (
                  <div className="mt-2 pl-0.5 sm:pl-1 space-y-3 break-words text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Short description for the article card
                      </div>
                      <div className="mt-1">
                        This article explains how my Vietnamese Text-to-Speech module works on a Flask-based AI server, from request routing and model selection to waveform generation and MP3 export. It also outlines the current runtime settings, voice generation flow, and a few practical limits in the version I am using now.
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Article body
                      </div>
                      <div className="mt-1 space-y-2">
                        <p>
                          My Text-to-Speech module runs on a Python Flask AI server inside D:\hustmedia\python. The service is exposed on 0.0.0.0:8789, and the main POST /tts route works as a dispatcher between two Vietnamese TTS engines: a local F5-based pipeline and an alternative path based on facebook/mms-tts-vie. The API requires a non-empty text field, reads a servicecode, and falls back to the F5 engine unless the request explicitly asks for the Facebook path. In the current version, the request is processed synchronously and the API returns a success payload rather than streaming the audio directly.
                        </p>
                        <p>
                          The main voice generation path is F5_vie. Before synthesis begins, the module converts numeric strings into Vietnamese words so phone numbers, quantities, and short operational text sound more natural. The server then calls f5-tts_infer-cli with a fixed reference voice file, the F5TTS_Base model, speed 0.5, the vocos vocoder, a local vocabulary file, and the checkpoint model_500000.pt. After inference, the generated WAV file is converted to MP3 with pydub and saved to D:\hustmedia\python\tts\output\output.mp3.
                        </p>
                        <p>
                          Inside the F5 pipeline, the processing flow is more than a simple wrapper call. The CLI loads its config, model backbone, and checkpoint, preprocesses the reference audio by trimming silence and adding about 50 ms of padding, and can infer missing reference text with Whisper. The generation text is then split into batches, normalized, resampled to 24 kHz, and passed through the sampling path before the waveform is decoded by the vocoder. When multiple chunks are produced, they are joined with a default cross-fade of 0.15 seconds to reduce audible breaks.
                        </p>
                        <p>
                          I also keep a second engine based on facebook/mms-tts-vie. In this path, the tokenizer and model are loaded from Hugging Face, the text is converted into a waveform, and the result is exported through the same output pipeline. This version is useful as an alternative engine, but in the current code it reloads the model on each request, so latency and memory usage can vary more than a persistent in-memory design. Both engines also write to the same output MP3 path, which means concurrent requests need tighter output isolation in future revisions.
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Technical configuration snapshot
                      </div>
                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        <li>Runtime: Python Flask server on 0.0.0.0:8789</li>
                        <li>Main route: POST /tts</li>
                        <li>Default engine: F5_vie</li>
                        <li>Alternate engine: facebook/mms-tts-vie</li>
                        <li>Model path: F5TTS_Base</li>
                        <li>Vocoder: vocos</li>
                        <li>Checkpoint: model_500000.pt</li>
                        <li>Speed: 0.5</li>
                        <li>Audio resample target: 24 kHz</li>
                        <li>Chunk merge: 0.15 s cross-fade</li>
                        <li>Export: WAV to MP3 via pydub</li>
                      </ul>
                    </div>
                  </div>
                ) : activeTool === "speech_text" ? (
                  <div className="mt-2 pl-0.5 sm:pl-1 space-y-3 break-words text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Short description for the article card
                      </div>
                      <div className="mt-1">
                        This article explains how my Speech-to-Text module processes Vietnamese audio on a Flask AI server, from file input and waveform normalization to transcription output. It also outlines the current model choice, API behavior, and practical runtime limits.
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Article body
                      </div>
                      <div className="mt-1 space-y-2">
                        <p>
                          My Speech-to-Text module runs on the same Python Flask AI server used for the other media utilities in this workflow. The main API entry point is GET/POST /wav2vec2, served through Flask on port 8789. In the current version, the endpoint reads an audio path from form data or query parameters, and if no path is provided, it falls back to a default local file. The response returns JSON with status, transcript, and the processed file path.
                        </p>
                        <p>
                          The transcription engine is based on the Hugging Face model khanhld/wav2vec2-base-vietnamese-160h. Both the processor and model are loaded once when the module starts, rather than reloading on every request. The runtime device is selected automatically, using GPU when CUDA is available and CPU otherwise. This keeps repeated requests more stable, although it also means the service keeps a memory footprint while running.
                        </p>
                        <p>
                          For audio processing, the file is loaded with librosa, converted to mono, and resampled to 16 kHz, which matches the model input. A normalized intermediate WAV file can also be written to D:\hustmedia\python\tts\wav2vec2\run.wav for inspection or reuse. Before inference, the waveform is converted to float32, checked to avoid empty input, and normalized by peak amplitude.
                        </p>
                        <p>
                          Once prepared, the audio is tokenized with sampling_rate=16000 and passed through the model under torch.no_grad(). The output logits are decoded with greedy CTC argmax, then converted into text with batch_decode. In its current form, this module does not use beam search, VAD chunking, or language-model rescoring, so long files are still processed in one pass and may increase latency or memory usage.
                        </p>
                        <p>
                          This module is mainly intended for practical Vietnamese transcription tasks such as voice notes, support logs, internal updates, and simple content preparation. It is not designed as a full enterprise ASR platform, but as a working in-house component that I built and maintain for my own workflow.
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Technical configuration snapshot
                      </div>
                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        <li>Server runtime: Flask on port 8789</li>
                        <li>Main endpoint: GET/POST /wav2vec2</li>
                        <li>STT model: khanhld/wav2vec2-base-vietnamese-160h</li>
                        <li>Device selection: automatic GPU / CPU</li>
                        <li>Input normalization: mono audio, 16 kHz</li>
                        <li>Intermediate WAV path: D:\hustmedia\python\tts\wav2vec2\run.wav</li>
                        <li>Decode method: greedy CTC argmax</li>
                        <li>Inference mode: torch.no_grad()</li>
                        <li>Current limitation: no chunking, no VAD, no beam search</li>
                      </ul>
                    </div>
                  </div>
                ) : activeTool === "image_text" ? (
                  <div className="mt-2 pl-0.5 sm:pl-1 space-y-3 break-words text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Short description for the article card
                      </div>
                      <div className="mt-1">
                        This article explains how my Image-to-Text workflow extracts text from screenshots through a local OCR pipeline, from screen capture and region detection to text extraction and post-checking. It also outlines the OCR stack, processing rules, and practical limits.
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Article body
                      </div>
                      <div className="mt-1 space-y-2">
                        <p>
                          My current Image-to-Text workflow is built around a local OCR pipeline rather than a general upload-and-read service. In the repo under D:\hustmedia\python, the working path uses local Tesseract OCR, while PaddleOCR and EasyOCR only appear as external service references, not as full OCR logic in this codebase.
                        </p>
                        <p>
                          The flow starts with a Selenium script that opens the target chat interface and saves a screenshot as screenshot.png. A second script then processes that image with pytesseract, using the fixed Tesseract binary at D:\hustmedia\application\Tesseract-OCR\tesseract.exe. Before OCR runs, the image is cropped to the expected chat area, then refined by detecting a gray edge region to isolate the relevant message area.
                        </p>
                        <p>
                          The pipeline detects candidate text boxes using contour detection on an Otsu-thresholded image. The boxes are merged by row and horizontal spacing, then filtered with rules for gray regions, uniform backgrounds, and a LINE_THRESHOLD step that removes noisy rows. Instead of reading the whole image, the script keeps only the lowest valid box, expands it with PAD = 5, and runs OCR on that region with pytesseract.image_to_string(..., --psm 7). The extracted text and coordinates are then written to center.json.
                        </p>
                        <p>
                          This means the current module is not a broad OCR engine for all image types. It is a rule-based OCR workflow designed for a specific chat-style UI, where the goal is to capture the final relevant text line rather than read the full screenshot. That makes it practical for controlled verification tasks, but also dependent on layout consistency.
                        </p>
                        <p>
                          After OCR, the workflow reads center.json, applies a computer-vision check for a red heart icon, and when needed, sends the extracted text into a lightweight classification step before writing the final check_content result back to JSON. This gives the module both an extraction layer and a validation layer.
                        </p>
                        <p>
                          At the current stage, the main Flask AI server does not expose a direct public /ocr or /image2text endpoint. So this module should be understood as a working internal OCR component with specific UI-oriented logic, not yet as a universal OCR API.
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Technical configuration snapshot
                      </div>
                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        <li>OCR stack: local Tesseract OCR</li>
                        <li>Python wrapper: pytesseract</li>
                        <li>Tesseract binary: D:\hustmedia\application\Tesseract-OCR\tesseract.exe</li>
                        <li>Screenshot source: Selenium capture to screenshot.png</li>
                        <li>Region output: chat_region.png</li>
                        <li>OCR target: lowest valid filtered text box</li>
                        <li>Threshold method: Otsu</li>
                        <li>OCR mode: --psm 7</li>
                        <li>Padding value: PAD = 5</li>
                        <li>Output file: center.json</li>
                        <li>Extra validation: CV rule check + content classification</li>
                        <li>Current limitation: no direct public OCR endpoint</li>
                      </ul>
                    </div>
                  </div>
                ) : activeTool === "translate_vi_en" ? (
                  <div className="mt-2 pl-0.5 sm:pl-1 space-y-3 break-words text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Short description for the article card
                      </div>
                      <div className="mt-1">
                        This article explains how my Vietnamese-to-English module runs on a Flask AI server, from route dispatch and model loading to text and HTML translation output. It also outlines the current translation direction, runtime flow, and practical limits.
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Article body
                      </div>
                      <div className="mt-1 space-y-2">
                        <p>
                          My Vietnamese-to-English module runs inside the current Flask server, not as a separate public app. In the repo, the server adds the translate directory to sys.path, and the /translate route dispatches requests through translate_fb(...), which maps to main(...) in translate/server_4.py. The route reads content and category from form or query input and does not parse JSON body data.
                        </p>
                        <p>
                          The wrapper is fixed to Vietnamese-to-English by default. In server_4.py, the main entry uses src_lang=&quot;vi&quot; and tgt_lang=&quot;en&quot;, and the /translate route does not override them. Because of that, requests sent to /translate follow one default direction unless the code is changed.
                        </p>
                        <p>
                          Translation uses facebook/nllb-200-distilled-600M. The tokenizer is loaded globally once, while the model pipeline is lazy-loaded through _get_pipeline() with a lock to avoid race conditions during first initialization. This lets later requests reuse the same pipeline in memory.
                        </p>
                        <p>
                          Language direction is enforced through the NLLB language map and generation settings. Vietnamese maps to vie_Latn, English to eng_Latn, the tokenizer source language is set before generation, and output is forced by forced_bos_token_id. This keeps the module returning English output when the target remains en.
                        </p>
                        <p>
                          For normal text, the module preserves leading and trailing spacing, translates only the stripped core content, and returns the original input unchanged if the text is empty after stripping. For HTML, it parses the document with BeautifulSoup, skips nodes such as script, style, and source, translates valid text nodes in batch, then writes them back while preserving node spacing. If category is not html, the dispatcher falls back to the text path.
                        </p>
                        <p>
                          The translation path also has limits. Input is truncated at max_length=512, output is capped by max_new_tokens=50, and long content can be cut on both sides. Cache and temp paths are moved to drive F: by default, or to HUSTMEDIA_AI_CACHE if that environment variable is set. The model normally stays in memory for faster reuse, but if TRANSLATE_RESET_EACH_CALL=1 is enabled, the pipeline resets and cleans memory after each request.
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Technical configuration snapshot
                      </div>
                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        <li>Server route: /translate</li>
                        <li>Route input: content, category from form/query</li>
                        <li>Main wrapper: main(content, src_lang=&quot;vi&quot;, tgt_lang=&quot;en&quot;, category=&quot;text&quot;)</li>
                        <li>Translation model: facebook/nllb-200-distilled-600M</li>
                        <li>Source language map: vi -&gt; vie_Latn</li>
                        <li>Target language map: en -&gt; eng_Latn</li>
                        <li>Direction control: forced_bos_token_id</li>
                        <li>Text mode: translate stripped core, preserve outer spacing</li>
                        <li>HTML mode: BeautifulSoup parse + batch text-node translation</li>
                        <li>Input limit: max_length=512</li>
                        <li>Output limit: max_new_tokens=50</li>
                        <li>Cache path: F: or HUSTMEDIA_AI_CACHE</li>
                        <li>Optional reset mode: TRANSLATE_RESET_EACH_CALL=1</li>
                        <li>Current limitation: fixed VI -&gt; EN, no JSON POST parsing, invalid target may return 500</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 pl-0.5 sm:pl-1 text-sm leading-relaxed text-slate-700">
                    {activeContent.related.map((item) => item.label).join(". ")}.
                  </div>
                )}
              </section>
            </div>

            <div className="pt-0.5">
              <section id="section-workflow" className="w-full rounded-2xl border border-indigo-200 bg-white px-4 py-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    {activeTool === "speech_text"
                      ? (lang === "vi" ? "Chuyển âm thanh thành văn bản" : "Audio Transcription")
                      : activeTool === "image_text"
                        ? (lang === "vi" ? "Trích xuất văn bản từ ảnh" : "Image Text Extraction")
                        : activeTool === "translate_vi_en"
                          ? "Vietnamese to English Translation"
                          : (lang === "vi" ? "Tạo giọng đọc" : "Voice Generation")}
                  </h2>
                </div>

                {activeTool === "text_speech" && (
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">
                      {lang === "vi" ? "Nhập văn bản để tạo bản đọc" : "Enter text for narration"}
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
                        ? "Tải tệp âm thanh để chuyển thành văn bản."
                        : "Upload audio to convert it into text"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {lang === "vi"
                        ? "Định dạng hỗ trợ: MP3, WAV, M4A, OGG"
                        : "Supported formats: MP3, WAV, M4A, OGG"}
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
                          : (lang === "vi" ? "Chưa có tệp nào được chọn" : "No file selected")}
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
                      {lang === "vi" ? "Tải ảnh lên để trích xuất văn bản" : "Upload an image to extract readable text"}
                    </label>
                    <p className="mb-2 text-xs text-slate-500">
                      {lang === "vi"
                        ? "Phù hợp với ảnh chụp màn hình, hóa đơn, biểu mẫu và tài liệu đơn giản. Vui lòng chỉ tải nội dung bạn được phép sử dụng."
                        : "Best for screenshots, receipts, forms, and simple documents. Please upload only content you are authorized to use."}
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
                        {lang === "vi" ? "Chọn tệp hình ảnh" : "Choose image file"}
                      </label>
                      <p className="mt-2 text-xs text-slate-600">
                        {ocrImageFile
                          ? (lang === "vi" ? "Đã chọn:" : "Selected:") + ` ${ocrImageFile.name}`
                          : (lang === "vi" ? "Chưa có ảnh nào được chọn" : "No image selected")}
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

                {activeTool === "translate_vi_en" && (
                  <div>
                    <label className="mb-1 block text-sm text-slate-700">Enter Vietnamese text to translate</label>
                    <textarea
                      suppressHydrationWarning
                      value={translateInput}
                      onChange={(e) => setTranslateInput(e.target.value)}
                      placeholder="Paste Vietnamese text for English translation..."
                      className="h-28 w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-0 focus:border-slate-400"
                    />
                    <p className="mt-2 text-xs text-slate-600">Current characters: {translateInput.length}</p>
                    {translateText ? (
                      <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center gap-2">
                            <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                              Output
                            </span>
                            <p className="text-xs font-medium text-slate-700">English Translation</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(translateText)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <span>⧉</span>
                            <span>Copy</span>
                          </button>
                        </div>
                        <div className="max-h-44 overflow-y-auto rounded-md border border-slate-200 bg-white p-2">
                          <p className="whitespace-pre-wrap break-words text-sm text-slate-700">{translateText}</p>
                        </div>
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
                    : activeTool === "speech_text"
                      ? (lang === "vi" ? "Tạo bản chép lời" : "Generate Transcript")
                      : activeTool === "image_text"
                        ? (lang === "vi" ? "Trích xuất văn bản" : "Extract Text")
                        : activeTool === "translate_vi_en"
                          ? "Translate to English"
                          : (lang === "vi" ? "Tạo âm thanh" : "Generate Audio")}
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
            </div>

            <div>
              <section id="section-examples" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Practical Input/Output Examples
                </h2>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {activeContentEn.examples.map((example, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      {example}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div id="section-feedback" className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
                <div className="space-y-2.5">
                  <h2 className="text-sm font-semibold leading-snug text-slate-900">
                    {readerValueTitle}
                  </h2>
                <p className="pl-1 sm:pl-1.5 text-sm leading-relaxed text-slate-700">
                  {readerValueText}
                </p>
              </div>

              <div className="my-5 border-t border-slate-200/70" />

              <div id="section-conclusion" className="space-y-2 mb-1">
                <h2 className="text-sm font-semibold leading-snug text-slate-900">
                  {conclusionTitle}
                </h2>
                <p className="pl-1 sm:pl-1.5 text-sm leading-relaxed text-slate-600">
                  {conclusionText}
                </p>
              </div>
            </div>

            <div className="mt-3 mb-2 lg:mt-4 lg:-mb-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
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
