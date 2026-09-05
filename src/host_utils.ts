const LAN_HOST_PATTERN = /^192\.168\.1\.(\d{1,3})$/;

export const isLanHost = (hostname: string) => {
  const value = String(hostname || "").trim().toLowerCase();
  const match = LAN_HOST_PATTERN.exec(value);
  return Boolean(match && Number(match[1]) >= 0 && Number(match[1]) <= 255);
};

export const isLocalHost = (hostname: string) => {
  const value = String(hostname || "").trim().toLowerCase();
  return value === "localhost" || value === "127.0.0.1" || value === "::1" || isLanHost(value);
};

export const isLocalHostHeader = (host: string) => {
  const value = String(host || "").split(",")[0].trim().toLowerCase();
  const hostname = value.startsWith("[")
    ? value.slice(1, value.indexOf("]"))
    : value.replace(/:\d+$/, "");
  return isLocalHost(hostname);
};
