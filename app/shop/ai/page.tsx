import OrdersHome from "@/app/shop/ai/orders_home";
import { notFound } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ slug_2?: string | string[] }>;
};

const ALLOWED_TOOLS = new Set(["speech_text", "text_speech", "image_text"]);

const normalizeSlug2 = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
};

export default async function ShopAiPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const slug_2 = normalizeSlug2(query.slug_2);

  if (!ALLOWED_TOOLS.has(slug_2)) {
    notFound();
  }

  return <OrdersHome slug_1="orders_once" slug_2={slug_2} />;
}
