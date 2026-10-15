import type { Metadata } from "next";
import HeyGenDemo from "../HeyGenDemo";

export const metadata: Metadata = {
  title: "Tạo video MC ảo | HeyGen",
  description: "Tạo video MC ảo bằng HeyGen Avatar IV Photo API.",
};

export default function HeyGenVideoPage() {
  return <HeyGenDemo />;
}
