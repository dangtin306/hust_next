import type { Metadata } from "next";
import ChatBotClient from "@/app/shop/ai/chat_bot/hust_media/main/ChatBotClient";

export const metadata: Metadata = {
  title: "Media Tech AI Assistant | Chat Test",
  description: "Trợ lý AI thông minh hỗ trợ sinh viên - Media Tech",
};

export default function SwaggerChatTestPage() {
  return <ChatBotClient />;
}
