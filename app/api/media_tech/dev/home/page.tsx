import type { Metadata } from "next";
import DevHomePage from "@/app/api/media_tech/dev_ui/DevHomePage";

export const metadata: Metadata = {
  title: "Dev Tools & Automation Hub | Media Tech",
  description: "Trung tâm phát triển và tự động hóa: Workspace & Workflow - Media Tech",
};

export default function MediaTechDevHomeDirectPage() {
  return <DevHomePage isHust={false} />;
}
