import type { Metadata } from "next";
import MapsMainCanvas from "./MapsMainCanvas";

export const metadata: Metadata = {
  title: "Bản đồ Workspace n8n | Hust Media",
  description:
    "Bản đồ workspace, cây tri thức Markdown OpenClaw và pipeline n8n thực thi cho Hust và Media Tech.",
};

export default async function MapsMainPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  return (
    <main className="w-full min-h-screen bg-slate-950 p-2 sm:p-4">
      <MapsMainCanvas project={project === "hust" ? "hust" : "media_tech"} />
    </main>
  );
}
