import type { Metadata } from "next";
import N8nWorkflowMain from "./main";
import ChatBotSwitcher from "@/app/shop/ai/workflow/ChatBotSwitcher";

export const metadata: Metadata = {
  title: "Laravel n8n Workflow | Hust AI Assistant",
  description: "Sơ đồ realtime giám sát hoạt động Laravel & n8n workflow - Hust Media",
};

export default function LaravelWorkflowPage() {
  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-transparent p-4 sm:p-6">
      <ChatBotSwitcher active="laravel" />
      <N8nWorkflowMain />
    </main>
  );
}
