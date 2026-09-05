"use client";

import { useEffect } from "react";
import uriConfig from "./uri_config.json";
import { isLocalHost } from "./host_utils";

type RewriteRule = {
  source: string;
  destination: string;
};

type RouteTree = {
  [key: string]: RewriteRule | RouteTree;
};

const isRewriteRule = (value: RewriteRule | RouteTree): value is RewriteRule =>
  "source" in value && "destination" in value;

const flattenRoutes = (tree: RouteTree): RewriteRule[] =>
  Object.values(tree).flatMap((route) =>
    isRewriteRule(route) ? [route] : flattenRoutes(route),
  );

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sourceToRegExp = (source: string) => {
  const pattern = source
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        return segment.endsWith("*") ? ".*" : "[^/]+";
      }
      return escapeRegExp(segment);
    })
    .join("/");

  return new RegExp(`^${pattern}/?$`);
};

const configuredUriPatterns = flattenRoutes(uriConfig.routes as RouteTree).map(
  (route) => sourceToRegExp(route.source),
);

const getAppPathname = (pathname: string) => {
  const basePath = uriConfig.basePath || "";
  if (basePath && (pathname === basePath || pathname.startsWith(`${basePath}/`))) {
    return pathname.slice(basePath.length) || "/";
  }
  return pathname;
};

const isConfiguredUri = (pathname: string) =>
  configuredUriPatterns.some((pattern) => pattern.test(getAppPathname(pathname)));

export default function LocalhostLegacyLinkRedirector() {
  useEffect(() => {
    if (!isLocalHost(window.location.hostname)) return undefined;

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const destination = new URL(href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (isConfiguredUri(destination.pathname)) return;

      event.preventDefault();
      event.stopPropagation();

      const legacyUrl = new URL(`http://${window.location.hostname}:3002${getAppPathname(destination.pathname)}`);
      legacyUrl.search = destination.search;
      legacyUrl.hash = destination.hash;
      window.location.assign(legacyUrl.toString());
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
