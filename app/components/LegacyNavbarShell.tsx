"use client";

import { useEffect, useState } from "react";

type LegacyNavbarProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  apikeyExists: boolean;
  switch_router: (path: string) => void;
  type_user: string;
  idExist: null;
  set_open_button_support: () => void;
};

const LegacyNavbarShell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [NavbarComponent, setNavbarComponent] =
    useState<React.ComponentType<LegacyNavbarProps> | null>(null);

  useEffect(() => {
    let isMounted = true;
    import("../../../react_app/src/shared/next_navbar.jsx")
      .then((mod) => {
        if (isMounted) {
          setNavbarComponent(() => mod.default);
        }
      })
      .catch((error) => {
        console.error("legacy navbar load error:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const switchRouter = (path: string) => {
    if (!path) return;
    window.location.href = path;
  };

  return (
    <div className="legacy-navbar-theme">
      {NavbarComponent ? (
        <NavbarComponent
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          apikeyExists={false}
          switch_router={switchRouter}
          type_user=""
          idExist={null}
          set_open_button_support={() => {}}
        />
      ) : null}
    </div>
  );
};

export default LegacyNavbarShell;
