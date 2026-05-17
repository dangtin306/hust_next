import React from "react";

type RelatedItem = { label: string };
type ActiveContent = {
  title: string;
  heading: string;
  summary: string[];
  practical?: string;
  audience: string[];
  related: RelatedItem[];
};
type ActiveNotes = {
  title?: string;
  shortDescription: string;
  articleBody: string[];
  technicalSnapshot: string[];
} | null;
type ActiveContentEn = {
  examples: string[];
};

type OrdersContentProps = {
  activeContent: ActiveContent;
  articleTitle: string;
  articleDescription: string;
  writtenDateLabel: string;
  writtenDateValue: string;
  lang: string;
  activeNotes: ActiveNotes;
  moduleUsageGuideBlocks: Array<{ type: "paragraph"; text: string } | { type: "bullets"; items: string[] }>;
  activeTool: string;
  ttsInput: string;
  setTtsInput: (v: string) => void;
  sttFile: File | null;
  setSttFile: (f: File | null) => void;
  sttText: string;
  setSttText: (v: string) => void;
  sttCopied: boolean;
  setSttCopied: (v: boolean) => void;
  sttExpanded: boolean;
  setSttExpanded: (v: boolean | ((prev: boolean) => boolean)) => void;
  sttDuration: number;
  setSttDuration: (v: number) => void;
  sttPreviewUrl: string;
  STT_MAX_DURATION_SECONDS: number;
  ocrImageFile: File | null;
  setOcrImageFile: (f: File | null) => void;
  ocrPreviewUrl: string;
  ocrText: string;
  setOcrText: (v: string) => void;
  ocrCopied: boolean;
  setOcrCopied: (v: boolean) => void;
  ocrExpanded: boolean;
  setOcrExpanded: (v: boolean | ((prev: boolean) => boolean)) => void;
  OCR_ALLOWED_MIME_TYPES: Set<string>;
  OCR_MAX_IMAGE_BYTES: number;
  setActionMessage: (v: string) => void;
  translateInput: string;
  setTranslateInput: (v: string) => void;
  translateText: string;
  TRANSLATE_MAX_CHARS: number;
  handleConfirmTool: () => void;
  isSubmitting: boolean;
  actionMessage: string;
  generatedVoiceUrl: string;
  activeContentEn: ActiveContentEn;
  readerValueTitle: string;
  readerValueText: string;
  conclusionTitle: string;
  conclusionText: string;
};

