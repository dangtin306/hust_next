import type { Metadata } from "next";
import GitControl from "../git_auto/GitControl";

export const metadata: Metadata = {
  title: "Git Control",
  description: "Laravel Git Control dashboard for the local OpenClaw source.",
};

export default function GitTestPage() { return <GitControl />; }
