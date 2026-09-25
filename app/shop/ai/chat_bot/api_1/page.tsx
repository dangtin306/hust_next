import type { Metadata } from "next";
import SwaggerEmbedClient from "./SwaggerEmbedClient";
import ChatBotSwitcher from "@/app/shop/ai/workflow/ChatBotSwitcher";

export const metadata: Metadata = {
  title: "OpenClaw API Swagger & Test | Hust AI Assistant",
  description:
    "Tài liệu Swagger nhúng chính thức và giao diện test API trực tiếp cho OpenClaw Production API - Hust Media.",
};

export default function ChatBotApiPage() {
  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-transparent p-4 sm:p-6">
      <ChatBotSwitcher active="api_1" />
      <SwaggerEmbedClient />
    </main>
  );
}
