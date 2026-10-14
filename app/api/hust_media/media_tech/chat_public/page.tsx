import type { Metadata } from "next";
import ChatPublicLauncher from "@/app/api/hust_media/chat_ui/chat_main/ChatPublicLauncher";

export const metadata: Metadata = {
  title: "Chat Public | Hust Media AI",
  description: "Giao diện Chat Public Hust Media AI Assistant",
};

export default function ChatPublicPage() {
  return <ChatPublicLauncher />;
}
