import type { Metadata } from "next";
import AgentManagement from "../AgentManagement";

export const metadata: Metadata = {
  title: "Quản lý Agent | Media Tech",
  description: "Danh sách mã agent được dùng trong workspace Media Tech và các workspace liên kết.",
};

export default function AgentHomePage() {
  return <AgentManagement />;
}
