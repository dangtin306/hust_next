"use client";

import { useEffect, useState } from "react";
import NextSidebar from "./sidebar_main";
import type { MenuItem } from "./sidebar_logic";

type LegacyNavbarShellProps = {
  initialMenu?: MenuItem[];
  initialLatestVersion?: string | number;
  initialMarket?: string;
  initialDisplayHostname?: string;
  initialApiStatus?: string;
};

const LegacyNavbarShell = ({
  initialMenu = [],
  initialLatestVersion,
  initialMarket = "vi",
  initialDisplayHostname = "",
  initialApiStatus = "success",
}: LegacyNavbarShellProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => !prev);
    };
    window.addEventListener("legacy-menu-toggle", handleToggle);
    return () => {
      window.removeEventListener("legacy-menu-toggle", handleToggle);
    };
  }, []);

  return (
    <div>
      <NextSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        initialMenu={initialMenu}
        initialLatestVersion={initialLatestVersion}
        initialMarket={initialMarket}
        initialDisplayHostname={initialDisplayHostname}
        initialApiStatus={initialApiStatus}
      />
    </div>
  );
};

export default LegacyNavbarShell;
