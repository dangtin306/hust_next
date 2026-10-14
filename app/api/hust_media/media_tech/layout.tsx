import { readFile } from "fs/promises";
import path from "path";
import { parse } from "yaml";
import SwaggerLayoutClient from "./SwaggerLayoutClient";
import type { ServiceCategory } from "./openclaw/ServiceCategoryPanel";

const readOpenApiSpec = async (folder: string, filename: string) => {
  const filePath = path.join(process.cwd(), "app", "api", "hust_media", "media_tech", folder, filename);
  const source = await readFile(filePath, "utf8");
  return parse(source) as Record<string, unknown>;
};

let cachedSpecs: {
  loadedSpec: Record<string, unknown>;
  laravelSpec: Record<string, unknown>;
  homeSpec: Record<string, unknown>;
  categories: Array<[string, ServiceCategory]>;
} | null = null;

export default async function SwaggerLayout({ children }: { children: React.ReactNode }) {
  if (!cachedSpecs) {
    const loadedSpec = await readOpenApiSpec("openclaw", "openclaw.yaml");
    const laravelSpec = await readOpenApiSpec("laravel", "laravel.yaml");
    const homeSpec = await readOpenApiSpec("dashboard", "home.yaml");
    const categories = Object.entries(
      (loadedSpec["x-service-categories"] || {}) as Record<string, ServiceCategory>,
    );
    cachedSpecs = { loadedSpec, laravelSpec, homeSpec, categories };
  }

  return (
    <SwaggerLayoutClient
      spec={cachedSpecs.loadedSpec}
      laravelSpec={cachedSpecs.laravelSpec}
      homeSpec={cachedSpecs.homeSpec}
      categories={cachedSpecs.categories}
    >
      {children}
    </SwaggerLayoutClient>
  );
}
