"use client";

import { cloneElement, isValidElement, useEffect, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";

type DocsCodeBlockProps = {
  children: ReactNode;
  className?: string;
  code: string;
  language?: string;
  isSingleLine: boolean;
  ver?: string;
} & Omit<ComponentPropsWithoutRef<"pre">, "children">;

const formatLanguageLabel = (language: string) => language.replace(/[-_]/g, " ").toUpperCase();

function getNodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join("");
  }

  if (node && typeof node === "object" && "props" in node) {
    const withProps = node as { props?: { children?: ReactNode } };
    return getNodeText(withProps.props?.children ?? "");
  }

  return "";
}

function splitConfigLines(lines: string[]) {
  if (lines.length <= 1) {
    return { left: lines, right: [] as string[] };
  }

  const left: string[] = [];
  const right: string[] = [];
  let leftWeight = 0;
  let rightWeight = 0;

  lines.forEach((line, index) => {
    const remaining = lines.length - index;

    if (left.length === 0) {
      left.push(line);
      leftWeight += line.length;
      return;
    }

    if (right.length === 0) {
      right.push(line);
      rightWeight += line.length;
      return;
    }

    if (left.length > right.length && left.length - right.length >= remaining) {
      right.push(line);
      rightWeight += line.length;
      return;
    }

    if (right.length > left.length && right.length - left.length >= remaining) {
      left.push(line);
      leftWeight += line.length;
      return;
    }

    if (leftWeight <= rightWeight) {
      left.push(line);
      leftWeight += line.length;
      return;
    }

    right.push(line);
    rightWeight += line.length;
  });

  return { left, right };
}

function trimCodeBlockChildren(children: ReactNode) {
  if (!isValidElement<{ children?: ReactNode; className?: string }>(children)) {
    return children;
  }

  const rawChildren = children.props.children;
  const normalizedClassName = [
    children.props.className,
    "m-0 block border-0 bg-transparent p-0 text-inherit before:content-none after:content-none",
  ]
    .filter(Boolean)
    .join(" ");

  if (typeof rawChildren === "string") {
    return cloneElement(children, {
      className: normalizedClassName,
      children: rawChildren.replace(/^\n+|\n+$/g, ""),
    });
  }

  if (Array.isArray(rawChildren)) {
    const normalizedChildren = rawChildren
      .map((child, index) => {
        if (typeof child !== "string") return child;
        if (index === 0) return child.replace(/^\n+/, "");
        if (index === rawChildren.length - 1) return child.replace(/\n+$/, "");
        return child;
      })
      .filter(
        (child, index, array) =>
          !(typeof child === "string" && child.length === 0 && (index === 0 || index === array.length - 1))
      );

    return cloneElement(children, {
      className: normalizedClassName,
      children: normalizedChildren,
    });
  }

  return cloneElement(children, {
    className: normalizedClassName,
  });
}

export default function DocsCodeBlock({
  children,
  className,
  code,
  language,
  isSingleLine,
  ver,
  ...props
}: DocsCodeBlockProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const nonEmptyLines = code
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const isCompactLanguage = language === "flow";
  const isConfigLanguage = language === "config";
  const isCompactBlock =
    !isSingleLine && nonEmptyLines.length > 0 && (isCompactLanguage || nonEmptyLines.length <= 6);
  const configColumns = splitConfigLines(nonEmptyLines);
  const headerPaddingXClassName = ver === "digital_sutie" ? "px-[17px]" : "px-[9px]";
  const bodyPaddingXClassName = ver === "digital_sutie" ? "px-[19.5px]" : "px-[9px]";
  const codeInsetClassName =
    ver === "digital_sutie" ? "[&>code]:mt-1.5 [&>code]:pb-2.5" : "[&>code]:mt-0.5 [&>code]:pb-1.5";

  useEffect(() => {
    if (copyState !== "copied") return;
    const timeout = window.setTimeout(() => setCopyState("idle"), 1600);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  useEffect(() => {
    if (!ver) return;
    console.log("DocsCodeBlock ver:", ver);
  }, [ver]);

  if (!language) {
    return (
      <pre
        {...props}
        className={[
          className,
          "max-h-[280px] overflow-y-auto rounded-lg border border-slate-300/80 bg-white/70 text-[12px] leading-5 text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.05)] [&>code]:m-0 [&>code]:block [&>code]:pt-0 [&>code]:pb-1 [&>code]:px-0",
          isSingleLine ? "!py-0.5" : "!py-1",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </pre>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("idle");
    }
  };

  return (
    <div
      className={[
        isConfigLanguage ? "mx-1" : "mx-3",
        "my-2.5 overflow-hidden rounded-xl border border-slate-300/80 bg-white/70 text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.05)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          `flex items-center justify-between gap-3 border-b border-slate-300/80 ${headerPaddingXClassName}`,
          isCompactBlock ? "py-0.5 min-h-8" : "py-1 min-h-9",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {formatLanguageLabel(language)}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <span>{copyState === "copied" ? "Copied" : "Copy"}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M9 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V9Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>
      {isConfigLanguage ? (
        <div
          className={[
            className,
            `bg-transparent ${bodyPaddingXClassName} pb-3.5 pt-0 text-[12.5px] leading-[1.9] text-slate-900`,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            <div className="space-y-1">
              {configColumns.left.map((line, index) => (
                <div key={`config-line-left-${index}`} className="font-mono whitespace-pre-wrap break-words">
                  {line}
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {configColumns.right.map((line, index) => (
                <div key={`config-line-right-${index}`} className="font-mono whitespace-pre-wrap break-words">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <pre
          {...props}
          className={[
            className,
            `m-0 overflow-x-hidden overflow-y-auto bg-transparent ${bodyPaddingXClassName} text-[12.5px] text-slate-900 [&>code]:m-0 ${codeInsetClassName} [&>code]:block [&>code]:px-0 [&>code]:whitespace-pre-wrap [&>code]:break-words`,
            isCompactBlock ? "max-h-[162px] leading-[1.5] !pb-0.5" : "max-h-[162px] leading-[1.45]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </pre>
      )}
    </div>
  );
}

export function DocsMdxPre({
  children,
  ver = "engineering_notes",
  ...props
}: ComponentPropsWithoutRef<"pre"> & { ver?: string }) {
  const rawCode = getNodeText(children ?? "").trim();
  const isSingleLine = rawCode.length > 0 && !rawCode.includes("\n");
  const normalizedChildren = trimCodeBlockChildren(children);
  const codeClassName =
    isValidElement<{ className?: string }>(children) && typeof children.props.className === "string"
      ? children.props.className
      : "";
  const languageMatch = /(?:^|\s)language-([a-zA-Z0-9_-]+)/.exec(codeClassName);
  const language = languageMatch?.[1]?.trim() || "";

  return (
    <DocsCodeBlock
      {...props}
      className={props.className}
      code={rawCode}
      language={language}
      isSingleLine={isSingleLine}
      ver={ver}
    >
      {normalizedChildren}
    </DocsCodeBlock>
  );
}

export function DocsSectionMdxPre(props: ComponentPropsWithoutRef<"pre">) {
  return <DocsMdxPre {...props} ver="digital_sutie" />;
}
