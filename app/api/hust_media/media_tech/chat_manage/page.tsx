import type { Metadata } from "next";
import ChatManagePage from "@/app/api/media_tech/chat_ui/chat_manage/ChatManagePage";

export const metadata: Metadata = {
  title: "Quản Trị AI Chat Bot | Hust Media",
  description: "Trang quản trị người dùng, phiên hoạt động (sessions) và phòng chat AI - Hust Media",
};

export default function HustMediaChatManageRoute() {
  return <ChatManagePage isHust={true} />;
}
