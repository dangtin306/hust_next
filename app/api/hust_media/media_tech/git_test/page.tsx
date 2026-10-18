import type { Metadata } from "next";
import GitControl from "@/app/api/media_tech/git_test/GitControl";

export const metadata: Metadata = {
  title: "Git Test | Hust Media",
  description: "Laravel Git Test dashboard - Hust Media.",
};

export default function HustGitTestPage() {
  return <GitControl />;
}
