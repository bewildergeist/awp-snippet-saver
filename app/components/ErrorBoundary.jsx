export default function ErrorBoundary({ error }) {
  return (
    <h1 className="font-bold text-red-500">
      {error.name}: {error.message}
    </h1>
  );
}
