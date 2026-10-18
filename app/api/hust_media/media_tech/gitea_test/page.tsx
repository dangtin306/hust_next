import type { Metadata } from "next";
import GiteaDashboard from "@/app/api/media_tech/gitea_test/GiteaDashboard";

export const metadata: Metadata = {
  title: "Gitea Test | Hust Media",
  description: "Gitea Webhook & API Test - Hust Media.",
};

export default function HustGiteaTestPage() {
  return <GiteaDashboard />;
}
