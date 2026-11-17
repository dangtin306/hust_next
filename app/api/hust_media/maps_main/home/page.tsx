import type { Metadata } from "next";
import KnowledgeHub from "../../../media_tech/maps_main/home/KnowledgeHub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Knowledge: Semantic City Map | Hust Media",
  description: "Cửa vào Knowledge: bản đồ và sách giáo khoa của Hust Media.",
};

export default function HustMapsHomePage() {
  return <KnowledgeHub product="hust" />;
}
