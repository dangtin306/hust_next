import type { Metadata } from "next";
import CronServerAdmin from "./cron_server";
import "./scheduler.css";

export const metadata: Metadata = {
  title: "Cron Server Manager | Hust Media",
  description: "Trình quản trị & điều khiển hệ thống tác vụ định kỳ Cron Server - Hust Media",
};

export default function CronPage() {
  return (
    <div className="cron-server-page bg-transparent">
      <CronServerAdmin />
    </div>
  );
}
