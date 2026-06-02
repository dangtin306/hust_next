"use client";

import { useEffect, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";

type DocsCodeBlockProps = {
  children: ReactNode;
  className?: string;
  code: string;
  language?: string;
  isSingleLine: boolean;
} & Omit<ComponentPropsWithoutRef<"pre">, "children">;

const formatLanguageLabel = (language: string) => language.replace(/[-_]/g, " ").toUpperCase();

export default function DocsCodeBlock({
  children,
  className,
  code,
  language,
  isSingleLine,
  ...props
}: DocsCodeBlockProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const nonEmptyLines = code
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const isCompactLanguage = language === "flow";
  const isCompactBlock =
    !isSingleLine && nonEmptyLines.length > 0 && (isCompactLanguage || nonEmptyLines.length <= 6);

  useEffect(() => {
    if (copyState !== "copied") return;
    const timeout = window.setTimeout(() => setCopyState("idle"), 1600);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  if (!language) {
    return (
      <pre
        {...props}
        className={[
          className,
          "max-h-[280px] overflow-y-auto rounded-lg border border-slate-300/80 bg-white/70 text-[12px] leading-5 text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.05)] [&>code]:m-0 [&>code]:block [&>code]:pt-0 [&>code]:pb-1 [&>code]:px-0",
          isSingleLine ? "!py-0.5" : "!py-1",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </pre>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("idle");
    }
  };

  return (
    <div className="mx-4 my-2.5 overflow-hidden rounded-xl border border-slate-300/80 bg-white/70 text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
      <div
        className={[
          "flex items-center justify-between gap-3 border-b border-slate-300/80 px-[9px]",
          isCompactBlock ? "py-0.5 min-h-8" : "py-1 min-h-9",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {formatLanguageLabel(language)}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <span>{copyState === "copied" ? "Copied" : "Copy"}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M9 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V9Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>
      <pre
        {...props}
        className={[
          className,
          "m-0 overflow-y-auto bg-transparent px-[6px] text-[12.5px] text-slate-900 [&>code]:m-0 [&>code]:block [&>code]:pt-0 [&>code]:pb-1.5 [&>code]:px-0",
          isCompactBlock ? "max-h-[170px] leading-[1.5] !pt-0 !pb-0.5" : "max-h-[240px] leading-[1.45]",
          isSingleLine ? "!py-0.5" : isCompactBlock ? "!pt-0 !pb-0.5" : "!py-0.5",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </pre>
    </div>
  );
}
