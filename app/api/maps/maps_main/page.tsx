import type { Metadata } from "next";
import MapsMainCanvas from "./MapsMainCanvas";

export const metadata: Metadata = {
  title: "Bản đồ Tổng thể Tri thức & Thực thi (Maps Main) | Hust Media",
  description:
    "Sơ đồ tổng thể 2 tầng: Cây tri thức Markdown OpenClaw kết hợp Pipeline n8n thực thi qua Dynamic Path Resolution.",
};

export default function MapsMainPage() {
  return (
    <main className="w-full min-h-screen bg-slate-950 p-2 sm:p-4">
      <MapsMainCanvas />
    </main>
  );
}
