import type { Metadata } from "next";
import GitAutoHome from "@/app/api/media_tech/git_home/GitAutoHome";

export const metadata: Metadata = {
  title: "Git Automation Hub | Hust Media",
  description: "Trung tâm quản trị Git Automation & Control (Git Auto, Git Test, Gitea Test) - Hust Media",
};

export default function HustMediaGitHomePage() {
  return <GitAutoHome isHust={true} />;
}
