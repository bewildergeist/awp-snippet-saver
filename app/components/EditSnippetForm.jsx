import { Form } from "@remix-run/react";

export default function EditSnippetForm({
  action,
  errors,
  defaultValues,
  submittedValues,
}) {
  return (
    <Form method="post" action={action}>
      <Input
        name="title"
        label="Title"
        defaultValue={submittedValues?.title ?? defaultValues?.title}
        errorMessage={errors?.title?.message}
      />

      <Input
        type="textarea"
        name="code"
        label="Code"
        defaultValue={submittedValues?.code ?? defaultValues?.code}
        errorMessage={errors?.code?.message}
      />
      <div className="my-3">
        <FormLabel htmlFor="programmingLanguage">
          Programming language
        </FormLabel>
        <select
          name="programmingLanguage"
          defaultValue={
            submittedValues?.programmingLanguage ??
            defaultValues?.programmingLanguage
          }
          className="appearance-none border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {["HTML", "CSS", "JavaScript"].map((lang) => {
            return <option key={lang}>{lang}</option>;
          })}
        </select>
      </div>
      <Input
        type="textarea"
        name="description"
        label="Description"
        defaultValue={
          submittedValues?.description ?? defaultValues?.description
        }
        errorMessage={errors?.description?.message}
      />

      {Object.keys(errors ?? {}).length > 0 && (
        <ul className="mt-3 list-inside list-disc rounded border border-red-500 bg-red-100 p-3 text-red-500">
          {Object.entries(errors).map(([key, value]) => (
            <li key={key}>
              <b>{key}:</b> {value.properties.message}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3">
        <Button type="submit">Save</Button>
      </div>
    </Form>
  );
}

function Button({ type = "button", children }) {
  return (
    <button
      type={type}
      className="rounded border border-zinc-300 bg-zinc-300 px-4 py-2 font-bold text-inherit transition-colors hover:bg-zinc-400 dark:border-zinc-700 dark:bg-zinc-600 dark:hover:bg-zinc-700"
    >
      {children}
    </button>
  );
}

function Input({
  name,
  id = name,
  type = "text",
  label = name,
  defaultValue,
  errorMessage,
}) {
  const inputProps = {
    name: name,
    defaultValue: defaultValue,
    id: id,
    className: [
      "border rounded px-2 py-1 w-full lg:w-1/2 bg-white dark:bg-zinc-900",
      errorMessage ? "border-red-500" : "border-zinc-300 dark:border-zinc-700",
    ]
      .filter(Boolean)
      .join(" "),
  };

  return (
    <div className="my-3">
      <FormLabel>{label}</FormLabel>
      {type === "textarea" ? (
        <textarea {...inputProps} rows={10}></textarea>
      ) : (
        <input type={type} {...inputProps} />
      )}
      {errorMessage && <p className="mt-1 text-red-500">{errorMessage}</p>}
    </div>
  );
}

function FormLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block font-semibold">
      {children}
    </label>
  );
}
