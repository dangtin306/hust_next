import type { Metadata } from "next";
import N8nWorkflowMain from "./main";

export const metadata: Metadata = {
  title: "Laravel n8n Workflow | Media Tech",
  description: "Sơ đồ realtime giám sát hoạt động Laravel & n8n workflow - Media Tech",
};

export default function LaravelWorkflowRealtimePage() {
  return <N8nWorkflowMain />;
}
