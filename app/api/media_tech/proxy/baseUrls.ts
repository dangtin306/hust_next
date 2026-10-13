function cleanBase(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function stripSuffix(value: string, suffix: string): string {
  return value.replace(new RegExp(`/${suffix}/?$`, "i"), "");
}

/** Accept either an origin or an origin already ending in /openclaw. */
export function normalizeOpenClawBaseUrl(value: string): string {
  const clean = cleanBase(value);
  return /\/openclaw$/i.test(clean) ? clean : `${clean}/openclaw`;
}

/** Normalize Laravel targets to the API root, regardless of known URL suffixes. */
export function normalizeLaravelApiBaseUrl(value: string): string {
  let clean = cleanBase(value);
  for (const suffix of ["api/openclaw", "api/chat", "openclaw", "api"]) {
    clean = stripSuffix(clean, suffix);
  }
  return `${clean}/api`;
}

export function normalizeLaravelChatBaseUrl(value: string): string {
  const clean = cleanBase(value);
  if (/\/api\/chat$/i.test(clean)) return clean;
  return `${normalizeLaravelApiBaseUrl(clean)}/chat`;
}
