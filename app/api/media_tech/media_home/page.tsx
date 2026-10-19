import type { Metadata } from "next";
import MediaHomePage from "@/app/api/media_tech/media_ui/MediaHomePage";

export const metadata: Metadata = {
  title: "AI Media Hub | Media Tech",
  description: "Trung tâm quản trị và giải pháp AI Media & Video Studio (HeyGen, AI Voice, AI Visual) - Media Tech",
};

export default function MediaTechMediaHomePage() {
  return <MediaHomePage isHust={false} />;
}
