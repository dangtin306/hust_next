import type { Metadata } from "next";
import ChatBotClient from "./ChatBotClient";
import ChatBotSwitcher from "../workflow/ChatBotSwitcher";

export const metadata: Metadata = {
  title: "Hust AI Assistant | Chat Bot",
  description: "Trợ lý AI thông minh hỗ trợ sinh viên - Hust Media",
};

export default function ChatBotPage() {
  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-transparent p-4 sm:p-6">
      <ChatBotSwitcher active="test_1" />
      <ChatBotClient />
    </main>
  );
}
