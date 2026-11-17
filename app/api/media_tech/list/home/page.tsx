import type { Metadata } from "next";
import ApiListHome from "../ApiListHome";

export const metadata: Metadata = {
  title: "Danh sách API (API List) | Media Tech",
  description: "Trung tâm tra cứu Laravel, OpenClaw và Multi Agent API; tài liệu Workspace thuộc nhóm Multi Agent nhưng request vẫn do Laravel xử lý.",
};

export default function ApiListHomePage() {
  return <ApiListHome isHust={false} />;
}
