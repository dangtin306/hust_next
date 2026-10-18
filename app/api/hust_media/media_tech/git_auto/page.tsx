import type { Metadata } from "next";
import GitControl from "@/app/api/media_tech/git_auto/GitControl";

export const metadata: Metadata = {
  title: "Git Control | Hust Media",
  description: "Laravel Git Control dashboard for the local OpenClaw source - Hust Media.",
};

export default function HustGitAutoPage() {
  return <GitControl />;
}
