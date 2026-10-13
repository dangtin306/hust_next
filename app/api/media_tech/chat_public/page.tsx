import type { Metadata } from "next";
import ChatBotClient from "@/app/shop/ai/chat_bot/hust_media/main/ChatBotClient";

export const metadata: Metadata = {
  title: "Chat Public | Media Tech AI",
  description: "Giao diện Chat Public Media Tech AI Assistant",
};

export default function ChatPublicPage() {
  return <ChatBotClient />;
}
