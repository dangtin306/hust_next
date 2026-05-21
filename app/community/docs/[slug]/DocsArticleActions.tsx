"use client";

import { useEffect, useState } from "react";

type DocsArticleActionsProps = {
  writtenDateLabel: string;
  writtenDateValue: string;
  title: string;
  description: string;
};

export default function DocsArticleActions({
  writtenDateLabel,
  writtenDateValue,
  title,
  description,
}: DocsArticleActionsProps) {
  const [isLiked, setIsLiked] = useState(false);

  const getArticleUriTail = () => {
    try {
      const path = String(window.location.pathname || "");
      const segments = path.split("/").filter(Boolean);
      return segments[segments.length - 1] || "";
    } catch {
      return "";
    }
  };

  const getLikeStorageKey = () => `liked_article_${getArticleUriTail()}`;

  useEffect(() => {
    try {
      setIsLiked(localStorage.getItem(getLikeStorageKey()) === "true");
    } catch {
      setIsLiked(false);
    }
  }, []);

  const handleToggleLike = () => {
    setIsLiked((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(getLikeStorageKey(), String(next));
      } catch {
        // no-op
      }
      return next;
    });
  };

  const handleShareButtonClick = async () => {
    try {
      await navigator.share({
        title,
        text: description,
        url: window.location.href,
      });
    } catch {
      // no-op
    }
  };

  return (
    <div className="mt-2 mb-2.5 flex w-full flex-wrap items-center justify-between gap-2.5 pt-3">
      <div className="inline-flex max-w-full items-center self-center rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-5 text-slate-500 sm:text-[13px]">
          <span className="font-medium text-slate-700">By Hust Media</span>{" "}
          <span className="text-slate-300">•</span>{" "}
          <span>{writtenDateLabel} {writtenDateValue}</span>
        </div>
      </div>
      <div className="ml-auto flex shrink-0 items-center self-center gap-2">
        <button
          type="button"
          onClick={handleToggleLike}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-[20px] leading-none shadow-sm transition ${
            isLiked
              ? "border-slate-300 bg-slate-100 text-slate-900"
              : "border-slate-300/90 bg-white text-slate-700 hover:bg-slate-50"
          }`}
          aria-label={isLiked ? "Unlike article" : "Like article"}
          title={isLiked ? "Unlike" : "Like"}
        >
          {isLiked ? "♥" : "♡"}
        </button>
        <button
          type="button"
          onClick={handleShareButtonClick}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
        >
          Share
        </button>
      </div>
    </div>
  );
}
