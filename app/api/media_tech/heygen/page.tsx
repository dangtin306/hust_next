import type { Metadata } from "next";
import HeyGenDemo from "./HeyGenDemo";

export const metadata: Metadata = {
  title: "HeyGen Video Demo | Hust Media",
  description: "Video MC ảo với HeyGen Avatar IV Photo API.",
};

export default function HeyGenPage() {
  return <HeyGenDemo />;
}
