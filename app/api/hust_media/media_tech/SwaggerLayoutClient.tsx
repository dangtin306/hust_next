"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import ServiceCategoryPanel, {
  type ServiceCategory,
} from "./openclaw/ServiceCategoryPanel";
import SwaggerClient, { OPENCLAW_SERVER_URL_STORAGE_KEY } from "./SwaggerClient";
import SwaggerSwitcher from "./SwaggerSwitcher";
import LaravelServicePanel from "./laravel/LaravelServicePanel";
import ConversationResponseOperation from "./openclaw/ConversationResponseOperation";
import SecondResponseOperation from "./openclaw/SecondResponseOperation";
import ModelSelectionOperation from "./openclaw/ModelSelectionOperation";
import CloneConversationOperation from "./openclaw/CloneConversationOperation";

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
  categories,
}: SwaggerLayoutClientProps) {
  const pathname = usePathname() || "";
  const isWorkspace = pathname.includes("/workspace");
  const isWorkflow =
    pathname.includes("/n8n") || pathname.includes("/workflow");
  const isApiListHome = pathname.includes("/list/home") || pathname.endsWith("/list");
  const isHome =
    !isWorkspace &&
    !isWorkflow &&
    !isApiListHome &&
    (pathname.includes("/home") || pathname.includes("/dashboard"));
  const isLaravel = pathname.includes("/laravel") && !pathname.includes("/n8n");
  const isOpenClaw = pathname.includes("/openclaw");
  const isChatPublic = pathname.includes("/chat_public");
  const isChatTest =
    pathname.includes("/chat_test") ||
    pathname.includes("/chat_bot") ||
    pathname.includes("/test_1");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <main
      className={`min-w-0 overflow-x-hidden bg-transparent ${
        isChatTest
          ? "h-[calc(100vh-48px)] h-[calc(100dvh-48px)] max-h-[calc(100dvh-48px)] flex flex-col p-1.5 pb-1 sm:px-3 sm:pt-1.5 sm:pb-1 overflow-hidden"
          : "min-h-screen w-full max-w-[1840px] mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3.5"
      }`}
    >
      <SwaggerSwitcher
        className={isChatTest ? "mb-1.5 flex-none" : "mb-2.5"}
        active={
          isWorkflow
            ? "workflow"
            : isWorkspace
              ? "workspace"
              : isApiListHome
                ? "api_list"
                : isLaravel
                  ? "laravel"
                  : isOpenClaw
                    ? "openclaw"
                    : isChatPublic
                      ? "chat_public"
                      : isChatTest
                        ? "chat_test"
                        : isHome
                          ? "home"
                          : "api_list"
        }
      />

      {isChatTest ? (
        <div className="w-full min-w-0 flex-1 min-h-0 flex flex-col px-0 pt-0 pb-0 overflow-hidden [&_.media-chat-root]:h-full [&_.media-chat-root]:max-h-full">
          {children}
        </div>
      ) : isChatPublic ? (
        <div className="w-full min-w-0 px-0 pb-10 pt-3">{children}</div>
      ) : isWorkflow ? (
        <div className="w-full min-w-0 px-0 pb-10 pt-3">{children}</div>
      ) : isWorkspace ? (
        <div className="w-full min-w-0 px-0 pb-10 pt-3">{children}</div>
      ) : isApiListHome || isHome ? (
        <div className="w-full min-w-0 px-0 pb-10 pt-3">{children}</div>
      ) : (
        <>
          {isLaravel ? (
            <LaravelServicePanel />
          ) : (
            <ServiceCategoryPanel categories={categories} />
          )}
          <SwaggerClient
            spec={isLaravel ? laravelSpec : spec}
            serverStorageKey={
              isLaravel
                ? "hust_laravel_server_url_v1"
                : isOpenClaw
                  ? OPENCLAW_SERVER_URL_STORAGE_KEY
                  : undefined
            }
          />
          {!isLaravel ? (
            <>
              <ConversationResponseOperation />
              <SecondResponseOperation />
              <ModelSelectionOperation />
              <CloneConversationOperation />
            </>
          ) : null}
          <div className={isLaravel ? "block" : "hidden"}>{children}</div>
        </>
      )}
    </main>
  );
}
