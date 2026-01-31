import type { Metadata } from "next";
import AboutPage from "../../community/info_main/AboutPage";

export const metadata: Metadata = {
  title: "About Hust Media | Security & Tech Lab",
  description:
    "Learn about Hust Media's mission, hybrid architecture, AI-driven verification, and the team behind the security intelligence platform.",
};

export default function AboutUsPage() {
  return <AboutPage />;
}
