"use client";

import { useEffect, useRef, useState } from "react";
import "swagger-ui-dist/swagger-ui.css";

type SwaggerClientProps = {
  spec: Record<string, unknown>;
  serverOnly?: boolean;
};

const SERVER_URL_STORAGE_KEY = "openclaw_swagger_server_url";
const SERVER_URL_TTL_MS = 12 * 60 * 60 * 1000;

const getInitialServerUrl = (spec: Record<string, unknown>) => {
  const servers = spec.servers;
  if (!Array.isArray(servers)) return "";
  const firstServer = servers[0];
  if (typeof firstServer !== "object" || firstServer === null) return "";
  const url = (firstServer as Record<string, unknown>).url;
  return typeof url === "string" ? url : "";
};

export default function SwaggerClient({ spec, serverOnly = false }: SwaggerClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [serverUrl, setServerUrl] = useState(() => getInitialServerUrl(spec));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    containerRef.current?.classList.toggle("swagger-ui-server-only", serverOnly);
  }, [serverOnly, isReady]);

  useEffect(() => {
    const rawSavedServer = window.localStorage.getItem(SERVER_URL_STORAGE_KEY);
    let savedServerUrl = "";

    try {
      const savedServer = rawSavedServer ? JSON.parse(rawSavedServer) : null;
      const isValid =
        savedServer &&
        typeof savedServer.url === "string" &&
        typeof savedServer.savedAt === "number" &&
        Date.now() - savedServer.savedAt < SERVER_URL_TTL_MS;

      if (isValid) {
        savedServerUrl = savedServer.url.trim();
      } else if (rawSavedServer) {
        window.localStorage.removeItem(SERVER_URL_STORAGE_KEY);
      }
    } catch {
      window.localStorage.removeItem(SERVER_URL_STORAGE_KEY);
    }

    if (savedServerUrl && savedServerUrl !== serverUrl) {
      setIsReady(false);
      setServerUrl(savedServerUrl.replace(/\/$/, ""));
    }
  }, [serverUrl]);

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

      containerRef.current.replaceChildren();
      const activeSpec = {
        ...spec,
        servers: [
          {
            url: serverUrl,
            description: "Configured OpenClaw Codex gateway",
          },
        ],
      };

      ui = SwaggerUIBundle({
        domNode: containerRef.current,
        spec: activeSpec,
        deepLinking: true,
        layout: "BaseLayout",
      });

      const installApiUrlEditor = (serverControls: Element | null) => {
        if (!(serverControls instanceof HTMLElement)) return;
        if (serverControls.querySelector(".openclaw-api-url-editor")) return;

        serverControls.style.position = "relative";
        serverControls.style.display = "flex";
        serverControls.style.alignItems = "flex-end";
        serverControls.style.justifyContent = "space-between";
        serverControls.style.gap = "24px";
        serverControls.style.boxSizing = "border-box";
        serverControls.style.width = "100%";
        serverControls.style.paddingRight = "28px";

        const editor = document.createElement("div");
        editor.className = "openclaw-api-url-editor";
        editor.style.position = "relative";
        editor.style.flexShrink = "0";
        editor.style.marginRight = "4px";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn authorize__btn";
        button.textContent = "Edit API URL";

        const popover = document.createElement("div");
        popover.hidden = true;
        popover.style.position = "absolute";
        popover.style.right = "0";
        popover.style.top = "calc(100% + 8px)";
        popover.style.zIndex = "20";
        popover.style.width = "360px";
        popover.style.padding = "16px";
        popover.style.background = "#fff";
        popover.style.border = "1px solid #d8dee9";
        popover.style.borderRadius = "4px";
        popover.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.16)";

        const label = document.createElement("label");
        label.textContent = "API URL";
        label.style.display = "block";
        label.style.fontWeight = "600";
        label.style.marginBottom = "8px";

        const input = document.createElement("input");
        input.type = "url";
        input.value = serverUrl;
        input.placeholder = "http://127.0.0.1:8006";
        input.style.width = "100%";
        input.style.padding = "8px 10px";
        input.style.border = "1px solid #aaa";
        input.style.borderRadius = "3px";
        input.style.fontFamily = "monospace";

        const applyButton = document.createElement("button");
        applyButton.type = "button";
        applyButton.className = "btn authorize__btn";
        applyButton.textContent = "Apply";
        applyButton.style.marginTop = "10px";

        const apply = () => {
          const nextUrl = input.value.trim().replace(/\/$/, "");
          if (!nextUrl) return;
          window.localStorage.setItem(
            SERVER_URL_STORAGE_KEY,
            JSON.stringify({ url: nextUrl, savedAt: Date.now() }),
          );
          popover.hidden = true;
          setIsReady(false);
          setServerUrl(nextUrl);
        };

        button.addEventListener("click", () => {
          popover.hidden = !popover.hidden;
          if (!popover.hidden) input.focus();
        });
        applyButton.addEventListener("click", apply);
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") apply();
        });

        label.appendChild(input);
        popover.append(label, applyButton);
        editor.append(button, popover);
        serverControls.appendChild(editor);
      };

      const moveServerControlsToTop = () => {
        const swaggerRoot = containerRef.current?.querySelector(".swagger-ui");
        const serverControls = swaggerRoot?.querySelector(".scheme-container");

        if (swaggerRoot && serverControls && swaggerRoot.firstElementChild !== serverControls) {
          swaggerRoot.prepend(serverControls);
        }
        installApiUrlEditor(serverControls);
      };

      moveServerControlsToTop();
      const observer = new MutationObserver(moveServerControlsToTop);
      if (containerRef.current) {
        observer.observe(containerRef.current, { childList: true, subtree: true });
      }

      const originalDestroy = ui?.destroy;
      if (ui) {
        ui.destroy = () => {
          observer.disconnect();
          originalDestroy?.();
        };
      }
      setIsReady(true);
    };

    void loadSwagger().catch((error: unknown) => {
      if (disposed || !containerRef.current) return;
      containerRef.current.textContent =
        error instanceof Error ? error.message : "Unable to load Swagger UI";
      setIsReady(true);
    });

    return () => {
      disposed = true;
      ui?.destroy?.();
    };
  }, [serverUrl, spec]);

  return (
    <>
      <div
        ref={containerRef}
        className={`${isReady ? "" : "hidden"} ${serverOnly ? "swagger-ui-server-only" : ""}`}
      />
      {!isReady ? (
        <div className="rounded-3xl border border-slate-200/70 bg-white/85 px-4 py-20 shadow-2xl ring-1 ring-black/5 backdrop-blur-md">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
        </div>
      ) : null}
    </>
  );
}
