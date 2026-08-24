"use client";

import { usePathname } from "next/navigation";
import SupportButton from "../community/services/SupportButton";

export default function SupportButtonConditional() {
  const pathname = usePathname() || "";
  const isSwaggerRoute =
    pathname === "/api/swagger" ||
    pathname.startsWith("/api/swagger/") ||
    pathname === "/next/api/swagger" ||
    pathname.startsWith("/next/api/swagger/");

  if (isSwaggerRoute) return null;

  return <SupportButton />;
}
