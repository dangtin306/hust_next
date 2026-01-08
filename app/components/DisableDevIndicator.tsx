"use client";

import { useEffect } from "react";

const DisableDevIndicator = () => {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_HIDE_DEV_INDICATOR !== "1"
    ) {
      return;
    }

    const hideIndicatorInPortal = () => {
      const portals = Array.from(document.querySelectorAll("nextjs-portal"));
      portals.forEach((portal) => {
        const shadowRoot = portal.shadowRoot;
        if (!shadowRoot) return;
        const indicator = shadowRoot.getElementById("data-devtools-indicator");
        if (indicator) {
          indicator.setAttribute("style", "display:none !important");
        }
        if (!shadowRoot.getElementById("hide-devtools-indicator")) {
          const style = document.createElement("style");
          style.id = "hide-devtools-indicator";
          style.textContent = "#data-devtools-indicator{display:none!important}";
          shadowRoot.appendChild(style);
        }
      });
    };

    const nextData = (window as typeof window & { __NEXT_DATA__?: { basePath?: string } })
      .__NEXT_DATA__;
    const basePath = nextData?.basePath || (window.location.pathname.startsWith("/next") ? "/next" : "");
    const endpoints = ["/__nextjs_disable_dev_indicator"];
    if (basePath) {
      endpoints.push(`${basePath}/__nextjs_disable_dev_indicator`);
    }

    Promise.allSettled(
      endpoints.map((endpoint) =>
        fetch(endpoint, { method: "POST" }).catch(() => null)
      )
    )
      .then(() => hideIndicatorInPortal())
      .catch(() => {});

    const observer = new MutationObserver(() => hideIndicatorInPortal());
    observer.observe(document.body, { childList: true, subtree: true });

    hideIndicatorInPortal();

    return () => observer.disconnect();
  }, []);

  return null;
};

export default DisableDevIndicator;
