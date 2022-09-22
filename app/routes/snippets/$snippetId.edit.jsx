import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import connectDb from "~/db/connectDb.server.js";
import CatchBoundary from "~/components/CatchBoundary";
import ErrorBoundary from "~/components/ErrorBoundary";
import { requireUserSession } from "~/sessions.server.js";
import EditSnippetForm from "~/components/EditSnippetForm.jsx";

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

export async function action({ request, params }) {
  const url = new URL(request.url);
  const form = await request.formData();
  const formValues = Object.fromEntries(form);
  const db = await connectDb();

  try {
    const snippet = await db.models.Snippet.findById(params.snippetId);
    snippet.title = form.get("title");
    snippet.programmingLanguage = form.get("programmingLanguage");
    snippet.code = form.get("code");
    snippet.description = form.get("description");
    await snippet.save();
    return redirect(
      `/snippets/${params.snippetId}?${url.searchParams.toString()}`
    );
  } catch (error) {
    return json({ errors: error.errors, values: formValues }, { status: 400 });
  }
}

export default function EditSnippet() {
  const snippet = useLoaderData();
  const actionData = useActionData();

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit snippet</h1>
      <EditSnippetForm
        submittedValues={actionData?.values}
        errors={actionData?.errors}
        defaultValues={snippet}
      />
    </div>
  );
}

export { CatchBoundary, ErrorBoundary };
