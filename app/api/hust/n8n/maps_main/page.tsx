import type { Metadata } from "next";
import MapsMainCanvas from "../../../media_tech/maps_main/MapsMainCanvas";

export const metadata: Metadata = {
  title: "Bản đồ Workspace n8n | Hust Media",
  description: "Bản đồ workspace Hust, cây tri thức Markdown và pipeline n8n thực thi.",
};

export default function HustMapsMainPage() {
  return (
    <main className="w-full min-h-screen bg-slate-950 p-2 sm:p-4">
      <MapsMainCanvas project="hust" />
    </main>
  );
}
