import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import uriConfig from "./src/uri_config.json";

const NEXT_BASE_PATH = uriConfig.basePath;
const LOCALE_SEGMENT_REGEX = new RegExp(uriConfig.locale.segmentPattern);
const MARKET_COOKIE = uriConfig.locale.cookieName;
const ONE_YEAR_SECONDS = uriConfig.locale.cookieMaxAgeSeconds;

const extractLocaleRewrite = (pathname: string) => {
  const hasBasePath =
    pathname === NEXT_BASE_PATH || pathname.startsWith(`${NEXT_BASE_PATH}/`);
  const normalizedPath = hasBasePath
    ? pathname.slice(NEXT_BASE_PATH.length) || "/"
    : pathname;

  const segments = normalizedPath.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const locale = segments[0];
  if (!LOCALE_SEGMENT_REGEX.test(locale)) return null;

  const nextSegments = segments.slice(1);
  const localizedPath = `/${nextSegments.join("/")}`.replace(/\/+$/, "") || "/";
  const rewrittenPathname = hasBasePath
    ? `${NEXT_BASE_PATH}${localizedPath === "/" ? "" : localizedPath}`
    : localizedPath;

  return {
    locale: locale.toLowerCase(),
    rewrittenPathname,
  };
};

export function proxy(request: NextRequest) {
  const rewriteInfo = extractLocaleRewrite(request.nextUrl.pathname);
  if (!rewriteInfo) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = rewriteInfo.rewrittenPathname;

  const response = NextResponse.rewrite(url);
  response.cookies.set(MARKET_COOKIE, rewriteInfo.locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/:path*"],
};
