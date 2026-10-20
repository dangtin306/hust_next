"use client";

import { useEffect, useRef, useState } from "react";
import "swagger-ui-dist/swagger-ui.css";
import {
  CHAT_BOT_API_CHANGE_EVENT,
  getChatBotApiConfig,
  hasChatBotApiConfigCookie,
  type ChatBotApiConfig,
} from "@/app/api/media_tech/config/chatBotApiConfig";

type SwaggerClientProps = {
  spec: Record<string, unknown>;
  serverOnly?: boolean;
  hideEmptySpecNotice?: boolean;
  hideLoading?: boolean;
  className?: string;
  compact?: boolean;
  serverStorageKey?: string;
  isHust?: boolean;
};

export const OPENCLAW_SERVER_URL_STORAGE_KEY = "hust_openclaw_server_url_v2";
const SERVER_URL_STORAGE_KEY = "hust_swagger_server_url";
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
  isHust = true,
}: SwaggerClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultServerUrl = getInitialServerUrl(spec);
  const [serverUrl, setServerUrl] = useState(defaultServerUrl);
  const [isReady, setIsReady] = useState(false);

  const isHustMode =
    isHust ||
    (typeof window !== "undefined" && window.location.pathname.includes("/hust"));

  const isLaravelKey = Boolean(
    serverStorageKey &&
      (/laravel/i.test(serverStorageKey) ||
        serverStorageKey === "hust_laravel_server_url_v1" ||
        serverStorageKey === "laravel_swagger_server_url_v2")
  );

  const isOpenClawKey = Boolean(
    serverStorageKey &&
      (/openclaw/i.test(serverStorageKey) ||
        serverStorageKey === OPENCLAW_SERVER_URL_STORAGE_KEY ||
        serverStorageKey === SERVER_URL_STORAGE_KEY)
  );

  useEffect(() => {
    containerRef.current?.classList.toggle("swagger-ui-server-only", serverOnly);
  }, [serverOnly, isReady]);

  // Load server URL prioritizing the centralized url_api_chat_bot cookie
  useEffect(() => {
    // 1. Kiểm tra cookie url_api_chat_bot trước
    if (typeof document !== "undefined" && hasChatBotApiConfigCookie()) {
      const activeConfig = getChatBotApiConfig(isHustMode);
      const targetFromCookie = isLaravelKey
        ? activeConfig.backend_laravel
        : isOpenClawKey
        ? activeConfig.backend_node
        : "";

      if (targetFromCookie) {
        const cleanCookieUrl = targetFromCookie.trim().replace(/\/$/, "");
        if (cleanCookieUrl && cleanCookieUrl !== serverUrl) {
          setIsReady(false);
          setServerUrl(cleanCookieUrl);
          return;
        }
      }
    }

    // 2. Fallback sang localStorage nếu chưa có cookie
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
  }, [
    defaultServerUrl,
    isHustMode,
    isLaravelKey,
    isOpenClawKey,
    serverStorageKey,
    serverUrl,
  ]);

  // Lắng nghe sự kiện đổi cấu hình API tập trung từ Home (url-api-chat-bot-change)
  useEffect(() => {
    const handleGlobalConfigChange = (event: Event) => {
      const detail = (event as CustomEvent<ChatBotApiConfig | null>).detail;
      if (!detail) return;
      const nextUrl = isLaravelKey
        ? detail.backend_laravel?.trim().replace(/\/$/, "")
        : isOpenClawKey
        ? detail.backend_node?.trim().replace(/\/$/, "")
        : "";

      if (nextUrl && nextUrl !== serverUrl) {
        setIsReady(false);
        setServerUrl(nextUrl);
      }
    };

    window.addEventListener(
      CHAT_BOT_API_CHANGE_EVENT,
      handleGlobalConfigChange
    );
    return () =>
      window.removeEventListener(
        CHAT_BOT_API_CHANGE_EVENT,
        handleGlobalConfigChange
      );
  }, [isLaravelKey, isOpenClawKey, serverUrl]);

  // Hỗ trợ sự kiện cũ nếu còn phát sinh
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
    return () =>
      window.removeEventListener(SERVER_URL_CHANGE_EVENT, handleServerUrlChange);
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
            description: "Configured API Gateway (Hust Media)",
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
            ui?.preauthorizeApiKey?.("BearerAuth", "hust_media");
          }
        },
      });

      // Hiển thị huy hiệu liên kết điều chỉnh server tại Home (thay cho popover sửa cục bộ)
      const installServerHomeBadge = (serverControls: Element | null) => {
        if (!(serverControls instanceof HTMLElement)) return;
        if (serverControls.querySelector(".swagger-server-home-link")) return;

        serverControls.style.position = "relative";
        serverControls.style.display = "flex";
        serverControls.style.alignItems = "center";
        serverControls.style.justifyContent = "space-between";
        serverControls.style.gap = "16px";
        serverControls.style.boxSizing = "border-box";
        serverControls.style.width = "100%";
        serverControls.style.paddingRight = "16px";

        const badgeWrapper = document.createElement("div");
        badgeWrapper.className = "swagger-server-home-link";
        badgeWrapper.style.display = "flex";
        badgeWrapper.style.alignItems = "center";
        badgeWrapper.style.gap = "8px";
        badgeWrapper.style.flexShrink = "0";

        const homeLink = document.createElement("a");
        homeLink.href = "/next/api/hust/home";
        homeLink.innerHTML = "⚙️ Đổi server tại Home";
        homeLink.title =
          "Cấu hình máy chủ chung qua cookie url_api_chat_bot tại Trang chủ";
        homeLink.style.display = "inline-flex";
        homeLink.style.alignItems = "center";
        homeLink.style.gap = "4px";
        homeLink.style.padding = "5px 12px";
        homeLink.style.fontSize = "12px";
        homeLink.style.fontWeight = "600";
        homeLink.style.color = "#1d4ed8";
        homeLink.style.backgroundColor = "#eff6ff";
        homeLink.style.border = "1px solid #bfdbfe";
        homeLink.style.borderRadius = "8px";
        homeLink.style.textDecoration = "none";
        homeLink.style.cursor = "pointer";
        homeLink.style.transition = "all 0.15s ease";

        homeLink.onmouseenter = () => {
          homeLink.style.backgroundColor = "#dbeafe";
        };
        homeLink.onmouseleave = () => {
          homeLink.style.backgroundColor = "#eff6ff";
        };

        badgeWrapper.appendChild(homeLink);
        serverControls.appendChild(badgeWrapper);
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
        installServerHomeBadge(serverControls ?? null);

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
  }, [compact, hideEmptySpecNotice, isHustMode, serverStorageKey, serverUrl, spec]);

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
