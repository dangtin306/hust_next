import type { Metadata } from "next";
import ChatBotHome from "@/app/api/media_tech/chat_ui/chat_home/ChatBotHome";

export const metadata: Metadata = {
  title: "AI Chat Bot Hub | Hust Media",
  description: "Trung tâm quản trị và giao diện AI Chat Bot (Chat Test & Chat Public) - Hust Media",
};

export default function HustMediaChatHomePage() {
  return <ChatBotHome isHust={true} />;
}
