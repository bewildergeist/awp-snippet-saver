import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import connectDb from "~/db/connectDb.server";
import CatchBoundary from "~/components/CatchBoundary";
import ErrorBoundary from "~/components/ErrorBoundary";
import EditSnippetForm from "~/components/EditSnippetForm.jsx";
import { requireUserSession } from "~/sessions.server.js";

export async function loader({ request }) {
  await requireUserSession(request);
  return null;
}

export async function action({ request }) {
  const session = await requireUserSession(request);
  const form = await request.formData();
  const formValues = Object.fromEntries(form);
  const db = await connectDb();
  try {
    const newSnippet = await db.models.Snippet.create({
      ...formValues,
      userId: session.get("userId"),
    });
    return redirect(`/snippets/${newSnippet._id}`);
  } catch (error) {
    return json({ errors: error.errors, values: formValues }, { status: 400 });
  }
}

export default function CreateSnippet() {
  const actionData = useActionData();
  return (
    <div>
      <h1 className="text-2xl font-bold">Create snippet</h1>
      <EditSnippetForm
        submittedValues={actionData?.values}
        errors={actionData?.errors}
      />
    </div>
  );
}

export { CatchBoundary, ErrorBoundary };
