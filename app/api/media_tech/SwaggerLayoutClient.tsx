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
  homeSpec,
  categories,
}: SwaggerLayoutClientProps) {
  const pathname = usePathname() || "";
  const isHeyGen = pathname.includes("/heygen");
  const isWorkspace = pathname.includes("/workspace");
  const isN8n = pathname.includes("/n8n") || pathname.includes("/maps_main");
  const isApiListHome = pathname.includes("/list/home") || pathname.endsWith("/list");
  const isHome =
    !isHeyGen &&
    !isWorkspace &&
    !isN8n &&
    !isApiListHome &&
    (pathname.includes("/home") || pathname.includes("/dashboard"));
  const isLaravel = pathname.includes("/laravel") && !pathname.includes("/n8n");
  const isOpenClaw = pathname.includes("/openclaw");
  const isGitAuto = pathname.includes("/git_auto");
  const isGitTest = pathname.includes("/git_test");
  const isGiteaTest = pathname.includes("/gitea_test");
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
          : isGitAuto || isGitTest
            ? "min-h-screen px-1 py-4 sm:px-6 sm:py-6"
            : "min-h-screen w-full max-w-[1840px] mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3.5"
      }`}
    >
      <SwaggerSwitcher
        className={isChatTest ? "mb-1.5 flex-none" : "mb-2.5"}
        active={
          isHome
            ? "home"
            : isApiListHome
              ? "api_list"
              : isLaravel
                ? "laravel"
                : isN8n
                  ? "n8n"
                  : isWorkspace
                    ? "workspace"
                  : isGitAuto
                    ? "git_auto"
                    : isGitTest
                      ? "git_test"
                    : isGiteaTest
                      ? "gitea_test"
                    : isChatPublic
                      ? "chat_public"
                      : isHeyGen
                        ? "heygen"
                        : isChatTest
                          ? "chat_test"
                          : isOpenClaw
                            ? "openclaw"
                            : "api_list"
        }
      />

      {isHeyGen ? (
        <div className="w-full min-w-0">{children}</div>
      ) : isChatTest ? (
        <div className="w-full min-w-0 flex-1 min-h-0 flex flex-col px-0 pt-0 pb-0 overflow-hidden [&_.media-chat-root]:h-full [&_.media-chat-root]:max-h-full">
          {children}
        </div>
      ) : isGitAuto || isGitTest || isGiteaTest || isN8n || isWorkspace || isChatPublic || isApiListHome ? (
        <div className="w-full min-w-0 px-0 pb-10 pt-3">{children}</div>
      ) : isHome ? (
        <>
          <SwaggerClient spec={homeSpec} hideEmptySpecNotice hideLoading />
          <div className="mx-auto max-w-[1480px] px-4 pb-10 pt-8 sm:px-8">
            {children}
          </div>
        </>
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
                ? "laravel_swagger_server_url_v2"
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
