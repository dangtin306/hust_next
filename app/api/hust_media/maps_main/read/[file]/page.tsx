import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KnowledgeReadPage, { type ReadableFile } from "../../../../media_tech/maps_main/read/ReadPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đọc sách | Hust Media",
  description: "Sách giáo khoa và bảng quan hệ của Hust Media, đọc trực tiếp từ file đã sinh.",
};

const READABLE: readonly ReadableFile[] = ["textbook", "relations"];

export default async function HustReadPage({ params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!READABLE.includes(file as ReadableFile)) notFound();
  return <KnowledgeReadPage product="hust" file={file as ReadableFile} />;
}
