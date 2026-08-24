import Link from "next/link";

export default function SwaggerSwitcher({ active }: { active: "openclaw" | "laravel" }) {
  return (
    <nav
      aria-label="Swagger documentation"
      className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      <span className="mr-2 text-sm font-semibold text-slate-600">API documentation:</span>
      <Link
        href="/api/swagger/laravel"
        className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
          active === "laravel"
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
        }`}
      >
        Laravel
      </Link>
      <Link
        href="/api/swagger/openclaw"
        className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
          active === "openclaw"
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
        }`}
      >
        OpenClaw
      </Link>
    </nav>
  );
}
