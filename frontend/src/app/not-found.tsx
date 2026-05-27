import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">404</p>
        <h1 className="mt-4 text-4xl font-semibold">Page not found</h1>
        <p className="mt-4 text-zinc-400">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
