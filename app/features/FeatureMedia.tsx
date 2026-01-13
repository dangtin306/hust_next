"use client";

import Image from "next/image";
import { useState } from "react";

type FeatureMediaProps = {
  src?: string;
  alt: string;
  label?: string;
  contain?: boolean;
  priority?: boolean;
};

export default function FeatureMedia({
  src,
  alt,
  label,
  contain = true,
  priority = false,
}: FeatureMediaProps) {
  const [hasError, setHasError] = useState(false);
  const shouldRenderImage = Boolean(src) && !hasError;

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
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src!}
      alt={alt}
      fill
      priority={priority}
      sizes="(min-width: 1024px) 45vw, 90vw"
      className={contain ? "object-contain" : "object-cover"}
      onError={() => setHasError(true)}
    />
  );
}