export default function OrdersContent(props: OrdersContentProps) {
  const {
    activeContent,
    articleTitle,
    articleDescription,
    writtenDateLabel,
    writtenDateValue,
    lang,
    activeNotes,
    moduleUsageGuideBlocks,
    activeTool,
    ttsInput,
    setTtsInput,
    sttFile,
    setSttFile,
    sttText,
    setSttText,
    sttCopied,
    setSttCopied,
    sttExpanded,
    setSttExpanded,
    sttDuration,
    setSttDuration,
    sttPreviewUrl,
    STT_MAX_DURATION_SECONDS,
    ocrImageFile,
    setOcrImageFile,
    ocrPreviewUrl,
    ocrText,
    setOcrText,
    ocrCopied,
    setOcrCopied,
    ocrExpanded,
    setOcrExpanded,
    OCR_ALLOWED_MIME_TYPES,
    OCR_MAX_IMAGE_BYTES,
    setActionMessage,
    translateInput,
    setTranslateInput,
    translateText,
    TRANSLATE_MAX_CHARS,
    handleConfirmTool,
    isSubmitting,
    actionMessage,
    generatedVoiceUrl,
    activeContentEn,
    readerValueTitle,
    readerValueText,
    conclusionTitle,
    conclusionText,
  } = props;

  return (
    <>
      <section id="section-introduction" className="w-full min-w-0 rounded-3xl border border-slate-200/70 bg-white/85 shadow-2xl ring-1 ring-black/5 backdrop-blur-md lg:flex-1">
        <div className="max-lg:px-3 lg:px-7 pb-2 max-lg:pt-6 lg:pt-10">
          <div className="mb-2 mt-1 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="min-w-0 flex-1 text-balance text-xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {articleTitle}
              </h1>
              <div className="mt-3 line-clamp-3 text-pretty text-sm leading-relaxed text-slate-600 sm:text-base">
                {articleDescription}
              </div>

              <div className="mt-3 flex min-w-0 flex-row flex-nowrap items-center gap-2 text-xs text-slate-500 sm:flex-wrap sm:gap-x-3 sm:gap-y-2 sm:text-sm">
                <span className="inline-flex min-w-0 flex-1 items-start gap-2 rounded-full bg-slate-100 px-3 py-1 sm:flex-none sm:w-auto">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-slate-500"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 3v2M17 3v2M4 8h16M6 12h4m-4 4h6m9-8v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="min-w-0 whitespace-normal break-words leading-tight">
                    {writtenDateLabel}{" "}
                    <span className="font-medium text-slate-700">{writtenDateValue}</span>
                  </span>
                </span>
                <span className="inline-flex max-w-[44%] shrink-0 items-center whitespace-nowrap rounded-full border border-[#D8E0E8] bg-[#EEF2F6] px-2.5 py-1 font-semibold text-[#5E6B7A] sm:max-w-none">
                  Digital Suite
                </span>
              </div>
            </div>

            <a
              href="/ai/utility/home_ai"
              className="inline-flex shrink-0 items-center no-underline rounded-2xl border border-pink-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-pink-50 hover:no-underline active:scale-[0.98]"
            >
              Back to Suite
            </a>
          </div>

          <div className="mt-8">
            <div className="text-lg font-bold leading-snug text-slate-900">
              {activeContent.heading}
            </div>
            <div className="mt-2 text-[16px] leading-[1.7] text-slate-700">
              <p className="pl-0.5 sm:pl-1">{activeContent.summary[0] || ""}</p>
              {activeContent.practical && activeContent.summary[1] ? (
                <div id="section-practical-notes" className="mt-4 border-t border-slate-200/80 pt-3">
                  <div className="text-lg font-bold leading-snug text-slate-900">
                    {activeContent.practical}
                  </div>
                  <p className="mt-2 pl-0.5 sm:pl-1">{activeContent.summary[1]}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div id="section-audience" className="mt-4 border-t border-slate-200/80 pt-3">
            <h2 className="text-lg font-bold text-slate-900">
              {lang === "vi" ? "Ai nên dùng mô-đun này?" : "Who should use this module?"}
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-6 sm:pl-7 text-[16px] leading-[1.7] text-slate-700 marker:text-sky-600">
              {activeContent.audience.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div id="section-notes" className="mt-4 border-t border-slate-200/80 pt-3">
            <h2 className="text-lg font-bold text-slate-900">
              {activeNotes?.title || (lang === "vi" ? "Bài viết liên quan" : "Related Articles")}
            </h2>
            {activeNotes ? (
              <div className="mt-2 pl-0.5 sm:pl-1 space-y-4 break-words text-[16px] leading-[1.7] text-slate-700 [overflow-wrap:anywhere]">
                <div className="pt-1">
                  <div className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                    Short description for the article card
                  </div>
                  <div className="mt-1">{activeNotes.shortDescription}</div>
                </div>

                <div className="border-t border-slate-200/80 pt-3">
                  <div className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                    Article body
                  </div>
                  <div className="mt-1 space-y-2">
                    {activeNotes.articleBody.map((paragraph: string, idx: number) => (
                      <p key={`note-body-${idx}`}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-3">
                  <div className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
                    Technical configuration snapshot
                  </div>
                  <ul className="mt-2 space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[14px] leading-7 text-slate-700 sm:columns-2 sm:gap-6">
                    {activeNotes.technicalSnapshot.map((line: string, idx: number) => (
                      <li key={`note-tech-${idx}`}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-2 pl-0.5 sm:pl-1 text-sm leading-relaxed text-slate-700">
                  {activeContent.related.map((item) => item.label).join(". ")}.
              </div>
            )}
          </div>
        </div>
      </section>

      <div>
        <section id="section-examples" className="w-full rounded-3xl border border-slate-200/70 bg-white/85 px-4 py-5 shadow-2xl ring-1 ring-black/5 backdrop-blur-md lg:px-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">
            {lang === "vi" ? "Thực Hành Module" : "Practical Use"}
          </div>
          <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900">
            Module Usage Guide
          </h3>
          <div className="mt-2 space-y-2">
            {moduleUsageGuideBlocks.map((block, idx) =>
              block.type === "paragraph" ? (
                <p key={`guide-p-${idx}`} className="text-[16px] leading-[1.7] text-slate-700">
                  {block.text}
                </p>
              ) : (
                <ol
                  key={`guide-ul-${idx}`}
                  className="list-decimal list-outside space-y-2 rounded-lg border-l-2 border-slate-200 pl-7 pr-1 text-[16px] leading-[1.7] text-slate-700 marker:font-semibold marker:text-slate-500"
                >
                  {block.items.map((item, itemIdx) => (
                    <li
                      key={`guide-li-${idx}-${itemIdx}`}
                      className="pl-2 leading-[1.7] [text-wrap:pretty]"
                    >
                      {item}
                    </li>
                  ))}
                </ol>
              )
            )}
          </div>
          <p className="mt-3 text-sm text-slate-600">
            {lang === "vi"
              ? "Áp dụng các bước sau để thử nhanh mô-đun với dữ liệu thực tế của bạn."
              : "Use the steps below to quickly test this module with your real content."}
          </p>
          <div className="my-4 border-t border-slate-300/90" />

          <div id="section-workflow" className="mt-1 p-0">
            <div className="mb-3 h-1 w-16 rounded-full bg-indigo-300/80"></div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold leading-snug text-slate-900">
                {activeTool === "speech_text"
                  ? (lang === "vi" ? "Chuyển âm thanh thành văn bản" : "Audio Transcription")
                  : activeTool === "image_text"
                    ? (lang === "vi" ? "Trích xuất văn bản từ ảnh" : "Image Text Extraction")
                    : activeTool === "translate_vi_en"
                      ? "Vietnamese to English Translation"
                      : (lang === "vi" ? "Tạo giọng đọc" : "Voice Generation")}
              </h3>
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
                  className="h-28 w-full resize-none rounded-lg border border-slate-300 p-3 text-sm text-slate-800 outline-none ring-0 focus:border-slate-400"
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
                <p className="mt-1 text-xs text-slate-500">
                  {lang === "vi"
                    ? "Giới hạn thời lượng: tối đa 5 phút."
                    : "Duration limit: up to 5 minutes."}
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
                      setSttCopied(false);
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
                  {sttDuration > STT_MAX_DURATION_SECONDS ? (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {lang === "vi"
                        ? "Audio đang vượt quá giới hạn 5 phút."
                        : "This audio exceeds the 5-minute limit."}
                    </p>
                  ) : null}
                  {sttFile && sttPreviewUrl ? (
                    <audio controls className="mt-3 w-full" src={sttPreviewUrl}>
                      Your browser does not support the audio element.
                    </audio>
                  ) : null}
                </div>
                {sttText ? (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2">
                        <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                          Output
                        </span>
                        <p className="text-xs font-medium text-slate-700">
                          {lang === "vi" ? "Kết quả Speech to Text" : "Speech to Text Output"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!sttText.trim()) return;
                          await navigator.clipboard?.writeText(sttText);
                          setSttCopied(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <span>⧉</span>
                        <span>{sttCopied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      {lang === "vi"
                        ? "Nội dung được tạo tự động, vui lòng kiểm tra lại trước khi sử dụng."
                        : "This output is machine-generated. Please review before using."}
                    </p>
                    <div className="mt-2 max-h-44 overflow-y-auto rounded-md border border-slate-200 bg-white p-2">
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
                <p className="mb-2 text-xs text-slate-500">
                  {lang === "vi"
                    ? "Định dạng cho phép: PNG, JPG. Giới hạn dung lượng: tối đa 20MB."
                    : "Allowed formats: PNG, JPG. File size limit: up to 20MB."}
                </p>
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                  <input
                    id="ocr-image-file"
                    type="file"
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && !OCR_ALLOWED_MIME_TYPES.has(file.type)) {
                        setOcrImageFile(null);
                        setOcrText("");
                        setOcrCopied(false);
                        setActionMessage(
                          lang === "vi"
                            ? "Chỉ hỗ trợ định dạng PNG hoặc JPG."
                            : "Only PNG or JPG formats are supported."
                        );
                        return;
                      }
                      if (file && file.size > OCR_MAX_IMAGE_BYTES) {
                        setOcrImageFile(null);
                        setOcrText("");
                        setOcrCopied(false);
                        setActionMessage(
                          lang === "vi"
                            ? "Ảnh vượt quá 20MB. Vui lòng chọn ảnh nhỏ hơn."
                            : "Image exceeds 20MB. Please choose a smaller image."
                        );
                        return;
                      }
                      setOcrImageFile(file);
                      setOcrText("");
                      setOcrCopied(false);
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
                  {ocrImageFile ? (
                    <p className="mt-1 text-xs text-slate-600">
                      {lang === "vi" ? "Dung lượng:" : "Size:"} {(ocrImageFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  ) : null}
                  {ocrPreviewUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ocrPreviewUrl}
                        alt="OCR preview"
                        className="mt-3 max-h-56 rounded-md border border-slate-200 object-contain"
                      />
                    </>
                  ) : null}
                </div>
                {ocrText ? (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2">
                        <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                          Output
                        </span>
                        <p className="text-xs font-medium text-slate-700">
                          {lang === "vi" ? "Kết quả Image to Text" : "Image to Text Output"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!ocrText.trim()) return;
                          await navigator.clipboard?.writeText(ocrText);
                          setOcrCopied(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <span>⧉</span>
                        <span>{ocrCopied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      {lang === "vi"
                        ? "Nội dung được tạo tự động, vui lòng kiểm tra lại trước khi sử dụng."
                        : "This output is machine-generated. Please review before using."}
                    </p>
                    {ocrText.length > 800 ? (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setOcrExpanded((prev) => !prev)}
                          className="text-xs font-medium text-cyan-700 underline"
                        >
                          {ocrExpanded
                            ? lang === "vi"
                              ? "Thu gọn"
                              : "Show less"
                            : lang === "vi"
                              ? "Xem thêm"
                              : "Show more"}
                        </button>
                      </div>
                    ) : null}
                    <div
                      className={
                        ocrExpanded
                          ? "mt-2 rounded-md border border-slate-200 bg-white p-2"
                          : "mt-2 max-h-44 overflow-y-auto rounded-md border border-slate-200 bg-white p-2"
                      }
                    >
                      <p className="whitespace-pre-wrap break-words text-sm text-slate-700">
                        {ocrText}
                      </p>
                    </div>
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
                  maxLength={TRANSLATE_MAX_CHARS}
                  className="h-28 w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800 outline-none ring-0 focus:border-slate-400"
                />
                <p className="mt-2 text-xs text-slate-600">
                  Current characters: {translateInput.length}/{TRANSLATE_MAX_CHARS}
                </p>
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

            <div className="mt-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-500/90">
                Sample Inputs
              </h3>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                {activeContentEn.examples.map((example: string, idx: number) => (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-white/80 p-2.5 text-xs leading-relaxed text-slate-600">
                    {example}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div id="section-feedback" className="mt-4 rounded-2xl border border-slate-200/90 bg-slate-100/70 px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">
          {lang === "vi" ? "Ghi Chú Kết" : "Closing Notes"}
        </div>
        <div className="space-y-2.5">
          <h3 className="text-lg font-bold leading-snug text-slate-900">
            {readerValueTitle}
          </h3>
          <p className="pl-1 sm:pl-1.5 text-[16px] leading-[1.7] text-slate-700">
            {readerValueText}
          </p>
        </div>

        <div className="my-4 border-t border-slate-200/75" />

        <div id="section-conclusion" className="space-y-2 mb-1">
          <h3 className="text-lg font-bold leading-snug text-slate-900">
            {conclusionTitle}
          </h3>
          <p className="pl-1 sm:pl-1.5 text-[16px] leading-[1.7] text-slate-600">
            {conclusionText}
          </p>
        </div>
      </div>
    </>
  );
}
