"use client";

import { useEffect, useState } from "react";
    import("../../../react_app/src/shared/next_navbar.jsx")

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

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => !prev);
    };
    window.addEventListener("legacy-menu-toggle", handleToggle);
    return () => {
      window.removeEventListener("legacy-menu-toggle", handleToggle);
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
      ) : (
        <nav
          aria-hidden="true"
          className={`
            antialiased text-slate-900
            flex flex-col h-full overflow-y-auto
            bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-200
            px-4 py-4 fixed top-0 left-0
            w-80 md:w-[280px]
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          `}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-32 rounded bg-white/60" />
            <div className="h-6 w-6 rounded-full bg-white/60 md:hidden" />
          </div>
          <div className="flex flex-col gap-2 border-t-2 border-b-2 border-pink-400 py-3">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className="h-8 rounded bg-white/50 shadow-sm"
              />
            ))}
          </div>
          <div className="mt-auto pt-2 mb-0 flex justify-around">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-5 w-5 rounded bg-white/60" />
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default LegacyNavbarShell;
