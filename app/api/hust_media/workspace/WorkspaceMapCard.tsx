"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, LoaderCircle, Map as MapIcon } from "lucide-react";

export default function WorkspaceMapCard({ href }: { href: Route }) {
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!isNavigating) return;
    const timer = setTimeout(() => setIsNavigating(false), 15000);
    return () => clearTimeout(timer);
  }, [isNavigating]);

  return (
    <>
      <Link
        href={href}
        prefetch={false}
        onClick={(event) => {
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }
          setIsNavigating(true);
        }}
        aria-busy={isNavigating}
        className="group rounded-2xl border border-indigo-200 bg-white/90 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <MapIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            Workspace n8n
          </span>
        </div>

        <h2 className="mt-4 text-lg font-extrabold text-slate-900">4. Bản đồ Workspace n8n</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Xem sơ đồ workspace, cây tri thức Markdown OpenClaw và pipeline n8n thực thi.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700">
          <span>Mở bản đồ</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </div>
      </Link>

      {isNavigating && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed left-1/2 top-4 z-[100] -translate-x-1/2"
        >
          <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur">
            <LoaderCircle className="h-4 w-4 animate-spin text-indigo-600" />
            <span>Đang mở Workspace n8n...</span>
          </div>
        </div>
      )}
    </>
  );
}
