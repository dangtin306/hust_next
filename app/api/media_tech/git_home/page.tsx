import type { Metadata } from "next";
import GitAutoHome from "./GitAutoHome";

export const metadata: Metadata = {
  title: "Git Automation Hub | Media Tech",
  description: "Trung tâm quản trị Git Automation & Control (Git Auto, Git Test, Gitea Test) - Media Tech",
};

export default function MediaTechGitHomePage() {
  return <GitAutoHome isHust={false} />;
}
