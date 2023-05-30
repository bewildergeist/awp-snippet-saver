import { useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useParams,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { json } from "@remix-run/node";

import CatchBoundary from "~/components/CatchBoundary";
import ErrorBoundary from "~/components/ErrorBoundary";

import { requireUserSession } from "~/sessions.server.js";
import connectDb from "~/db/connectDb.server.js";

const DEFAULT_SORT_FIELD = "updatedAt";

export async function loader({ request }) {
  const session = await requireUserSession(request);
  const userId = session.get("userId");
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get("q");
  const sortField = url.searchParams.get("sort") ?? DEFAULT_SORT_FIELD;

  const db = await connectDb();
  const snippets = await db.models.Snippet.find(
    searchQuery
      ? {
          title: { $regex: new RegExp(searchQuery, "i") },
          userId: userId,
        }
      : {
          userId: userId,
        }
  )
    .sort({
      [sortField]: sortField === "title" ? 1 : -1,
    })
    .lean();

  return json({ snippets });
}

export default function SnippetsIndex() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");
  const params = useParams();
  const { snippets } = useLoaderData();
  const submit = useSubmit();
  const searchFormRef = useRef();

  useEffect(() => {
    if (!location.search) {
      searchFormRef.current.reset();
    }
  }, [location.search]);

  return (
    <div className="grid min-h-screen grid-cols-12 border-zinc-300 dark:border-zinc-700">
      <div className="col-span-3 border-r border-inherit bg-zinc-100 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-inherit">
          <Form
            method="post"
            action="/logout"
            className="border-r border-inherit"
          >
            <button
              type="submit"
              className="p-4 text-zinc-400 hover:text-red-600"
            >
              <ArrowRightOnRectangleIcon width={20} height={20} />
            </button>
          </Form>
          <h1 className="px-4 text-2xl font-bold">
            <Link
              to="/snippets"
              className="transition-colors hover:text-zinc-500"
            >
              My code snippets
            </Link>
          </h1>
          <Link
            to="/snippets/new"
            tabIndex={0}
            className="isolate block border-l border-inherit p-4 text-zinc-400 transition-colors hover:text-zinc-600"
          >
            <PlusIcon width={24} height={24} />
          </Link>
        </div>
        <Form
          method="get"
          onChange={(e) => submit(e.currentTarget)}
          ref={searchFormRef}
          action={location.pathname}
          className="border-b border-inherit"
        >
          <div className="flex flex-row items-center border-b border-inherit">
            <input
              type="search"
              name="q"
              placeholder="Search by title"
              defaultValue={searchQuery}
              className="isolate flex-grow bg-zinc-100 px-4 py-2 dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="isolate px-4 py-2 text-zinc-400 transition-colors hover:text-zinc-600"
            >
              <MagnifyingGlassIcon width={20} height={20} />
            </button>
          </div>
          <div className="flex flex-row items-center border-inherit">
            <span className="flex-grow pl-4 text-sm text-zinc-400">
              Sort by:
            </span>
            <SortFilter value="title" searchParams={searchParams}>
              Title
            </SortFilter>
            <SortFilter value="updatedAt" searchParams={searchParams}>
              Updated
            </SortFilter>
            <SortFilter value="favorite" searchParams={searchParams}>
              Favorite
            </SortFilter>
          </div>
        </Form>
        <ul className="border-b border-inherit">
          {snippets?.map((snippet, i) => {
            return (
              <li
                key={snippet._id}
                className={i > 0 ? "border-t border-inherit" : null}
              >
                <Link
                  to={`${snippet._id}?${searchParams.toString()}`}
                  className={[
                    "block p-4 transition-colors hover:bg-zinc-200 dark:hover:bg-black",
                    params.snippetId === snippet._id &&
                      "bg-zinc-200 shadow-inner dark:bg-black",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="flex flex-row items-center justify-between">
                    <span>{snippet.title}</span>
                    {snippet.favorite ? (
                      <span className="text-amber-500">
                        <StarIcon
                          width={20}
                          height={20}
                          stroke="none"
                          fill="currentColor"
                        />
                      </span>
                    ) : null}
                  </span>
                  <span className="block text-sm text-zinc-400">
                    {new Date(snippet.updatedAt).toLocaleString()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="col-span-9 bg-zinc-50 px-6 py-4 dark:bg-zinc-800">
        <Outlet />
      </div>
    </div>
  );
}

function SortFilter({ value, searchParams, children }) {
  const defaultChecked =
    searchParams.get("sort") === value ||
    (!searchParams.get("sort") && value === DEFAULT_SORT_FIELD);
  const id = `sort-${value}`;
  return (
    <div className="border-l border-inherit">
      <input
        type="radio"
        name="sort"
        defaultChecked={defaultChecked}
        value={value}
        id={id}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        tabIndex={0}
        className="block cursor-pointer px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-600 peer-checked:bg-zinc-200 peer-checked:text-zinc-600 peer-checked:shadow-inner dark:peer-checked:bg-black dark:peer-checked:text-zinc-300"
      >
        {children}
      </label>
    </div>
  );
}
export { CatchBoundary, ErrorBoundary };
