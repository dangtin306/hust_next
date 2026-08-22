"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import NextSidebar from "./sidebar_main";
import type { MenuItem } from "./sidebar_logic";
import {
  readSidebarCollapsed,
  subscribeSidebarCollapsed,
  writeSidebarCollapsed,
} from "../../../react_app/src/shared/sidebar_state.js";

type LegacyNavbarShellProps = {
  initialCollapsed?: boolean;
  initialMenu?: MenuItem[];
  initialLatestVersion?: string | number;
  initialMarket?: string;
  initialDisplayHostname?: string;
  initialApiStatus?: string;
};

const LegacyNavbarShell = ({
  initialCollapsed = false,
  initialMenu = [],
  initialLatestVersion,
  initialMarket = "vi",
  initialDisplayHostname = "",
  initialApiStatus = "success",
}: LegacyNavbarShellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    readSidebarCollapsed,
    () => initialCollapsed,
  );
  const setIsCollapsed = (value: boolean) => {
    writeSidebarCollapsed(value);
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--next-sidebar-width",
      isCollapsed ? "72px" : "280px",
    );
  }, [isCollapsed]);

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
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
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
