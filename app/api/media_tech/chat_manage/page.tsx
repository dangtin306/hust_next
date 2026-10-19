import type { Metadata } from "next";
import ChatManagePage from "@/app/api/media_tech/chat_ui/chat_manage/ChatManagePage";

export const metadata: Metadata = {
  title: "Quản Trị AI Chat Bot | Media Tech",
  description: "Trang quản trị người dùng, phiên hoạt động (sessions) và phòng chat AI - Media Tech",
};

export default function MediaTechChatManageRoute() {
  return <ChatManagePage isHust={false} initialTab="bot" />;
}
