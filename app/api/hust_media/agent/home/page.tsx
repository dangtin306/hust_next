import type { Metadata } from "next";
import AgentManagement from "../AgentManagement";

export const metadata: Metadata = {
  title: "Quản lý Agent | Hust Media",
  description: "Danh sách agent OpenClaw, workspace con và đường dẫn MCP của từng agent.",
};

export default function AgentHomePage() {
  return <AgentManagement />;
}
