import type { Metadata } from "next";
import N8nWorkflowMain from "./main";
import SwaggerSwitcher from "@/app/api/hust_media/media_tech/SwaggerSwitcher";

export const metadata: Metadata = {
  title: "Laravel n8n Workflow | Hust AI Assistant",
  description: "Sơ đồ realtime giám sát hoạt động Laravel & n8n workflow - Hust Media",
};

export default function LaravelWorkflowPage() {
  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-transparent p-4 sm:p-6">
      <SwaggerSwitcher active="workflow" />
      <N8nWorkflowMain />
    </main>
  );
}
