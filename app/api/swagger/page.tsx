import type { Metadata } from "next";
import { readFile } from "fs/promises";
import path from "path";
import { parse } from "yaml";
import SwaggerClient from "./SwaggerClient";
import ServiceCategoryPanel, {
  type ServiceCategory,
} from "./ServiceCategoryPanel";

export const metadata: Metadata = {
  title: "OpenClaw API Swagger",
  description:
    "OpenClaw API is a test specification used to verify Swagger integration, URI rewrite, and API documentation rendering in the Hust Media Next.js application.",
};

const readOpenApiSpec = async () => {
  const filePath = path.join(process.cwd(), "app", "api", "swagger", "openclaw.yaml");
  const source = await readFile(filePath, "utf8");
  return parse(source) as Record<string, unknown>;
};

export default async function SwaggerPage() {
  const loadedSpec = await readOpenApiSpec();
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
  const serviceCategories = Object.entries(
    (loadedSpec["x-service-categories"] || {}) as Record<string, ServiceCategory>,
  );

  return (
    <main className="min-h-screen bg-transparent p-4 sm:p-6">
      <ServiceCategoryPanel categories={serviceCategories} />
      <SwaggerClient spec={spec} />
    </main>
  );
}
