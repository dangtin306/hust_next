import type { Metadata } from "next";
import KnowledgeHub from "./KnowledgeHub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Knowledge: Semantic City Map | Media Tech",
  description: "Cửa vào Knowledge: bản đồ và sách giáo khoa của Media Tech.",
};

export default function MediaTechMapsHomePage() {
  return <KnowledgeHub product="mt" />;
}
