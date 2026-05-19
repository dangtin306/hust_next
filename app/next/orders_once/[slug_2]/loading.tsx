export default function Loading() {
  return (
    <article
      className="mx-auto mt-4 w-full max-w-[1320px] overflow-x-hidden px-2 pb-8 pt-3 lg:mt-4 lg:px-8 xl:px-12"
      style={{ ["--tool-col" as string]: "clamp(215px, 21.5vw, 280px)" }}
    >
      <div className="rounded-3xl border border-slate-200/70 bg-white/85 px-4 py-16 shadow-2xl ring-1 ring-black/5 backdrop-blur-md">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
      </div>
    </article>
  );
}
