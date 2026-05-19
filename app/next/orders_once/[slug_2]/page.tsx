import OrdersHome from "@/app/shop/ai/orders_home";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug_2: string }>;
};

const ALLOWED_TOOLS = new Set(["speech_text", "text_speech", "image_text", "translate_vi_en"]);

export default async function OrdersOnceToolPage({ params }: PageProps) {
  const { slug_2 } = await params;
  if (!ALLOWED_TOOLS.has(slug_2)) {
    notFound();
  }

  return <OrdersHome slug_1="orders_once" slug_2={slug_2} />;
}
