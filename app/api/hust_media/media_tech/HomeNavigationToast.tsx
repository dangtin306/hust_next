"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { LoaderCircle } from "lucide-react";

export function useHomeNavigationToast(timeoutMs = 15000) {
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNavigationLoading = useCallback((label: string) => {
    setPendingNavigation(label);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPendingNavigation(null), timeoutMs);
  }, [timeoutMs]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { pendingNavigation, showNavigationLoading };
}

export function handleHomeNavigationLink(
  event: MouseEvent<HTMLAnchorElement>,
  label: string,
  showNavigationLoading: (label: string) => void,
) {
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
  event.stopPropagation();
  showNavigationLoading(label);
}

export function HomeNavigationToast({ label }: { label: string | null }) {
  if (!label) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed left-1/2 top-4 z-[100] -translate-x-1/2"
    >
      <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur">
        <LoaderCircle className="h-4 w-4 animate-spin text-indigo-600" aria-hidden="true" />
        <span>Đang mở {label}...</span>
      </div>
    </div>
  );
}

export function NavigationToastLink({
  href,
  label,
  className,
  children,
  prefetch = false,
}: {
  href: Route;
  label: string;
  className: string;
  children: ReactNode;
  prefetch?: boolean;
}) {
  const { pendingNavigation, showNavigationLoading } = useHomeNavigationToast();

  return (
    <>
      <Link
        href={href}
        prefetch={prefetch}
        onClick={(event) => handleHomeNavigationLink(event, label, showNavigationLoading)}
        className={className}
      >
        {children}
      </Link>
      <HomeNavigationToast label={pendingNavigation} />
    </>
  );
}

export function NavigationToastAnchor({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className: string;
  children: ReactNode;
}) {
  const { pendingNavigation, showNavigationLoading } = useHomeNavigationToast();

  return (
    <>
      <a
        href={href}
        onClick={(event) => handleHomeNavigationLink(event, label, showNavigationLoading)}
        className={className}
      >
        {children}
      </a>
      <HomeNavigationToast label={pendingNavigation} />
    </>
  );
}
