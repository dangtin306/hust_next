import type { Metadata } from "next";
import DevHomePage from "@/app/api/media_tech/dev_ui/DevHomePage";

export const metadata: Metadata = {
  title: "Dev Tools & Automation Hub | Hust Media",
  description: "Trung tâm phát triển và tự động hóa: Workspace & Workflow - Hust Media",
};

export default function HustMediaDevHomePage() {
  return <DevHomePage isHust={true} />;
}
