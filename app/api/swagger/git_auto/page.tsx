import type { Metadata } from "next";
import GitControl from "./GitControl";

export const metadata: Metadata = {
  title: "Git Control",
  description: "Mock Git control dashboard.",
};

export default function GitAutoPage() { return <GitControl />; }
