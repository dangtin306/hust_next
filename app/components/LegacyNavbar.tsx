"use client";

import dynamic from "next/dynamic";

const LegacyNavbar = dynamic(
  () =>
    import("../../../react_app/src/shared/next_navbar.jsx").catch(() => ({
      default: () => null,
    })),
  { ssr: false }
);

export default LegacyNavbar;
