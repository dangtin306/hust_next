import type { Metadata } from "next";
import WorkspaceManagement from "./WorkspaceManagement";

export const metadata: Metadata = {
  title: "Quản trị Workspace | Hust Media",
  description: "Trang quản trị các workspace dự án, đường dẫn mã nguồn, mã định danh và trạng thái.",
};

export default function WorkspacePage() {
  return <WorkspaceManagement />;
}
