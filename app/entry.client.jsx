import { hydrateRoot } from "react-dom/client";
import { RemixBrowser } from "@remix-run/react";

hydrateRoot(document, <RemixBrowser />);

if ("serviceWorker" in navigator) {
  const manifest = window.__remixManifest;
  navigator.serviceWorker
    .register(`/sw.js?manifestUrl=${manifest.url}`)
    .catch((error) => {
      console.error("Service worker registration failed", error);
    });
}
