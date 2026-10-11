"use client";

import { useEffect, useRef, useState } from "react";
import "swagger-ui-dist/swagger-ui.css";

type SwaggerClientProps = {
  spec: Record<string, unknown>;
  serverOnly?: boolean;
  hideEmptySpecNotice?: boolean;
  hideLoading?: boolean;
  className?: string;
  compact?: boolean;
  serverStorageKey?: string;
};

export const OPENCLAW_SERVER_URL_STORAGE_KEY = "openclaw_main_swagger_server_url_v2";
const SERVER_URL_STORAGE_KEY = "openclaw_swagger_server_url";
const SERVER_URL_TTL_MS = 12 * 60 * 60 * 1000;
const SERVER_URL_CHANGE_EVENT = "swagger-server-url-change";

const getInitialServerUrl = (spec: Record<string, unknown>) => {
  const servers = spec.servers;
  if (!Array.isArray(servers)) return "";
  const firstServer = servers[0];
  if (typeof firstServer !== "object" || firstServer === null) return "";
  const url = (firstServer as Record<string, unknown>).url;
  return typeof url === "string" ? url : "";
};

export default function SwaggerClient({
  spec,
  serverOnly = false,
  hideEmptySpecNotice = false,
  hideLoading = false,
  className = "",
  compact = false,
  serverStorageKey = SERVER_URL_STORAGE_KEY,
}: SwaggerClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultServerUrl = getInitialServerUrl(spec);
  const [serverUrl, setServerUrl] = useState(defaultServerUrl);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    containerRef.current?.classList.toggle("swagger-ui-server-only", serverOnly);
  }, [serverOnly, isReady]);

  useEffect(() => {
    const rawSavedServer = window.localStorage.getItem(serverStorageKey);
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
        window.localStorage.removeItem(serverStorageKey);
      }
    } catch {
      window.localStorage.removeItem(serverStorageKey);
    }

    const nextServerUrl = savedServerUrl
      ? savedServerUrl.replace(/\/$/, "")
      : defaultServerUrl;

    if (nextServerUrl !== serverUrl) {
      setIsReady(false);
      setServerUrl(nextServerUrl);
    }
  }, [defaultServerUrl, serverStorageKey, serverUrl]);

  useEffect(() => {
    const handleServerUrlChange = (event: Event) => {
      const detail = (event as CustomEvent<{ key?: string; url?: string }>).detail;
      if (detail?.key !== serverStorageKey || typeof detail.url !== "string") return;
      const nextUrl = detail.url.trim().replace(/\/$/, "");
      if (!nextUrl) return;
      setIsReady(false);
      setServerUrl(nextUrl);
    };

    window.addEventListener(SERVER_URL_CHANGE_EVENT, handleServerUrlChange);
    return () => window.removeEventListener(SERVER_URL_CHANGE_EVENT, handleServerUrlChange);
  }, [serverStorageKey]);

  useEffect(() => {
    let disposed = false;
    let ui: { destroy?: () => void; preauthorizeApiKey?: (key: string, value: string) => void } | undefined;

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
      const activeSpec: Record<string, unknown> = {
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
        persistAuthorization: true,
        tryItOutEnabled: true,
        displayRequestDuration: true,
        onComplete: () => {
          if (spec.components && typeof spec.components === "object") {
            ui?.preauthorizeApiKey?.("BearerAuth", "media_tech");
          }
        },
      });

      const installApiUrlEditor = (serverControls: Element | null) => {
        if (!(serverControls instanceof HTMLElement)) return;
        if (serverControls.querySelector(".openclaw-api-url-editor")) return;

        serverControls.style.position = "relative";
        serverControls.style.zIndex = "1000";
        serverControls.style.overflow = "visible";
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
        editor.style.zIndex = "1001";
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
        popover.style.zIndex = "1002";
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
        input.placeholder = "http://127.0.0.1:8818";
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
          const currentUrl = serverUrl.trim().replace(/\/$/, "");
          if (nextUrl === currentUrl) {
            popover.hidden = true;
            return;
          }
          window.localStorage.setItem(
            serverStorageKey,
            JSON.stringify({ url: nextUrl, savedAt: Date.now() }),
          );
          window.dispatchEvent(
            new CustomEvent(SERVER_URL_CHANGE_EVENT, {
              detail: { key: serverStorageKey, url: nextUrl },
            }),
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
        const swaggerRoot = containerRef.current?.querySelector<HTMLElement>(".swagger-ui");
        const serverControls = swaggerRoot?.querySelector(".scheme-container");

        if (compact && swaggerRoot) {
          swaggerRoot.style.setProperty("width", "100%", "important");
          swaggerRoot.style.setProperty("margin", "0", "important");
          swaggerRoot.style.setProperty("padding", "0", "important");
          swaggerRoot.querySelectorAll<HTMLElement>(".wrapper, .opblock-tag-section, .no-margin").forEach((element) => {
            element.style.setProperty("max-width", "none", "important");
            element.style.setProperty("margin", "0", "important");
            element.style.setProperty("padding", "0", "important");
          });
          [".information-container", ".scheme-container", ".models", ".opblock-tag"].forEach((selector) => {
            swaggerRoot.querySelectorAll<HTMLElement>(selector).forEach((el) => {
              el.style.setProperty("display", "none", "important");
            });
          });
        }

        if (swaggerRoot && serverControls && swaggerRoot.firstElementChild !== serverControls) {
          swaggerRoot.prepend(serverControls);
        }
        installApiUrlEditor(serverControls ?? null);

        if (hideEmptySpecNotice && swaggerRoot) {
          const hideNotice = () => {
            const elements = swaggerRoot.querySelectorAll<HTMLElement>("*");
            elements.forEach((element) => {
              if (
                element.children.length === 0 &&
                element.textContent?.includes("No operations defined in spec!")
              ) {
                element.hidden = true;
                element.style.display = "none";
              }
            });
          };

          hideNotice();
          window.requestAnimationFrame(hideNotice);
        }

      };

      moveServerControlsToTop();
      const observer = new MutationObserver(moveServerControlsToTop);
      if (containerRef.current) {
        observer.observe(containerRef.current, { childList: true, subtree: true });
      }

      const handleTagClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;

        const isTagText = Boolean(target.closest(".opblock-tag a, .opblock-tag small"));
        const isSummaryTextBox = Boolean(
          target.closest(".opblock-summary-method, .opblock-summary-path, .opblock-summary-description")
        );

        if (isTagText || isSummaryTextBox) {
          event.stopPropagation();
          event.stopImmediatePropagation();
          if (target.closest("a")) {
            event.preventDefault();
          }
        }
      };

      const handleMouseDown = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;
        const link = target.closest<HTMLElement>("a");
        if (link) {
          link.setAttribute("draggable", "false");
        }
      };

      const container = containerRef.current;
      container?.addEventListener("click", handleTagClick, true);
      container?.addEventListener("mousedown", handleMouseDown, true);
      document.addEventListener("click", handleTagClick, true);
      document.addEventListener("mousedown", handleMouseDown, true);

      const originalDestroy = ui?.destroy;
      if (ui) {
        ui.destroy = () => {
          container?.removeEventListener("click", handleTagClick, true);
          container?.removeEventListener("mousedown", handleMouseDown, true);
          document.removeEventListener("click", handleTagClick, true);
          document.removeEventListener("mousedown", handleMouseDown, true);
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
  }, [compact, hideEmptySpecNotice, serverStorageKey, serverUrl, spec]);

  return (
    <>
      <div
        ref={containerRef}
        className={`${isReady ? "" : "hidden"} ${serverOnly ? "swagger-ui-server-only" : ""} ${className}`}
      />
      {!isReady && !hideLoading ? (
        <div className="rounded-3xl border border-slate-200/70 bg-white/85 px-4 py-20 shadow-2xl ring-1 ring-black/5 backdrop-blur-md">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
        </div>
      ) : null}
    </>
  );
}
