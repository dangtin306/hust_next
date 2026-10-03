import type { Metadata } from "next";
import ChatPublicLauncher from "@/app/shop/ai/chat_bot/media_tech/chat_main/ChatPublicLauncher";

export const metadata: Metadata = {
  title: "Chat Public | Media Tech AI",
  description: "Giao diện Chat Public Media Tech AI Assistant",
};

export default function ChatPublicPage() {
  return <ChatPublicLauncher />;
}
