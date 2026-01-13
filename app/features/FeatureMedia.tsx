"use client";

import { useEffect, useMemo, useState } from "react";

type FeatureMediaProps = {
  src?: string;
  fallbackSrc?: string;
  alt: string;
  label?: string;
  contain?: boolean;
  priority?: boolean;
};

const BASE_PATH = "/next";

const isExternalUrl = (value: string) =>
  /^https?:\/\//i.test(value) || value.startsWith("data:");

const unique = (values: string[]) => Array.from(new Set(values));

const withoutBasePath = (value: string) => {
  if (value.startsWith(`${BASE_PATH}/`)) return value.slice(BASE_PATH.length);
  return value;
};

const toApiFallback = (value: string) => {
  if (!value) return "";
  if (isExternalUrl(value)) return "";
  if (value.startsWith("./") || value.startsWith("../")) return "";

  // For public assets, fall back to an API route that reads from `public/`.
  // Example: `/images/features/a.png` -> `/api/features-image/images/features/a.png`
  if (value.startsWith("/images/")) return `/api/features-image${value}`;
  if (value.startsWith(`${BASE_PATH}/images/`))
    return `/api/features-image${withoutBasePath(value)}`;
  return "";
};

export default function FeatureMedia({
  src,
  fallbackSrc,
  alt,
  label,
  contain = true,
  priority = false,
}: FeatureMediaProps) {
  const preferBasePath =
    typeof window !== "undefined" &&
    (window.location.pathname === BASE_PATH ||
      window.location.pathname.startsWith(`${BASE_PATH}/`));

  const buildCandidates = useMemo(() => {
    const build = (value?: string) => {
      if (!value) return [];
      if (isExternalUrl(value)) return [value];
      if (value.startsWith("./") || value.startsWith("../")) return [value];

      const candidates: string[] = [];

      if (value.startsWith("/")) {
        const withBasePath = value.startsWith(`${BASE_PATH}/`)
          ? value
          : `${BASE_PATH}${value}`;
        const without = value.startsWith(`${BASE_PATH}/`)
          ? withoutBasePath(value)
          : value;

        if (preferBasePath) {
          candidates.push(withBasePath, without);
        } else {
          candidates.push(without, withBasePath);
        }
      } else {
        candidates.push(value);
      }

      const apiFallback = toApiFallback(value);
      if (apiFallback) {
        candidates.push(apiFallback);
        candidates.push(`${BASE_PATH}${apiFallback}`);
      }

      if (!value.startsWith("/")) {
        candidates.push(`/${value}`);
        candidates.push(`${BASE_PATH}/${value}`);
      }

      return unique(candidates.filter(Boolean));
    };

    const primary = build(src);
    const fallback = build(fallbackSrc);
    return { primary, fallback };
  }, [src, fallbackSrc, preferBasePath]);

  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const [hasTried, setHasTried] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setResolvedSrc("");
    setHasTried(false);

    const tryLoad = (candidates: string[], onDone: (ok: boolean) => void) => {
      const tryIndex = (index: number) => {
        if (cancelled) return;
        if (index >= candidates.length) {
          onDone(false);
          return;
        }

        const candidate = candidates[index];
        const img = new Image();
        img.onload = () => {
          if (cancelled) return;
          setResolvedSrc(candidate);
          setHasTried(true);
          onDone(true);
        };
        img.onerror = () => {
          if (cancelled) return;
          tryIndex(index + 1);
        };
        img.src = candidate;
      };

      tryIndex(0);
    };

    const { primary, fallback } = buildCandidates;
    if (primary.length === 0 && fallback.length === 0) {
      setHasTried(true);
      return () => {
        cancelled = true;
      };
    }

    tryLoad(primary, (ok) => {
      if (cancelled) return;
      if (ok) return;
      tryLoad(fallback, () => {
        if (cancelled) return;
        setHasTried(true);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [buildCandidates]);

  const shouldRenderImage = Boolean(resolvedSrc);

  if (!shouldRenderImage) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 px-6 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            Image placeholder
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-900">{alt}</div>
          {label ? (
            <div className="mt-1 text-xs leading-relaxed text-slate-600">
              {label}
            </div>
          ) : hasTried ? null : (
            <div className="mt-1 text-xs leading-relaxed text-slate-600">
              Loading image…
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`absolute inset-0 h-full w-full ${
        contain ? "object-contain" : "object-cover"
      }`}
    />
  );
}
