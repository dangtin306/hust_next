import type { Metadata } from "next";
import GitControl from "../git_auto/GitControl";

export const metadata: Metadata = {
  title: "Git Control Test",
  description: "Employee Git Control workflow test page.",
};

export default function GitTestPage() {
  return <GitControl />;
}
