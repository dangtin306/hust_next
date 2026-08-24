"use client";

import { useEffect, useRef } from "react";
import "swagger-ui-dist/swagger-ui.css";

type SwaggerClientProps = {
  spec: Record<string, unknown>;
};

export default function SwaggerClient({ spec }: SwaggerClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let ui: { destroy?: () => void } | undefined;

    const loadSwagger = async () => {
      const swaggerModule = await import("swagger-ui-dist");
      const moduleWithDefault = swaggerModule as typeof swaggerModule & {
        default?: { SwaggerUIBundle?: typeof swaggerModule.SwaggerUIBundle };
      };
      const SwaggerUIBundle =
        swaggerModule.SwaggerUIBundle || moduleWithDefault.default?.SwaggerUIBundle;

      if (typeof SwaggerUIBundle !== "function") {
        throw new Error("SwaggerUIBundle export was not found");
      }

      if (disposed || !containerRef.current) return;

      ui = SwaggerUIBundle({
        domNode: containerRef.current,
        spec,
        deepLinking: true,
        layout: "BaseLayout",
      });
    };

    void loadSwagger().catch((error: unknown) => {
      if (disposed || !containerRef.current) return;
      containerRef.current.textContent =
        error instanceof Error ? error.message : "Unable to load Swagger UI";
    });

    return () => {
      disposed = true;
      ui?.destroy?.();
    };
  }, []);

  return <div ref={containerRef} />;
}
