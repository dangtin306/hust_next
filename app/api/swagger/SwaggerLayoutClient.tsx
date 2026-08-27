"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import ServiceCategoryPanel, { type ServiceCategory } from "./openclaw/ServiceCategoryPanel";
import SwaggerClient from "./SwaggerClient";
import SwaggerSwitcher from "./SwaggerSwitcher";
import LaravelServicePanel from "./laravel/LaravelServicePanel";
import ConversationResponseOperation from "./openclaw/ConversationResponseOperation";
import SecondResponseOperation from "./openclaw/SecondResponseOperation";

type SwaggerLayoutClientProps = {
  children: React.ReactNode;
  spec: Record<string, unknown>;
  laravelSpec: Record<string, unknown>;
  homeSpec: Record<string, unknown>;
  categories: Array<[string, ServiceCategory]>;
};

export default function SwaggerLayoutClient({
  children,
  spec,
  laravelSpec,
  homeSpec,
  categories,
}: SwaggerLayoutClientProps) {
  const pathname = usePathname() || "";
  const isHome = pathname.endsWith("/api/swagger/home");
  const isLaravel = pathname.endsWith("/api/swagger/laravel");

  useEffect(() => {
    const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    resetScroll();
    const firstFrame = window.requestAnimationFrame(resetScroll);
    const timer = window.setTimeout(resetScroll, 120);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.clearTimeout(timer);
    };
  }, [isLaravel]);

  return (
    <main className="min-h-screen bg-transparent p-4 sm:p-6">
      <SwaggerSwitcher active={isHome ? "home" : isLaravel ? "laravel" : "openclaw"} />

      {isHome ? (
        <>
          <SwaggerClient spec={homeSpec} hideEmptySpecNotice hideLoading />
          <div className="mx-auto max-w-[1480px] px-4 pb-10 pt-8 sm:px-8">{children}</div>
        </>
      ) : (
        <>
          {isLaravel ? <LaravelServicePanel /> : <ServiceCategoryPanel categories={categories} />}
          <SwaggerClient spec={isLaravel ? laravelSpec : spec} />
          {!isLaravel ? (
            <>
              <ConversationResponseOperation />
              <SecondResponseOperation />
            </>
          ) : null}
          <div className={isLaravel ? "block" : "hidden"}>{children}</div>
        </>
      )}
    </main>
  );
}
