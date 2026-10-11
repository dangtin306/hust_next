import type { Metadata } from "next";
import N8nWorkflowMain from "./main";

export const metadata: Metadata = {
  title: "Node.js Realtime Diagram | Hust Media",
  description:
    "Sơ đồ realtime giám sát hoạt động Node.js backend, SSE và workflow n8n.",
};

export default function NodeJsRealtimePage() {
  return <N8nWorkflowMain />;
}
