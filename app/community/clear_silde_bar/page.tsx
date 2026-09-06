"use client";

import { useEffect, useState } from "react";

const LOCAL_KEYS = ["sidebar_menu_test"];

export default function ClearSildeBarPage() {
  const [status, setStatus] = useState("Clearing client + server cache...");

  useEffect(() => {
    let done = false;

    const run = async () => {
      try {
        for (const key of LOCAL_KEYS) {
          window.localStorage.removeItem(key);
        }
      } catch {
        // ignore local storage errors
      }

      try {
        const response = await fetch("/next/api/sidebar-menu/clear", {
          method: "POST",
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`http_${response.status}`);
        if (!done) setStatus("Done: client + server sidebar cache cleared.");
      } catch {
        if (!done) setStatus("Client cache cleared, but server clear failed.");
      }
    };

    run();
    return () => {
      done = true;
    };
  }, []);

  return (
    <main className="p-6 text-sm text-slate-700">
      <p>{status}</p>
    </main>
  );
}
