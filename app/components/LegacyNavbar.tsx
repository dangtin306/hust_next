"use client";

import dynamic from "next/dynamic";

const LegacyNavbar = dynamic(
  () => import("../../../react_app/src/shared/next_navbar.jsx"),
  { ssr: false }
);

export default LegacyNavbar;
