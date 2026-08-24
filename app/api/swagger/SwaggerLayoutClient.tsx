"use client";

import { usePathname } from "next/navigation";
import ServiceCategoryPanel, { type ServiceCategory } from "./ServiceCategoryPanel";
import SwaggerClient from "./SwaggerClient";
import SwaggerSwitcher from "./SwaggerSwitcher";
import LaravelServicePanel from "./LaravelServicePanel";

type SwaggerLayoutClientProps = {
  children: React.ReactNode;
  spec: Record<string, unknown>;
  laravelSpec: Record<string, unknown>;
  categories: Array<[string, ServiceCategory]>;
};

export default function SwaggerLayoutClient({
  children,
  spec,
  laravelSpec,
  categories,
}: SwaggerLayoutClientProps) {
  const pathname = usePathname() || "";
  const isLaravel = pathname.endsWith("/api/swagger/laravel");

  return (
    <main className="min-h-screen bg-transparent p-4 sm:p-6">
      <SwaggerSwitcher active={isLaravel ? "laravel" : "openclaw"} />

      {isLaravel ? <LaravelServicePanel /> : <ServiceCategoryPanel categories={categories} />}
      <SwaggerClient spec={isLaravel ? laravelSpec : spec} />

      <div className={isLaravel ? "block" : "hidden"}>{children}</div>
    </main>
  );
}
