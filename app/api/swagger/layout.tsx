import { readFile } from "fs/promises";
import path from "path";
import { parse } from "yaml";
import SwaggerLayoutClient from "./SwaggerLayoutClient";
import type { ServiceCategory } from "./ServiceCategoryPanel";

const readOpenApiSpec = async (folder: string, filename: string) => {
  const filePath = path.join(process.cwd(), "app", "api", "swagger", folder, filename);
  const source = await readFile(filePath, "utf8");
  return parse(source) as Record<string, unknown>;
};

export default async function SwaggerLayout({ children }: { children: React.ReactNode }) {
  const loadedSpec = await readOpenApiSpec("openclaw", "openclaw.yaml");
  const laravelSpec = await readOpenApiSpec("laravel", "laravel.yaml");
  const swaggerServerUrl = process.env.NEXT_PUBLIC_SWAGGER_SERVER_URL;
  const spec = swaggerServerUrl
    ? {
        ...loadedSpec,
        servers: [
          {
            url: swaggerServerUrl,
            description: "Configured OpenClaw Codex gateway",
          },
        ],
      }
    : loadedSpec;
  const categories = Object.entries(
    (loadedSpec["x-service-categories"] || {}) as Record<string, ServiceCategory>,
  );

  return (
    <SwaggerLayoutClient
      spec={spec}
      laravelSpec={laravelSpec}
      categories={categories}
    >
      {children}
    </SwaggerLayoutClient>
  );
}
