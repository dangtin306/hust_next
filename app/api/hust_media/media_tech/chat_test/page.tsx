import type { Metadata } from "next";
import RealChatPage from "@/app/api/hust_media/chat_ui/main/RealChatPage";

export const metadata: Metadata = {
  title: "Hust AI Assistant | Chat Test",
  description: "Trợ lý AI thông minh hỗ trợ sinh viên Hust",
};

export default function SwaggerChatTestPage() {
  return <RealChatPage className="h-full max-h-full" />;
}
