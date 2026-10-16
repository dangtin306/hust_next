import type { Metadata } from "next";
import WorkspaceManagement from "../WorkspaceManagement";

export const metadata: Metadata = {
  title: "Danh mục Workspace | Media Tech",
  description: "Trang quản trị các workspace dự án, đường dẫn mã nguồn, mã định danh và trạng thái.",
};

export default function WorkspaceHomePage() {
  return <WorkspaceManagement initialTab="workspaces" />;
}
