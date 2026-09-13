"use client";

import { useEffect } from "react";

const EXTENSION_ID = "nkbihfbeogaeaoehlefnkodbefgpgknn";
const EXTENSION_PATTERN = new RegExp(`chrome-extension://${EXTENSION_ID}`, "i");

const hasMetaMaskTrace = (value: unknown) => {
  const text = String(value || "");
  return /metamask/i.test(text) || EXTENSION_PATTERN.test(text);
};

export default function IgnoreMetaMaskExtensionErrors() {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = (reason && typeof reason === "object" && "message" in reason)
        ? (reason as { message?: unknown }).message
        : reason;
      const stack = (reason && typeof reason === "object" && "stack" in reason)
        ? (reason as { stack?: unknown }).stack
        : "";

      if (hasMetaMaskTrace(message) || hasMetaMaskTrace(stack)) {
        event.preventDefault();
      }
    };

    const onError = (event: ErrorEvent) => {
      if (hasMetaMaskTrace(event.message) || hasMetaMaskTrace(event.filename)) {
        event.preventDefault();
      }
    };

    // Capture phase is needed because the MetaMask inpage script can emit the
    // error before it reaches the normal bubbling listeners.
    window.addEventListener("unhandledrejection", onUnhandledRejection, true);
    window.addEventListener("error", onError, true);

    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      if (args.some(hasMetaMaskTrace)) return;
      originalConsoleError(...args);
    };

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection, true);
      window.removeEventListener("error", onError, true);
      console.error = originalConsoleError;
    };
  }, []);

  return null;
}
