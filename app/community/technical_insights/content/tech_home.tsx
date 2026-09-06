"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TechnicalInsightPost } from "../tech_api_data";
import TechContent from "./tech_content";
import TechProcess from "./tech_process";

type TechHomeProps = { initialPost: TechnicalInsightPost; initialLang: string };
type TocItem = { id: string; text: string };

const normalizeLeadingArticleHtml = (html: string) => {
  let normalized = String(html || "").replace(/^\uFEFF+/, "").trimStart();
  const pattern = /^(?:<(?:br)\s*\/?\s*>|<(?:(?:p|div|span))\b[^>]*>(?:\s|&nbsp;|&#160;|<br\s*\/?\s*>)*<\/(?:p|div|span)>)+/i;
  while (pattern.test(normalized)) normalized = normalized.replace(pattern, "").trimStart();
  return normalized;
};

export default function TechHome({ initialPost, initialLang }: TechHomeProps) {
  const [post] = useState(initialPost);
  const [lang, setLang] = useState(initialLang === "vi" ? "vi" : "en");
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [helpfulVote, setHelpfulVote] = useState<"" | "yes" | "no">("");
  const articleRef = useRef<HTMLElement | null>(null);
  const articleHtml = useMemo(() => normalizeLeadingArticleHtml(post.content), [post.content]);
  const likeStorageKey = `liked_article_${post.uri}`;

  useEffect(() => { const syncLang = () => { const match = document.cookie.split("; ").find((item) => item.startsWith("national_market=")); const value = match ? decodeURIComponent(match.split("=")[1]) : initialLang; setLang(value === "vi" ? "vi" : "en"); }; syncLang(); window.addEventListener("focus", syncLang); return () => window.removeEventListener("focus", syncLang); }, [initialLang]);
  useEffect(() => { const timer = window.setTimeout(() => { try { setIsLiked(window.localStorage.getItem(likeStorageKey) === "true"); } catch { setIsLiked(false); } }, 0); return () => window.clearTimeout(timer); }, [likeStorageKey]);
  useEffect(() => { const root = articleRef.current; if (!root) return; const headings = Array.from(root.querySelectorAll("h2, h3")).map((node, index) => { const text = (node.textContent || "").trim(); if (!text) return null; const id = `technical-insight-heading-${index}`; node.id = id; return { id, text }; }).filter((item): item is TocItem => Boolean(item)); setTocItems(headings); }, [articleHtml]);

  const scrollToHeading = (id: string) => { const element = document.getElementById(id); if (!element) return; setActiveTocId(id); window.scrollTo({ top: element.getBoundingClientRect().top + window.pageYOffset - 55, behavior: "smooth" }); };
  const handleToggleLike = () => setIsLiked((previous) => { const next = !previous; try { window.localStorage.setItem(likeStorageKey, String(next)); } catch { /* Ignore storage failures. */ } return next; });
  const handleShare = async () => { try { await navigator.share({ title: post.title, text: post.description, url: window.location.href }); } catch { /* Ignore cancelled or unsupported share actions. */ } };

  return <article className="mx-auto mt-4 w-full max-w-[1320px] overflow-x-hidden px-2 pb-8 pt-3 lg:mt-4 lg:px-8 xl:px-12" style={{ ["--tool-col" as string]: "clamp(215px, 21.5vw, 280px)" }}><div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-start"><TechProcess tocItems={tocItems} activeTocId={activeTocId} onSelect={scrollToHeading} relatedPosts={post.relatedPosts} activeUri={post.uri} /><div className="min-w-0 flex-1"><TechContent post={post} lang={lang} articleHtml={articleHtml} articleRef={articleRef} isLiked={isLiked} onToggleLike={handleToggleLike} onShare={handleShare} /><div className="mt-3 mb-4 rounded-2xl border border-slate-200/80 bg-white/85 p-3 shadow-lg ring-1 ring-black/5 backdrop-blur-md"><div className="mx-4">{helpfulVote ? <div className="text-sm font-medium text-slate-700">{helpfulVote === "yes" ? "Thank you for your feedback! We're glad you found this helpful." : "Thank you for your feedback! We'll work on improving our content."}</div> : <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="text-base font-semibold text-slate-800">Was this content helpful to you?</div><div className="flex items-center gap-2"><button type="button" onClick={() => setHelpfulVote("yes")} className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-lg border border-slate-400/70 bg-white px-4 text-base font-medium text-blue-700 transition hover:bg-slate-50">Yes</button><button type="button" onClick={() => setHelpfulVote("no")} className="inline-flex h-9 min-w-[88px] items-center justify-center rounded-lg border border-slate-400/70 bg-white px-4 py-2 text-base font-medium text-blue-700 transition hover:bg-slate-50">No</button></div></div>}</div></div></div></div></article>;
}
