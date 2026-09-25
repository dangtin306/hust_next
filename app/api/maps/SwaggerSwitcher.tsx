import Link from "next/link";

export default function SwaggerSwitcher({
  active,
}: {
  active: "home" | "openclaw" | "laravel" | "n8n" | "git_auto" | "git_test" | "gitea_test" | "chat_test";
}) {
  const clearSwaggerHash = () => {
    if (typeof window !== "undefined") {
      if (window.location.hash) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  };

  return (
    <nav
      aria-label="Swagger documentation"
      className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm sm:p-3"
    >
      <Link
        href="/api/swagger/home"
        onClick={clearSwaggerHash}
        className={`rounded-md border px-2 py-2 text-sm font-semibold transition sm:px-4 ${
          active === "home"
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
        }`}
      >
        Home
      </Link>
      <span className="mr-2 text-sm font-semibold text-slate-600">
        API documentation:
      </span>
      <Link
        href="/api/swagger/laravel"
        onClick={clearSwaggerHash}
        className={`rounded-md border px-2 py-2 text-sm font-semibold transition sm:px-4 ${
          active === "laravel"
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
        }`}
      >
        Laravel
      </Link>
      <Link
        href="/api/swagger/openclaw"
        onClick={clearSwaggerHash}
        className={`rounded-md border px-2 py-2 text-sm font-semibold transition sm:px-4 ${
          active === "openclaw"
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
        }`}
      >
        OpenClaw
      </Link>
      <Link
        href="/api/swagger/chat_test"
        prefetch
        onClick={clearSwaggerHash}
        className={`rounded-md border px-2 py-2 text-sm font-semibold transition sm:px-4 ${
          active === "chat_test"
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
        }`}
      >
        Chat Test
      </Link>
      <Link
        href="/api/swagger/n8n"
        prefetch
        onClick={clearSwaggerHash}
        className={`rounded-md border px-2 py-2 text-sm font-semibold transition sm:px-4 ${
          active === "n8n"
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
        }`}
      >
        Workflow
      </Link>
      <Link
        href="/api/swagger/git_auto"
        prefetch
        onClick={clearSwaggerHash}
        className={`rounded-md border px-2 py-2 text-sm font-semibold transition sm:px-4 ${
          active === "git_auto"
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
        }`}
      >
        Git Auto
      </Link>
      <Link
        href="/api/swagger/git_test"
        prefetch
        onClick={clearSwaggerHash}
        className={`rounded-md border px-2 py-2 text-sm font-semibold transition sm:px-4 ${
          active === "git_test"
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
        }`}
      >
        Git Test
      </Link>
      <Link
        href="/api/swagger/gitea_test"
        prefetch
        onClick={clearSwaggerHash}
        className={`rounded-md border px-2 py-2 text-sm font-semibold transition sm:px-4 ${
          active === "gitea_test"
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
        }`}
      >
        Gitea Test
      </Link>
    </nav>
  );
}
