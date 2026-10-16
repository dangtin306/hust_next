import type { Metadata } from "next";
import WorkspaceManagement from "../WorkspaceManagement";

export const metadata: Metadata = {
  title: "Cấu trúc Markdown Workspace | Media Tech",
  description: "Trang hiển thị cấu trúc cây thư mục tài liệu markdown và nội dung chi tiết.",
};

export default function WorkspaceMarkdownPage() {
  return <WorkspaceManagement initialTab="markdown" />;
}
