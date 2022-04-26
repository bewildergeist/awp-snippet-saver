import {
  Form,
  json,
  Link,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import bcrypt from "bcryptjs";
import { getSession, commitSession } from "~/sessions.server.js";
import connectDb from "~/db/connectDb.server.js";

export async function action({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const db = await connectDb();
  const form = await request.formData();

  const user = await db.models.User.findOne({
    username: form.get("username").trim(),
  });

  let isCorrectPassword = false;

  if (user) {
    isCorrectPassword = await bcrypt.compare(
      form.get("password").trim(),
      user.password
    );
  }

  if (user && isCorrectPassword) {
    session.set("userId", user._id);
    // TODO: redirect somewhere else
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } else {
    return json(
      { errorMessage: "User not found or password didn't match" },
      { status: 401 }
    );
  }
}

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  return json({
    userId: session.get("userId"),
  });
}

export default function Login() {
  const { userId } = useLoaderData();
  const actionData = useActionData();

  if (userId) {
    return (
      <div>
        <p>You are already logged in as user id {userId}.</p>
        <Link to="/" className="underline">
          Go home
        </Link>
        <Form method="post" action="/logout">
          <button type="submit" className="my-3 p-2 border rounded">
            Logout
          </button>
        </Form>
      </div>
    );
  }
  return (
    <div className="m-3">
      <h2>Log in</h2>
      {actionData?.errorMessage ? (
        <p className="text-red-500 font-bold my-3">{actionData.errorMessage}</p>
      ) : null}
      <Form method="post" className="text-inherit">
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Username"
          className="block my-3 border rounded px-2 py-1 w-full lg:w-1/2 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
        />
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          className="block my-3 border rounded px-2 py-1 w-full lg:w-1/2 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
        />
        <button type="submit" className="my-3 p-2 border rounded">
          Log in
        </button>
      </Form>
    </div>
  );
}
