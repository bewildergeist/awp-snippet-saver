import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "~/tailwind.css";

const THEME_COLOR = "#fafafa";

export const links = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/icons/apple-touch-icon.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/icons/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/icons/favicon-16x16.png",
  },
  {
    rel: "mask-icon",
    color: THEME_COLOR,
    href: "/icons/safari-pinned-tab.svg",
  },
  {
    rel: "manifest",
    href: "/site.webmanifest",
  },
];

export function meta() {
  return {
    charset: "utf-8",
    title: "Snippet Saver",
    viewport: "width=device-width,initial-scale=1",
    "apple-mobile-web-app-title": "Snippet Saver",
    "application-name": "Snippet Saver",
    "msapplication-TileColor": THEME_COLOR,
    "theme-color": THEME_COLOR,
  };
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-zinc-50 font-sans text-zinc-800 dark:bg-black dark:text-zinc-200">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
