import type { Metadata } from "next";
import N8nWorkflowMain from "./main";

export const metadata: Metadata = {
  title: "Node.js & OpenClaw Realtime Diagram",
  description:
    "Sơ đồ realtime giám sát hoạt động Node backend SSE và n8n workflow (node_md.hust.media).",
};

export default function N8nRealtimePage() {
  return <N8nWorkflowMain />;
}
