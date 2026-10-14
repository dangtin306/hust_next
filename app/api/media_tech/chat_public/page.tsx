import type { Metadata } from "next";
import ChatPublicLauncher from "@/app/api/media_tech/chat_ui/chat_main/ChatPublicLauncher";

export const metadata: Metadata = {
  title: "Chat Public | Media Tech AI",
  description: "Giao diện Chat Public Media Tech AI Assistant",
};

export default function ChatPublicPage() {
  return <ChatPublicLauncher />;
}
