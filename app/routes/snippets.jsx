import { useEffect, useRef } from "react";
import {
  SearchIcon,
  PlusIcon,
  StarIcon,
  LogoutIcon,
} from "@heroicons/react/outline";

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
    <div className="min-h-screen grid grid-cols-12 border-zinc-300 dark:border-zinc-700">
      <div className="col-span-3 bg-zinc-100 dark:bg-zinc-900 border-r border-inherit">
        <div className="flex justify-between items-center border-b border-inherit">
          <Form
            method="post"
            action="/logout"
            className="border-r border-inherit">
            <button
              type="submit"
              className="p-4 text-zinc-400 hover:text-red-600">
              <LogoutIcon width={20} height={20} />
            </button>
          </Form>
          <h1 className="text-2xl px-4 font-bold">
            <Link
              to="/snippets"
              className="hover:text-zinc-500 transition-colors">
              My code snippets
            </Link>
          </h1>
          <Link
            to="/snippets/new"
            tabIndex={0}
            className="block isolate text-zinc-400 hover:text-zinc-600 transition-colors p-4 border-l border-inherit">
            <PlusIcon width={24} height={24} />
          </Link>
        </div>
        <Form
          method="get"
          onChange={(e) => submit(e.currentTarget)}
          ref={searchFormRef}
          action={location.pathname}
          className="border-b border-inherit">
          <div className="flex flex-row items-center border-b border-inherit">
            <input
              type="search"
              name="q"
              placeholder="Search by title"
              defaultValue={searchQuery}
              className="px-4 py-2 flex-grow bg-zinc-100 dark:bg-zinc-900 isolate"
            />
            <button
              type="submit"
              className="px-4 py-2 text-zinc-400 hover:text-zinc-600 transition-colors isolate">
              <SearchIcon width={20} height={20} />
            </button>
          </div>
          <div className="flex flex-row items-center border-inherit">
            <span className="pl-4 text-sm text-zinc-400 flex-grow">
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
                className={i > 0 ? "border-t border-inherit" : null}>
                <Link
                  to={`${snippet._id}?${searchParams.toString()}`}
                  className={[
                    "block p-4 hover:bg-zinc-200 dark:hover:bg-black transition-colors",
                    params.snippetId === snippet._id &&
                      "bg-zinc-200 dark:bg-black shadow-inner",
                  ]
                    .filter(Boolean)
                    .join(" ")}>
                  <span className="flex flex-row justify-between items-center">
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
                  <span className="block text-zinc-400 text-sm">
                    {new Date(snippet.updatedAt).toLocaleString()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="col-span-9 px-6 py-4 bg-zinc-50 dark:bg-zinc-800">
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
        className="block cursor-pointer text-sm hover:text-zinc-600 px-4 py-2 transition-colors text-zinc-400 peer-checked:text-zinc-600 dark:peer-checked:text-zinc-300 peer-checked:bg-zinc-200 dark:peer-checked:bg-black peer-checked:shadow-inner">
        {children}
      </label>
    </div>
  );
}
export { CatchBoundary, ErrorBoundary };
