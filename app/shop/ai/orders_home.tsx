"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import Head from "next/head";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Lang = "en" | "vi";
type ToolKey = "text_speech" | "speech_text" | "image_text";
const ALLOWED_TOOLS = new Set(["speech_text", "text_speech", "image_text"] as const);
type OrdersHomeProps = {
  slug_1?: string;
  slug_2?: string;
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

  const lang = useSyncExternalStore<Lang>(
    subscribeLang,
    () => normalizeLang(readCookie("national_market")),
    () => "en"
  );

  const seoByTool: Record<ToolKey, Record<Lang, { title: string; description: string; keywords: string }>> = {
    text_speech: {
      en: {
        title: "Text to Speech (TTS) — AI Voice Generator",
        description: "Convert text into natural-sounding speech for narration, learning, and accessibility.",
        keywords: "text to speech, TTS, AI voice, voice generator, narration, accessibility, Vietnamese TTS",
      },
      vi: {
        title: "Chuyển văn bản thành giọng nói (Text to Speech)",
        description: "Công cụ chuyển văn bản thành giọng nói phục vụ thuyết minh nội dung, học tập và trợ năng.",
        keywords: "chuyển văn bản thành giọng nói, text to speech, TTS, giọng nói AI, đọc văn bản, trợ năng, tiếng Việt",
      },
    },
    speech_text: {
      en: {
        title: "Speech to Text (STT) — Audio Transcription",
        description: "Transcribe speech into text to speed up note-taking, reporting, and content editing.",
        keywords: "speech to text, STT, transcription, audio to text, voice to text, meeting notes, Vietnamese STT",
      },
      vi: {
        title: "Chuyển giọng nói thành văn bản (Speech to Text)",
        description: "Công cụ chuyển giọng nói thành văn bản giúp ghi chú nhanh, tạo báo cáo và chỉnh sửa nội dung.",
        keywords: "chuyển giọng nói thành văn bản, speech to text, STT, phiên âm, ghi chú, audio to text, tiếng Việt",
      },
    },
    image_text: {
      en: {
        title: "Image to Text (OCR) — Extract Text from Images",
        description:
          "Extract readable text from images and screenshots (OCR) to reduce manual typing and support verification.",
        keywords: "image to text, OCR, extract text, screenshot to text, document OCR, receipt OCR, text recognition",
      },
      vi: {
        title: "Trích xuất chữ từ hình ảnh (OCR)",
        description: "Công cụ OCR trích xuất chữ từ ảnh và ảnh chụp màn hình, hỗ trợ nhập liệu nhanh và kiểm chứng thông tin.",
        keywords: "OCR, chuyển hình ảnh sang chữ, trích xuất chữ, nhận dạng ký tự, ảnh chụp màn hình, tài liệu",
      },
    },
  };

  const contentByTool: Record<
    ToolKey,
    Record<
      Lang,
      {
        heading: string;
        summary: string[];
        audience: string[];
        examples: string[];
        related: Array<{ label: string; href: string }>;
      }
    >
  > = {
    text_speech: {
      en: {
        heading: "About this AI module",
        summary: [
          "This module converts plain text into speech so teams can publish narrated content faster and improve accessibility for users who prefer listening.",
          "It is designed as a practical utility inside the Hust workflow, where creators, students, and operations teams need quick voice output for guides, product descriptions, and task documentation.",
          "In production use, this helps reduce repetitive recording work and keeps voice quality consistent across different campaigns.",
        ],
        audience: [
          "Content creators writing tutorials and explainer posts.",
          "Support teams producing short voice guides for onboarding.",
          "Students and mobile users who prefer listening over reading.",
        ],
        examples: [
          "Input: Product description paragraph. Output: playable narration for social posts.",
          "Input: Task instructions. Output: short voice briefing for collaborators.",
        ],
        related: [
          { label: "Accessibility basics for content teams", href: "/community/features" },
          { label: "Support workflow guidelines", href: "/support" },
        ],
      },
      vi: {
        heading: "Giới thiệu mô-đun AI",
        summary: [
          "Mô-đun này chuyển văn bản thành giọng nói để đội vận hành và người tạo nội dung xuất bản bản đọc nhanh hơn, đồng thời cải thiện trợ năng cho người dùng thích nghe hơn đọc.",
          "Công cụ được thiết kế theo hướng tiện ích thực dụng trong luồng Hust: mô tả sản phẩm, hướng dẫn, nội dung nhiệm vụ và thông tin hỗ trợ đều có thể tạo bản audio ngắn.",
          "Khi dùng thực tế, công cụ giúp giảm thao tác thu âm lặp lại và giữ chất lượng giọng đọc ổn định giữa nhiều chiến dịch.",
        ],
        audience: [
          "Người làm nội dung cần tạo giọng đọc cho bài hướng dẫn.",
          "Team CSKH cần audio onboarding hoặc hướng dẫn nhanh.",
          "Người dùng mobile/sinh viên muốn tiếp nhận nội dung bằng nghe.",
        ],
        examples: [
          "Input: Mô tả sản phẩm dài. Output: File đọc để gắn vào bài đăng.",
          "Input: Checklist nhiệm vụ. Output: Bản tóm tắt giọng nói cho cộng tác viên.",
        ],
        related: [
          { label: "Tổng quan tính năng cộng đồng", href: "/community/features" },
          { label: "Trang hỗ trợ kỹ thuật", href: "/support" },
        ],
      },
    },
    speech_text: {
      en: {
        heading: "About this AI module",
        summary: [
          "Speech-to-Text turns voice notes into editable text so teams can draft reports and logs faster without heavy typing.",
          "This is useful in real operations where users capture audio on mobile and then need structured text for moderation, support, or publishing flows.",
          "It also improves traceability because spoken updates become searchable records that can be reviewed later.",
        ],
        audience: [
          "Moderators collecting incident notes quickly.",
          "Operators creating daily reports from voice memos.",
          "Users with mobile-first workflows.",
        ],
        examples: [
          "Input: 30-second voice note. Output: draft text for report editor.",
          "Input: customer call summary. Output: searchable transcript for support history.",
        ],
        related: [
          { label: "Development services", href: "/services/development" },
          { label: "Community docs", href: "/docs" },
        ],
      },
      vi: {
        heading: "Giới thiệu mô-đun AI",
        summary: [
          "Speech-to-Text chuyển ghi âm thành văn bản có thể chỉnh sửa để rút ngắn thời gian nhập liệu trong các luồng báo cáo và vận hành.",
          "Trong thực tế, người dùng thường ghi âm nhanh trên điện thoại rồi cần chuyển thành văn bản chuẩn để lưu trữ, tìm kiếm và xử lý tiếp.",
          "Công cụ cũng tăng khả năng truy vết vì thông tin giọng nói được chuyển thành dữ liệu văn bản có thể tìm lại dễ dàng.",
        ],
        audience: [
          "Điều phối viên cần ghi nhận thông tin sự cố nhanh.",
          "Team vận hành cần tạo báo cáo hằng ngày từ voice note.",
          "Người dùng làm việc chủ yếu trên mobile.",
        ],
        examples: [
          "Input: Ghi âm 30 giây. Output: Bản nháp văn bản cho editor.",
          "Input: Tóm tắt cuộc gọi hỗ trợ. Output: Transcript để tìm kiếm lại.",
        ],
        related: [
          { label: "Dịch vụ phát triển", href: "/services/development" },
          { label: "Kho tài liệu", href: "/docs" },
        ],
      },
    },
    image_text: {
      en: {
        heading: "About this AI module",
        summary: [
          "Image-to-Text (OCR) extracts readable text from screenshots and documents, reducing manual typing in proof and verification workflows.",
          "Teams can convert visual evidence into searchable text, making auditing and review significantly faster.",
          "This is especially helpful when handling large batches of screenshots that need to be normalized before processing.",
        ],
        audience: [
          "Teams verifying receipts and screenshots.",
          "Editors digitizing text from images before publishing.",
          "Support teams checking user-submitted proof files.",
        ],
        examples: [
          "Input: receipt screenshot. Output: extracted amount/date text for verification.",
          "Input: image of instructions. Output: editable text for article updates.",
        ],
        related: [
          { label: "Feature overview", href: "/features" },
          { label: "Support page", href: "/support" },
        ],
      },
      vi: {
        heading: "Giới thiệu mô-đun AI",
        summary: [
          "OCR giúp trích xuất chữ từ ảnh, ảnh chụp màn hình và tài liệu để giảm thao tác nhập liệu thủ công trong các bước kiểm chứng.",
          "Thông tin dạng ảnh sẽ được chuyển thành văn bản có thể tìm kiếm, lọc và tái sử dụng trong quy trình xử lý nội dung.",
          "Đặc biệt hiệu quả khi xử lý số lượng lớn ảnh minh chứng cần chuẩn hóa trước khi đưa vào các bước vận hành tiếp theo.",
        ],
        audience: [
          "Nhóm kiểm duyệt cần đọc nhanh nội dung từ ảnh minh chứng.",
          "Editor cần số hóa chữ từ ảnh trước khi biên tập.",
          "CSKH cần tra cứu thông tin người dùng gửi bằng screenshot.",
        ],
        examples: [
          "Input: Ảnh biên lai. Output: Text số tiền/ngày tháng để đối soát.",
          "Input: Ảnh hướng dẫn cũ. Output: Văn bản chỉnh sửa để cập nhật bài viết.",
        ],
        related: [
          { label: "Tổng quan tính năng", href: "/features" },
          { label: "Trang hỗ trợ", href: "/support" },
        ],
      },
    },
  };

  const activeTool = isToolKey(slug_2) ? slug_2 : null;
  const showToolPage = (slug_1 === "plans" || slug_1 === "orders_once") && !!activeTool;

  const activeSeo = activeTool ? seoByTool[activeTool][lang] : null;
  const activeContent = activeTool ? contentByTool[activeTool][lang] : null;
  const routeRoot = slug_1 === "plans" ? "plans" : "orders_once";

  const toolTabs: Array<{ key: ToolKey; en: string; vi: string }> = [
    {
      key: "text_speech",
      en: "Text to Speech",
      vi: "Chuyển văn bản thành giọng nói",
    },
    {
      key: "speech_text",
      en: "Speech to Text",
      vi: "Chuyển giọng nói thành văn bản",
    },
    {
      key: "image_text",
      en: "Image to Text",
      vi: "Chuyển hình ảnh thành văn bản",
    },
  ];

  if (!showToolPage || !activeTool || !activeSeo || !activeContent) {
    return null;
  }

  const handleConfirmTool = () => {
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
            className="mt-4 w-full rounded-full bg-slate-900 px-5 py-3 text-left text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {lang === "vi" ? "✔ Xác nhận xử lý" : "✔ Confirm Processing"}
            <span className="float-right">➤</span>
          </button>

          {actionMessage ? (
            <p className="mt-2 text-xs text-slate-600">{actionMessage}</p>
          ) : null}
        </section>
      </article>
    </>
  );
};

export default OrdersHome;
