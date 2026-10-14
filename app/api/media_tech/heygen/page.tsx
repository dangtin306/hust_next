import type { Metadata } from "next";
import HeyGenDemo from "./HeyGenDemo";

export const metadata: Metadata = {
  title: "HeyGen LiveAvatar Demo | Hust Media",
  description: "Thử nghiệm LiveAvatar của HeyGen qua API.",
};

export default function HeyGenPage() {
  return <HeyGenDemo />;
}
