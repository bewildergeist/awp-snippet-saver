import { StatusOfflineIcon } from "@heroicons/react/solid";
import { Link, useCatch } from "@remix-run/react";
import { useEffect, useState } from "react";

export default function CatchBoundary() {
  const caught = useCatch();
  const [offlineSnippets, setOfflineSnippets] = useState([]);

  // Load cached snippets in a useEffect (which only runs in the browser)
  // because the Cache API is not available when rendering on the server
  useEffect(() => {
    async function getCachedSnippets() {
      const cache = await caches.open("dynamic-cache");
      const cachedRequests = await cache.keys();
      const cachedLoaderRequestsForSnippetPages = cachedRequests.filter(
        (request) => {
          const url = new URL(request.url);
          return (
            // Does it have a _data param, e.g. is it a loader request?
            url.searchParams.has("_data") &&
            // And is it a loader request specifically for the $snippetId route?
            url.searchParams.get("_data").includes("$snippetId")
          );
        }
      );
      const simplifiedCachedSnippets = await Promise.all(
        cachedLoaderRequestsForSnippetPages.map(async (request) => {
          const response = await cache.match(request);
          const body = await response.json();
          return {
            _id: body._id,
            title: body.title,
          };
        })
      );
      setOfflineSnippets(simplifiedCachedSnippets);
    }
    if (caught.status === 503) {
      getCachedSnippets();
    }
  }, [caught.status]);

  // Special case for offline viewing
  if (caught.status === 503) {
    return (
      <div>
        <div className="flex flex-row items-center gap-2">
          <StatusOfflineIcon className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-bold">You appear to be offline</h1>
        </div>
        {offlineSnippets.length === 0 ? (
          <p className="my-3">
            This page is unavailable, and no snippets have been cached for
            offline viewing, unfortunately. Try again when you regain
            connectivity.
          </p>
        ) : (
          <>
            <p className="my-3">
              This page is unavailable, but these snippets have been cached for
              offline viewing, try one of them:
            </p>
            <ul className="my-3 pl-4 list-disc">
              {offlineSnippets.map(({ _id, title }) => (
                <li key={_id}>
                  <Link
                    to={`/snippets/${_id}`}
                    className="block font-bold hover:underline">
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }
  // Default CatchBoundary
  return (
    <div className="text-red-500 font-bold">
      <h1>
        {caught.status} {caught.statusText}
      </h1>
      <h2>{caught.data}</h2>
    </div>
  );
}
