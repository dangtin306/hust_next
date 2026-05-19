"use client";

type TocItem = {
  id: string;
  title: string;
  depth: 2 | 3;
};

type TocNavClientProps = {
  items: TocItem[];
};

export default function TocNavClient({ items }: TocNavClientProps) {
  const scrollToHeading = (id: string) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;

    const getScrollParent = (node: HTMLElement) => {
      let parent = node.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        const canScrollY =
          /(auto|scroll|overlay)/.test(style.overflowY) &&
          parent.scrollHeight > parent.clientHeight;
        if (canScrollY) return parent;
        parent = parent.parentElement;
      }
      return document.scrollingElement || document.documentElement;
    };

    const scrollParent = getScrollParent(el);
    if (
      scrollParent === document.documentElement ||
      scrollParent === document.body ||
      scrollParent === document.scrollingElement
    ) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 55;
      window.scrollTo({ top, behavior: "smooth" });
      return;
    }

    const parentRect = scrollParent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const top = scrollParent.scrollTop + (elRect.top - parentRect.top) - 20;
    scrollParent.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="max-lg:mt-3 lg:mt-5 space-y-1.5 sm:mt-4">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => scrollToHeading(item.id)}
          className="block w-full rounded-lg border border-blue-100/80 bg-blue-200/60 px-3 py-1.5 text-left text-sm font-medium text-black transition hover:border-blue-400/90 hover:bg-blue-300/65 sm:py-2"
        >
          {item.title}
        </button>
      ))}
    </div>
  );
}
