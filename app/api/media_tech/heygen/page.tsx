import { permanentRedirect } from "next/navigation";

export default function HeyGenPage() {
  permanentRedirect("/api/mt/media/heygen/video");
}
