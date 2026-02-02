import type { Metadata } from "next";
import DevelopmentServicesPage from "../../info_main/code";

export const metadata: Metadata = {
  title: "Development Services | Hust Media",
  description:
    "Next.js development services for product builds, modernization, and secure delivery.",
};

export default function NextServicesDevelopmentPage() {
  return <DevelopmentServicesPage />;
}
