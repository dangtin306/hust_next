"use client";

import { useEffect, useState } from "react";
import NextSidebar from "./NextSidebar";

const LegacyNavbarShell = () => {
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
      <NextSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default LegacyNavbarShell;
