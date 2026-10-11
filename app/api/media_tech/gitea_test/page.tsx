import type { Metadata } from "next";
import GiteaDashboard from "./GiteaDashboard";

export const metadata: Metadata = { title: "Gitea Project Dashboard", description: "Read-only Gitea project status dashboard." };

export default function GiteaTestPage() { return <GiteaDashboard />; }
