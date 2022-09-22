import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useLocation } from "@remix-run/react";
import { TrashIcon, StarIcon, PencilAltIcon } from "@heroicons/react/outline";
import CatchBoundary from "~/components/CatchBoundary";
import ErrorBoundary from "~/components/ErrorBoundary";
import { requireUserSession } from "~/sessions.server.js";
import connectDb from "~/db/connectDb.server.js";

export async function loader({ request, params }) {
  const db = await connectDb();
  const snippet = await db.models.Snippet.findById(params.snippetId).lean();
  if (!snippet) {
    throw new Response(`Couldn't find snippet with id ${params.snippetId}`, {
      status: 404,
    });
  }
  const session = await requireUserSession(request);
  if (session.get("userId") !== snippet.userId?.toString()) {
    throw new Response(`That's not your snippet`, {
      status: 403,
    });
  }
  return json(snippet);
}

export async function action({ params, request }) {
  await requireUserSession(request);
  const formData = await request.formData();
  const db = await connectDb();
  switch (formData.get("_action")) {
    case "delete":
      await db.models.Snippet.findByIdAndDelete(params.snippetId);
      return redirect("/snippets");
    case "favorite":
      const snippet = await db.models.Snippet.findById(params.snippetId);
      snippet.favorite = !snippet.favorite;
      await snippet.save();
      return null;
  }
}

export default function SnippetPage() {
  const snippet = useLoaderData();
  const location = useLocation();

  return (
    <div>
      <div className="flex flex-row items-center mb-1">
        <div className="flex flex-grow flex-row items-center">
          <Form method="post" action={location.search}>
            <button
              name="_action"
              value="favorite"
              type="submit"
              className={[
                "block mr-2 transition-colors",
                snippet.favorite
                  ? "text-amber-500"
                  : "text-zinc-300 dark:text-zinc-600 hover:text-amber-500",
              ].join(" ")}>
              <StarIcon className="h-6 w-6" stroke="none" fill="currentColor" />
            </button>
          </Form>
          <h1 className="text-2xl font-bold">{snippet.title}</h1>
        </div>
        <Link
          to={"edit" + location.search}
          className="block p-1 transition-colors text-zinc-400 hover:text-zinc-600">
          <PencilAltIcon width={20} height={20} />
        </Link>
        <Form method="post">
          <button
            name="_action"
            value="delete"
            type="submit"
            title="Delete"
            aria-label="Delete"
            className="block p-1 transition-colors text-zinc-400 hover:text-red-600">
            <TrashIcon width={20} height={20} />
          </button>
        </Form>
      </div>
      <p className="mb-4 text-zinc-400 text-sm">
        <span>Created </span>
        <time dateTime={snippet.createdAt}>
          {new Date(snippet.createdAt).toLocaleDateString()}
        </time>
        <span> • Updated </span>
        <time dateTime={snippet.updatedAt}>
          {new Date(snippet.updatedAt).toLocaleDateString()}
        </time>
      </p>
      <div className="relative my-3 rounded p-2 bg-zinc-800 dark:bg-zinc-900 text-green-400 leading-6">
        <code className="absolute top-2 right-2 font-semibold text-sm text-zinc-400">
          {snippet.programmingLanguage}
        </code>
        <code>
          <pre>{snippet.code}</pre>
        </code>
      </div>
      <div className="my-3">
        <code>
          <pre>{snippet.description}</pre>
        </code>
      </div>
    </div>
  );
}

export { CatchBoundary, ErrorBoundary };
