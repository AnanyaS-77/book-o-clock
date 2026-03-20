const normalizeUrl = (value?: string) => value?.trim().replace(/\/+$/, "");

export const apiBaseUrl =
  normalizeUrl(import.meta.env.VITE_API_BASE_URL) || "http://127.0.0.1:8000";

export const siteUrl = normalizeUrl(import.meta.env.VITE_SITE_URL);

export const getAppOrigin = () => {
  if (siteUrl) {
    return siteUrl;
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return normalizeUrl(window.location.origin) || window.location.origin;
  }

  return "";
};
