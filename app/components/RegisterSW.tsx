"use client";

import { useEffect } from "react";

/** Registers the PWA service worker on supported browsers (mobile install). */
export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silent fail — PWA install is progressive enhancement
    });
  }, []);

  return null;
}
