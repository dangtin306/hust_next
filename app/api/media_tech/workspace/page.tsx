import { redirect } from "next/navigation";

export default function WorkspacePage() {
  redirect("/api/mt/workspace/home");
}
