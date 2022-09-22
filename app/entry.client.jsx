import { hydrate } from "react-dom";
import { RemixBrowser } from "@remix-run/react";

hydrate(<RemixBrowser />, document);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed", error);
    });
  });
}
