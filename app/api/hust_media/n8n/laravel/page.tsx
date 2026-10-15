import type { Metadata } from "next";
import N8nWorkflowMain from "@/app/api/hust_media/workflow/laravel/main";

export const metadata: Metadata = {
  title: "Laravel n8n Workflow | Hust Media",
  description: "Sơ đồ realtime giám sát hoạt động Laravel & n8n workflow - Hust Media",
};

export default function LaravelWorkflowRealtimePage() {
  return <N8nWorkflowMain />;
}
