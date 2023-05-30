import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import connectDb from "~/db/connectDb.server";
import seedData from "~/db/seed.json";

export async function loader() {
  const db = await connectDb();
  const snippetsCount = await db.models.Snippet.countDocuments();
  return json({
    snippetsCount,
    defaultSnippetsCount: seedData.snippets.length,
  });
}

export async function action({ request }) {
  const db = await connectDb();
  const formData = await request.formData();
  if (formData.get("_action") === "seed") {
    await db.models.Snippet.deleteMany({});
    await db.models.Snippet.insertMany(seedData.snippets);
    return redirect("/snippets");
  }
}

export default function Seed() {
  const { snippetsCount, defaultSnippetsCount } = useLoaderData();
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="rounded border-2 border-zinc-200 bg-zinc-50 p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
        <h1 className="mb-3 text-2xl font-bold">Seeding the database</h1>
        <p>
          You currently have <b>{snippetsCount} snippets</b> in your database.
        </p>
        <p>
          Do you want to delete them and re-seed the database with{" "}
          <b>{defaultSnippetsCount} default snippets</b>?
        </p>
        <div className="mt-4 text-right">
          <Link
            to="/"
            className="mr-2 inline-block rounded bg-blue-700 px-3 py-1 font-bold text-white hover:bg-blue-800"
          >
            No
          </Link>
          <Form method="post" className="inline-block">
            <button
              type="submit"
              name="_action"
              value="seed"
              className="rounded bg-red-600 px-3 py-1 font-bold text-white hover:bg-red-700"
            >
              Yes
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
