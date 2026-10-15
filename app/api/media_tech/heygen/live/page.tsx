import type { Metadata } from "next";
import LiveAvatarDemo from "../LiveAvatarDemo";

export const metadata: Metadata = {
  title: "HeyGen LiveAvatar Demo | Hust Media",
  description: "Thử nghiệm LiveAvatar của HeyGen qua API và SDK.",
};

export default function HeyGenLivePage() {
  return <LiveAvatarDemo />;
}
