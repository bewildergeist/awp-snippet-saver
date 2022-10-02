import { hydrateRoot } from "react-dom/client";
import { RemixBrowser } from "@remix-run/react";

hydrateRoot(document, <RemixBrowser />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed", error);
    });
  });
}
