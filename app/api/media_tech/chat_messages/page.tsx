import type { Metadata } from "next";
import ChatManagePage from "@/app/api/media_tech/chat_ui/chat_manage/ChatManagePage";

export const metadata: Metadata = {
  title: "Quản Trị Messages AI Chat Bot | Media Tech",
  description: "Trang quản trị lịch sử tin nhắn và payload hội thoại của các phòng chat AI - Media Tech",
};

export default function MediaTechChatMessagesRoute() {
  return <ChatManagePage isHust={false} initialTab="messages" />;
}
