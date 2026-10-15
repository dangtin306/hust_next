import { cache } from "react";
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

const getSpecs = cache(async () => {
  const loadedSpec = await readOpenApiSpec("openclaw", "openclaw.yaml");
  const laravelSpec = await readOpenApiSpec("laravel", "laravel.yaml");
  const homeSpec = await readOpenApiSpec("dashboard", "home.yaml");
  const categories = Object.entries(
    (loadedSpec["x-service-categories"] || {}) as Record<string, ServiceCategory>,
  );
  return { loadedSpec, laravelSpec, homeSpec, categories };
});

export default async function SwaggerLayout({ children }: { children: React.ReactNode }) {
  const { loadedSpec, laravelSpec, homeSpec, categories } = await getSpecs();

  return (
    <SwaggerLayoutClient
      spec={loadedSpec}
      laravelSpec={laravelSpec}
      homeSpec={homeSpec}
      categories={categories}
    >
      {children}
    </SwaggerLayoutClient>
  );
}
