import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KnowledgeReadPage, { type ReadableFile } from "../ReadPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đọc sách | Media Tech",
  description: "Sách giáo khoa và bảng quan hệ của Media Tech, đọc trực tiếp từ file đã sinh.",
};

const READABLE: readonly ReadableFile[] = ["textbook", "relations"];

export default async function MediaTechReadPage({ params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!READABLE.includes(file as ReadableFile)) notFound();
  return <KnowledgeReadPage product="mt" file={file as ReadableFile} />;
}
