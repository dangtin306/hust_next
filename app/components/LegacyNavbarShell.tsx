"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LegacyNavbar from "./LegacyNavbar";

const LegacyNavbarShell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="legacy-navbar-theme">
      <LegacyNavbar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        apikeyExists={false}
        switch_router={(path) => router.push(path)}
        type_user=""
        idExist={null}
        set_open_button_support={() => {}}
      />
    </div>
  );
};

export default LegacyNavbarShell;
