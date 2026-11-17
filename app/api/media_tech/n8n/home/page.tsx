import type { Metadata } from "next";
import KnowledgeFrame from "../../maps_main/home/KnowledgeFrame";
import N8nRealtimePage from "../node_js/overview";

export const metadata: Metadata = {
  title: "Workflow Home | Media Tech",
  description: "Chọn sơ đồ hệ thống hoặc workflow backend của Media Tech.",
};

// Khung Knowledge đứng đầu lưới "Chọn bản đồ cần xem" (cùng vị trí với bên Hust Media).
export default function MediaTechWorkflowHomePage() {
  return <N8nRealtimePage leading={<KnowledgeFrame product="mt" />} />;
}
