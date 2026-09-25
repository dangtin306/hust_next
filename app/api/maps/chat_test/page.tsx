import type { Metadata } from "next";
import RealChatPage from "@/app/shop/ai/chat_bot/main/page";

export const metadata: Metadata = {
  title: "Media Tech AI Assistant | Chat Test",
  description: "Trợ lý AI thông minh hỗ trợ sinh viên - Media Tech",
};

export default function SwaggerChatTestPage() {
  return <RealChatPage />;
}
