import type { Metadata } from "next";
import ApiListHome from "@/app/api/media_tech/list/ApiListHome";

export const metadata: Metadata = {
  title: "Danh sách API (API List) | Hust Media",
  description: "Trung tâm tra cứu và tài liệu 2 hệ thống API: Laravel Backend và OpenClaw AI Gateway.",
};

export default function ApiListHomePage() {
  return <ApiListHome isHust={true} />;
}
