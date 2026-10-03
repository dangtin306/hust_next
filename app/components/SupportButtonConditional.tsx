"use client";

import { usePathname } from "next/navigation";
import SupportButton from "../community/services/SupportButton";

export default function SupportButtonConditional() {
  const pathname = usePathname() || "";
  const isSwaggerRoute =
    pathname === "/api/mt" ||
    pathname.startsWith("/api/mt/") ||
    pathname === "/next/api/mt" ||
    pathname.startsWith("/next/api/mt/");

  if (isSwaggerRoute) return null;

  return <SupportButton />;
}
